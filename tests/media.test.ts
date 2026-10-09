import { Command } from "commander";

// downloadMediaToFile 按文档契约失败时抛异常；CLI 必须转成友好错误 + 退出码 1。
const mockDownloadMediaToFile = jest.fn();
const mockDownloadMediaFile = jest.fn();

jest.mock("../src/utils", () => ({
  __esModule: true,
  getClient: jest.fn(() => ({
    downloadMediaToFile: mockDownloadMediaToFile,
    downloadMediaFile: mockDownloadMediaFile,
  })),
  outputResult: jest.fn(),
  outputList: jest.fn(),
  checkError: jest.fn(),
  parseJsonOption: (v: string) => JSON.parse(v),
  parseFieldOrJson: (v: string) => JSON.parse(v),
  commaList: (v: string) => v.split(",").map((s: string) => s.trim()).filter(Boolean),
  setJsonOutput: jest.fn(),
  failError: jest.requireActual("../src/utils").failError,
  jsonOutput: false,
}));

import { registerMediaCommands } from "../src/commands/media";

function makeProgram(): Command {
  const program = new Command();
  program.option("-j, --json", "Output as JSON", false);
  program.exitOverride();
  registerMediaCommands(program);
  return program;
}

describe("media download-to-file", () => {
  let exitSpy: jest.SpyInstance;
  let errSpy: jest.SpyInstance;

  beforeEach(() => {
    mockDownloadMediaToFile.mockReset();
    exitSpy = jest.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`__exit_${code}`);
    }) as never);
    errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });

  test("prints a clean error and exits 1 when the SDK raises", async () => {
    const message = "Download failed: Download returned an API error instead of a file (errCode=10003)";
    mockDownloadMediaToFile.mockRejectedValueOnce(new Error(message));

    const program = makeProgram();
    await expect(
      program.parseAsync(["node", "test", "media", "download-to-file", "m-1"]),
    ).rejects.toThrow("__exit_1");

    expect(errSpy).toHaveBeenCalledWith(`Error: ${message}`);
    const printed = errSpy.mock.calls.flat().join("\n");
    expect(printed).not.toContain("at ");
  });

  test("prints the saved path on success", async () => {
    mockDownloadMediaToFile.mockResolvedValueOnce("/tmp/x.bin");
    const program = makeProgram();
    await program.parseAsync(["node", "test", "media", "download-to-file", "m-1"]);
    expect(mockDownloadMediaToFile).toHaveBeenCalled();
  });
});
