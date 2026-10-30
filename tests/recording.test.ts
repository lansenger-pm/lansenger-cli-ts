import { Command } from "commander";

// Mock getClient so no real API calls happen; keep the high-risk gate and
// error handling real so exit codes are exercised end-to-end.
const mockFetchSmartRecordingList = jest.fn();
const mockFetchSmartRecordingDetail = jest.fn();
const mockCreateTranscriptionTask = jest.fn();
const mockCreateSummaryTask = jest.fn();
const mockFetchSmartRecordingTags = jest.fn();
const mockFetchSmartRecordingTemplates = jest.fn();

let mockJsonOutput = false;

jest.mock("../src/utils", () => ({
  __esModule: true,
  get jsonOutput() { return mockJsonOutput; },
  getClient: jest.fn(() => ({
    fetchSmartRecordingList: mockFetchSmartRecordingList,
    fetchSmartRecordingDetail: mockFetchSmartRecordingDetail,
    createSmartRecordingTranscriptionTask: mockCreateTranscriptionTask,
    createSmartRecordingSummaryTask: mockCreateSummaryTask,
    fetchSmartRecordingTags: mockFetchSmartRecordingTags,
    fetchSmartRecordingTemplates: mockFetchSmartRecordingTemplates,
  })),
  outputResult: jest.fn(),
  outputList: jest.fn(),
  checkError: jest.requireActual("../src/utils").checkError,
  confirmHighRisk: jest.requireActual("../src/utils").confirmHighRisk,
  parseJsonOption: jest.requireActual("../src/utils").parseJsonOption,
  setJsonOutput: jest.fn(),
}));

import { registerRecordingCommands } from "../src/commands/recording";
import { outputResult, outputList } from "../src/utils";

const mockOutputResult = outputResult as jest.Mock;
const mockOutputList = outputList as jest.Mock;

const realExit = process.exit;

/** Parse argv through a real program; capture process.exit code (exitOverride throws). */
async function parseExit(program: Command, argv: string[]): Promise<number | null> {
  let exitCode: number | null = null;
  const origErr = console.error;
  const origLog = console.log;
  console.error = jest.fn();
  console.log = jest.fn();
  (process.exit as any) = (code: number) => {
    exitCode = code;
    throw new Error(`__EXIT_${code}__`);
  };
  program.exitOverride();
  try {
    await program.parseAsync(argv, { from: "user" });
  } catch (e: any) {
    if (!String(e?.message || "").startsWith("__EXIT_")) {
      // commander's own exitOverride errors (e.g. --help) carry .exitCode
      if (e && typeof e.exitCode === "number") exitCode = e.exitCode;
      else throw e;
    }
  } finally {
    process.exit = realExit;
    console.error = origErr;
    console.log = origLog;
  }
  return exitCode;
}

function build(json = false): Command {
  mockJsonOutput = json;
  const program = new Command();
  program.option("-j, --json", "Output as JSON", false);
  registerRecordingCommands(program);
  return program;
}

const sampleRecording = {
  recordingId: "13107200-VyueOtJzjW8jtoEygvmtomXWWigMjYEL",
  name: "周会录音",
  sn: "SN-001",
  deviceName: "会议室A",
  duration: 3600000,
  state: 1,
  convertState: 4,
  summaryState: 2,
  chapterState: 1,
  createTime: 1792721267905694,
  modifyTime: 1792721269905694,
  tagIds: ["13107200-GguRjIWne2J7t28KziwwPYsreBrA"],
  templateId: "13107200-9f2c1a7b3d4e5f60718293a4b5c6d7e8",
  recordingMarker: "W10=",
  audioId: "13107200-a1b2c3d4e5f60718293a4b5c6d7e8f90",
  transcriptionId: "13107200-b2c3d4e5f60718293a4b5c6d7e8f90a1",
  summaryId: "13107200-c3d4e5f60718293a4b5c6d7e8f90a1b2",
  hasAudio: true,
  hasTranscription: true,
  hasSummary: true,
  hasChapters: false,
};

const listResult = {
  success: true,
  recordings: [sampleRecording],
  total: 1,
  hasMore: false,
  toDict() {
    return { success: this.success, recordings: this.recordings, total: this.total, hasMore: this.hasMore };
  },
};

const detailResult = {
  success: true,
  recording: sampleRecording,
  toDict() {
    return { success: this.success, recording: this.recording };
  },
};

const tagsResult = {
  success: true,
  tags: [
    { tagId: "13107200-GguRjIWne2J7t28KziwwPYsreBrA", name: "重要", sortWeight: 1.5, createTime: 1792723022895610, modifyTime: 1792723022895610 },
  ],
  toDict() {
    return { success: this.success, tags: this.tags };
  },
};

const templatesResult = {
  success: true,
  templates: [
    { templateId: "13107200-9f2c1a7b3d4e5f60718293a4b5c6d7e8", name: "周报模板", templateState: 1, createTime: 1776325970573082 },
  ],
  total: 1,
  hasMore: false,
  toDict() {
    return { success: this.success, templates: this.templates, total: this.total, hasMore: this.hasMore };
  },
};

const transcriptionResult = {
  success: true,
  recordingId: sampleRecording.recordingId,
  convertState: 5,
  toDict() {
    return { success: this.success, recordingId: this.recordingId, convertState: this.convertState };
  },
};

const summaryResult = {
  success: true,
  recordingId: sampleRecording.recordingId,
  summaryState: 5,
  toDict() {
    return { success: this.success, recordingId: this.recordingId, summaryState: this.summaryState };
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockJsonOutput = false;
  mockFetchSmartRecordingList.mockResolvedValue(listResult);
  mockFetchSmartRecordingDetail.mockResolvedValue(detailResult);
  mockCreateTranscriptionTask.mockResolvedValue(transcriptionResult);
  mockCreateSummaryTask.mockResolvedValue(summaryResult);
  mockFetchSmartRecordingTags.mockResolvedValue(tagsResult);
  mockFetchSmartRecordingTemplates.mockResolvedValue(templatesResult);
});

describe("recording command group", () => {
  test("registers recording group with all six subcommands", () => {
    const program = build();
    const cmd = program.commands.find(c => c.name() === "recording");
    expect(cmd).toBeDefined();
    expect(cmd!.commands.map(c => c.name()).sort()).toEqual(
      ["detail", "list", "summary", "tags", "templates", "transcribe"],
    );
  });

  test("list exposes --page/--page-size/--user-token", () => {
    const sub = build().commands.find(c => c.name() === "recording")!.commands.find(c => c.name() === "list")!;
    const flags = sub.options.map(o => o.long);
    expect(flags).toEqual(expect.arrayContaining(["--page", "--page-size", "--user-token"]));
  });

  test("detail takes a recordingId argument", () => {
    const sub = build().commands.find(c => c.name() === "recording")!.commands.find(c => c.name() === "detail")!;
    expect(sub.registeredArguments.map((a: any) => a.name())).toEqual(["recordingId"]);
  });

  test("transcribe/summary expose --yes/--dry-run high-risk flags", () => {
    const cmd = build().commands.find(c => c.name() === "recording")!;
    for (const name of ["transcribe", "summary"]) {
      const flags = cmd.commands.find(c => c.name() === name)!.options.map(o => o.long);
      expect(flags).toContain("--yes");
      expect(flags).toContain("--dry-run");
    }
  });

  test("summary exposes optional --template-id", () => {
    const sub = build().commands.find(c => c.name() === "recording")!.commands.find(c => c.name() === "summary")!;
    expect(sub.options.map(o => o.long)).toContain("--template-id");
  });
});

describe("recording list", () => {
  test("calls fetchSmartRecordingList with page options and prints a table", async () => {
    const code = await parseExit(build(), ["recording", "list", "--page", "3", "--page-size", "5", "--user-token", "ut"]);
    expect(code).toBe(null);
    expect(mockFetchSmartRecordingList).toHaveBeenCalledWith({ page: 3, pageSize: 5, user_token: "ut" });
    expect(mockOutputList).toHaveBeenCalledTimes(1);
    const [items, head, rowFn] = mockOutputList.mock.calls[0];
    expect(items).toEqual([sampleRecording]);
    expect(head).toEqual([
      "recording_id", "name", "duration(ms)", "state", "convert_state", "summary_state", "create_time",
    ]);
    expect(rowFn(sampleRecording)).toEqual([
      "13107200-VyueOtJzjW8jtoEygvmtomXWWigMjYEL", "周会录音", "3600000", "1", "4", "2", "1792721267905694",
    ]);
  });

  test("defaults to page=1 page-size=20", async () => {
    const code = await parseExit(build(), ["recording", "list"]);
    expect(code).toBe(null);
    expect(mockFetchSmartRecordingList).toHaveBeenCalledWith({ page: 1, pageSize: 20, user_token: undefined });
  });

  test("--json prints the full result and no table", async () => {
    const code = await parseExit(build(true), ["recording", "list", "--json"]);
    expect(code).toBe(null);
    expect(mockOutputResult).toHaveBeenCalledWith(listResult);
    expect(mockOutputList).not.toHaveBeenCalled();
  });

  test("API failure exits 1", async () => {
    mockFetchSmartRecordingList.mockResolvedValueOnce({ success: false, error: "invalid user_token" });
    const code = await parseExit(build(), ["recording", "list"]);
    expect(code).toBe(1);
    expect(mockOutputList).not.toHaveBeenCalled();
  });
});

describe("recording detail", () => {
  test("prints every field, shows '-' for missing and keeps false", async () => {
    mockFetchSmartRecordingDetail.mockResolvedValueOnce({
      success: true,
      recording: { ...sampleRecording, name: undefined, sn: undefined, sn2: undefined, hasTranscription: false },
      toDict() { return { success: this.success, recording: this.recording }; },
    });
    const code = await parseExit(build(), ["recording", "detail", sampleRecording.recordingId]);
    expect(code).toBe(null);
    expect(mockFetchSmartRecordingDetail).toHaveBeenCalledWith({
      recordingId: sampleRecording.recordingId, user_token: undefined,
    });
    const [items, head, rowFn] = mockOutputList.mock.calls[0];
    expect(head).toEqual(["Field", "Value"]);
    expect(items).toContain("recordingId");
    expect(items).toContain("hasChapters");
    expect(items).toContain("createTime");
    expect(items.length).toBe(23);
    // missing field renders "-", boolean false renders "false", arrays render JSON
    expect(rowFn("name")).toEqual(["name", "-"]);
    expect(rowFn("hasTranscription")).toEqual(["hasTranscription", "false"]);
    expect(rowFn("tagIds")).toEqual(["tagIds", JSON.stringify(sampleRecording.tagIds)]);
    expect(rowFn("recordingId")).toEqual(["recordingId", sampleRecording.recordingId]);
  });

  test("missing data.recording prints the result", async () => {
    mockFetchSmartRecordingDetail.mockResolvedValueOnce({
      success: true, recording: null,
      toDict() { return { success: this.success }; },
    });
    const code = await parseExit(build(), ["recording", "detail", "r-missing"]);
    expect(code).toBe(null);
    expect(mockOutputResult).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }), undefined, "Recording Detail",
    );
    expect(mockOutputList).not.toHaveBeenCalled();
  });

  test("--json prints the full result", async () => {
    const code = await parseExit(build(true), ["recording", "detail", sampleRecording.recordingId, "--json"]);
    expect(code).toBe(null);
    expect(mockOutputResult).toHaveBeenCalledWith(detailResult);
    expect(mockOutputList).not.toHaveBeenCalled();
  });
});

describe("recording transcribe high-risk gate", () => {
  test("without --yes exits 10 and calls no API", async () => {
    const code = await parseExit(build(), ["recording", "transcribe", sampleRecording.recordingId]);
    expect(code).toBe(10);
    expect(mockCreateTranscriptionTask).not.toHaveBeenCalled();
  });

  test("--dry-run exits 0 without calling the API", async () => {
    const code = await parseExit(build(), ["recording", "transcribe", sampleRecording.recordingId, "--dry-run"]);
    expect(code).toBe(null);
    expect(mockCreateTranscriptionTask).not.toHaveBeenCalled();
  });

  test("with --yes submits the task and prints recordingId/convertState", async () => {
    const code = await parseExit(build(), ["recording", "transcribe", sampleRecording.recordingId, "--yes", "--user-token", "ut"]);
    expect(code).toBe(null);
    expect(mockCreateTranscriptionTask).toHaveBeenCalledWith({
      recordingId: sampleRecording.recordingId, user_token: "ut",
    });
    expect(mockOutputResult).toHaveBeenCalledWith(
      transcriptionResult, ["recordingId", "convertState"], "Transcription Task Submitted",
    );
  });

  test("--json with --yes prints the full result", async () => {
    const code = await parseExit(build(true), ["recording", "transcribe", sampleRecording.recordingId, "--yes", "--json"]);
    expect(code).toBe(null);
    expect(mockCreateTranscriptionTask).toHaveBeenCalledTimes(1);
    expect(mockOutputResult).toHaveBeenCalledWith(
      transcriptionResult, ["recordingId", "convertState"], "Transcription Task Submitted",
    );
  });
});

describe("recording summary high-risk gate", () => {
  test("without --yes exits 10 and calls no API", async () => {
    const code = await parseExit(build(), ["recording", "summary", sampleRecording.recordingId]);
    expect(code).toBe(10);
    expect(mockCreateSummaryTask).not.toHaveBeenCalled();
  });

  test("--dry-run exits 0 without calling the API", async () => {
    const code = await parseExit(build(), ["recording", "summary", sampleRecording.recordingId, "--dry-run"]);
    expect(code).toBe(null);
    expect(mockCreateSummaryTask).not.toHaveBeenCalled();
  });

  test("with --yes and --template-id submits the task", async () => {
    const code = await parseExit(build(), [
      "recording", "summary", sampleRecording.recordingId, "--template-id", "tpl1", "--yes", "--user-token", "ut",
    ]);
    expect(code).toBe(null);
    expect(mockCreateSummaryTask).toHaveBeenCalledWith({
      recordingId: sampleRecording.recordingId, templateId: "tpl1", user_token: "ut",
    });
    expect(mockOutputResult).toHaveBeenCalledWith(
      summaryResult, ["recordingId", "summaryState"], "Summary Task Submitted",
    );
  });

  test("with --yes but no --template-id passes templateId undefined", async () => {
    const code = await parseExit(build(), ["recording", "summary", sampleRecording.recordingId, "--yes"]);
    expect(code).toBe(null);
    expect(mockCreateSummaryTask).toHaveBeenCalledWith({
      recordingId: sampleRecording.recordingId, templateId: undefined, user_token: undefined,
    });
  });
});

describe("recording tags", () => {
  test("prints tag table", async () => {
    const code = await parseExit(build(), ["recording", "tags"]);
    expect(code).toBe(null);
    expect(mockFetchSmartRecordingTags).toHaveBeenCalledWith({ user_token: undefined });
    const [items, head, rowFn] = mockOutputList.mock.calls[0];
    expect(items).toEqual(tagsResult.tags);
    expect(head).toEqual(["tag_id", "name", "sort_weight", "create_time"]);
    expect(rowFn(tagsResult.tags[0])).toEqual([
      "13107200-GguRjIWne2J7t28KziwwPYsreBrA", "重要", "1.5", "1792723022895610",
    ]);
  });

  test("--json prints the full result", async () => {
    const code = await parseExit(build(true), ["recording", "tags", "--json"]);
    expect(code).toBe(null);
    expect(mockOutputResult).toHaveBeenCalledWith(tagsResult);
    expect(mockOutputList).not.toHaveBeenCalled();
  });
});

describe("recording templates", () => {
  test("calls fetchSmartRecordingTemplates with paging and prints table", async () => {
    const code = await parseExit(build(), ["recording", "templates", "--page", "2", "--page-size", "10"]);
    expect(code).toBe(null);
    expect(mockFetchSmartRecordingTemplates).toHaveBeenCalledWith({ page: 2, pageSize: 10, user_token: undefined });
    const [items, head, rowFn] = mockOutputList.mock.calls[0];
    expect(items).toEqual(templatesResult.templates);
    expect(head).toEqual(["template_id", "name", "template_state", "order"]);
    expect(rowFn(templatesResult.templates[0])).toEqual([
      "13107200-9f2c1a7b3d4e5f60718293a4b5c6d7e8", "周报模板", "1", "-",
    ]);
  });

  test("--json prints the full result", async () => {
    const code = await parseExit(build(true), ["recording", "templates", "--json"]);
    expect(code).toBe(null);
    expect(mockOutputResult).toHaveBeenCalledWith(templatesResult);
    expect(mockOutputList).not.toHaveBeenCalled();
  });

  test("section error 45000 from oversized page-size exits 1", async () => {
    mockFetchSmartRecordingTemplates.mockResolvedValueOnce({
      success: false, error: "请求参数错误", err_code: 45000,
    });
    const code = await parseExit(build(), ["recording", "templates", "--page-size", "101"]);
    expect(code).toBe(1);
    expect(mockOutputList).not.toHaveBeenCalled();
  });
});
