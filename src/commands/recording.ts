import { Command } from "commander";
import { getClient, outputResult, outputList, checkError, confirmHighRisk, jsonOutput } from "../utils";

const RECORDING_LIST_HEAD = [
  "recording_id", "name", "duration(ms)", "state", "convert_state", "summary_state", "create_time",
];

const TAG_LIST_HEAD = ["tag_id", "name", "sort_weight", "create_time"];

const TEMPLATE_LIST_HEAD = ["template_id", "name", "template_state", "order"];

const DETAIL_FIELDS = [
  "recordingId", "name", "sn", "deviceName", "duration",
  "state", "convertState", "summaryState", "chapterState", "shared",
  "createTime", "modifyTime", "tagIds", "templateId", "recordingMarker",
  "audioId", "transcriptionId", "summaryId", "chaptersId",
  "hasAudio", "hasTranscription", "hasSummary", "hasChapters",
];

/** Render one detail cell: absent fields show "-" (false/0 are real values). */
function cell(value: any): string {
  if (value === undefined || value === null) return "-";
  if (Array.isArray(value) || typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function detailRow(recording: any, field: string): string[] {
  return [field, cell(recording[field])];
}

export function registerRecordingCommands(program: Command) {
  const cmd = program.command("recording").description("Smart recording open APIs (智能录音)");

  cmd
    .command("list")
    .description("List recordings (paged snapshot; hasMore is the only reliable paging signal)")
    .option("--page <n>", "Page number (from 1)", "1")
    .option("--page-size <n>", "Page size (server caps at 100 silently)", "20")
    .option("--user-token <token>", "User token", "")
    .action(async (opts: any) => {
      const client = getClient();
      const result = await client.fetchSmartRecordingList({
        page: parseInt(opts.page, 10),
        pageSize: parseInt(opts.pageSize, 10),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      if (jsonOutput) { outputResult(result); return; }
      console.log("Recordings");
      outputList(result.recordings || [], RECORDING_LIST_HEAD, (r: any) => [
        cell(r.recordingId), cell(r.name), cell(r.duration), cell(r.state),
        cell(r.convertState), cell(r.summaryState), cell(r.createTime),
      ]);
    });

  cmd
    .command("detail")
    .description("Fetch a recording's detail (poll target after transcribe/summary)")
    .argument("<recordingId>", "Recording open ID (<oid>-<id>, pass through verbatim)")
    .option("--user-token <token>", "User token", "")
    .action(async (recordingId: string, opts: any) => {
      const client = getClient();
      const result = await client.fetchSmartRecordingDetail({
        recordingId,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      if (jsonOutput) { outputResult(result); return; }
      if (!result.recording) {
        outputResult(result, undefined, "Recording Detail");
        return;
      }
      console.log("Recording Detail");
      outputList(DETAIL_FIELDS, ["Field", "Value"], (field: string) => detailRow(result.recording, field));
    });

  cmd
    .command("transcribe")
    .description("Submit an ASR transcription task (high-risk write: consumes quota and regenerates the transcript)")
    .argument("<recordingId>", "Recording open ID (<oid>-<id>, pass through verbatim)")
    .option("-y, --yes", "Confirm the transcription task before submitting", false)
    .option("--dry-run", "Validate inputs without submitting", false)
    .option("--user-token <token>", "User token", "")
    .action(async (recordingId: string, opts: any) => {
      confirmHighRisk("transcribe", `recording ${recordingId}`, opts.yes, opts.dryRun);
      if (opts.dryRun) return;
      const client = getClient();
      const result = await client.createSmartRecordingTranscriptionTask({
        recordingId,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["recordingId", "convertState"], "Transcription Task Submitted");
    });

  cmd
    .command("summary")
    .description("Submit a meeting-summary task (high-risk write: consumes quota and regenerates the summary)")
    .argument("<recordingId>", "Recording open ID (<oid>-<id>, pass through verbatim)")
    .option("--template-id <templateId>", "Summary template open ID (from recording templates)", "")
    .option("-y, --yes", "Confirm the summary task before submitting", false)
    .option("--dry-run", "Validate inputs without submitting", false)
    .option("--user-token <token>", "User token", "")
    .action(async (recordingId: string, opts: any) => {
      confirmHighRisk("summarize", `recording ${recordingId}`, opts.yes, opts.dryRun);
      if (opts.dryRun) return;
      const client = getClient();
      const result = await client.createSmartRecordingSummaryTask({
        recordingId,
        templateId: opts.templateId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["recordingId", "summaryState"], "Summary Task Submitted");
    });

  cmd
    .command("tags")
    .description("List recording tags of the authorized staff member (no paging)")
    .option("--user-token <token>", "User token", "")
    .action(async (opts: any) => {
      const client = getClient();
      const result = await client.fetchSmartRecordingTags({
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      if (jsonOutput) { outputResult(result); return; }
      console.log("Recording Tags");
      outputList(result.tags || [], TAG_LIST_HEAD, (t: any) => [
        cell(t.tagId), cell(t.name), cell(t.sortWeight), cell(t.createTime),
      ]);
    });

  cmd
    .command("templates")
    .description("List organization summary templates (paged; page_size > 100 returns 45000, not truncated)")
    .option("--page <n>", "Page number (from 1)", "1")
    .option("--page-size <n>", "Page size (1-100; > 100 is an error)", "20")
    .option("--user-token <token>", "User token", "")
    .action(async (opts: any) => {
      const client = getClient();
      const result = await client.fetchSmartRecordingTemplates({
        page: parseInt(opts.page, 10),
        pageSize: parseInt(opts.pageSize, 10),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      if (jsonOutput) { outputResult(result); return; }
      console.log("Recording Templates");
      outputList(result.templates || [], TEMPLATE_LIST_HEAD, (t: any) => [
        cell(t.templateId), cell(t.name), cell(t.templateState), cell(t.orderNumber),
      ]);
    });
}
