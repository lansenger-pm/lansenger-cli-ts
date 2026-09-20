import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Command } from "commander";

const mockSavePersonalTodo = jest.fn();
const mockUpdatePersonalTodo = jest.fn();
const mockFetchPersonalTodoList = jest.fn();
const mockUploadPersonalTodoResource = jest.fn();
const mockFetchPersonalTodoResourceDownloadUrl = jest.fn();
const mockFetchPersonalTodoResourceUploadUrl = jest.fn();
const mockOutputList = jest.fn();

jest.mock("../src/utils", () => ({
  __esModule: true,
  getClient: jest.fn(() => ({
    savePersonalTodo: mockSavePersonalTodo,
    updatePersonalTodo: mockUpdatePersonalTodo,
    fetchPersonalTodoList: mockFetchPersonalTodoList,
    uploadPersonalTodoResource: mockUploadPersonalTodoResource,
    fetchPersonalTodoResourceDownloadUrl: mockFetchPersonalTodoResourceDownloadUrl,
    fetchPersonalTodoResourceUploadUrl: mockFetchPersonalTodoResourceUploadUrl,
  })),
  outputResult: jest.fn(),
  outputList: mockOutputList,
  checkError: jest.fn(),
  commaList: (v: string) => v.split(",").map((s: string) => s.trim()).filter(Boolean),
  parseJsonOption: (v: string) => JSON.parse(v),
}));

import { registerPersonalTodoCommands } from "../src/commands/personalTodo";

function build(): Command {
  const program = new Command();
  registerPersonalTodoCommands(program);
  return program;
}

async function run(program: Command, argv: string[]): Promise<void> {
  program.exitOverride();
  await program.parseAsync(argv, { from: "user" });
}

describe("personal-todo commands", () => {
  beforeEach(() => jest.clearAllMocks());

  test("registers all six commands", () => {
    const personalTodo = build().commands.find(c => c.name() === "personal-todo")!;
    expect(personalTodo.commands.map(c => c.name())).toEqual([
      "save", "update", "list", "upload-resource", "download-url", "upload-url",
    ]);
  });

  test("save parses JSON lists", async () => {
    mockSavePersonalTodo.mockResolvedValue({ success: true, todo_code: "TASK1" });
    await run(build(), [
      "personal-todo", "save", "完成方案", "u1", "org1", "app1",
      "--start-time", "100", "--due-time", "200", "--priority", "2",
      "--executors", '[{"staffId":"u1","opt":1}]',
      "--resources", '[{"fileName":"a.pdf","resourceId":"r1"}]',
    ]);
    expect(mockSavePersonalTodo).toHaveBeenCalledWith(
      "完成方案", 100, 200, 2, "u1", "org1", "app1",
      expect.objectContaining({
        executors: [{ staffId: "u1", opt: 1 }],
        resources: [{ fileName: "a.pdf", resourceId: "r1" }],
      }),
    );
  });

  test("update parses update fields", async () => {
    mockUpdatePersonalTodo.mockResolvedValue({ success: true, todo_code: "TASK1" });
    await run(build(), [
      "personal-todo", "update", "TASK1", "org1",
      "--update-fields", "subject,dueTime", "--subject", "新主题", "--due-time", "300",
    ]);
    expect(mockUpdatePersonalTodo).toHaveBeenCalledWith(
      "TASK1", "org1", ["subject", "dueTime"],
      expect.objectContaining({ subject: "新主题", due_time: 300 }),
    );
  });

  test("list parses pagination and status", async () => {
    mockFetchPersonalTodoList.mockResolvedValue({
      success: true,
      items: [{ taskCode: "TASK1", summarySubject: "方案", status: 0, dueTime: 200 }],
    });
    await run(build(), [
      "personal-todo", "list", "org1", "u1", "--page", "2", "--size", "20", "--status", "0",
    ]);
    expect(mockFetchPersonalTodoList).toHaveBeenCalledWith("org1", "u1", {
      page_no: 2,
      page_size: 20,
      status: 0,
      app_id: undefined,
      app_category_name: undefined,
      user_token: undefined,
    });
    expect(mockOutputList).toHaveBeenCalled();
  });

  test("upload-resource reads the local file", async () => {
    mockUploadPersonalTodoResource.mockResolvedValue({ success: true, resource_id: "res1" });
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lansenger-personal-todo-"));
    const file = path.join(tmp, "a.txt");
    fs.writeFileSync(file, "hello");
    await run(build(), [
      "personal-todo", "upload-resource", "app1", "a.txt", "text/plain", "org1",
      "--file", file,
    ]);
    expect(mockUploadPersonalTodoResource).toHaveBeenCalledWith(
      "app1", 5, "a.txt", "text/plain", Buffer.from("hello").toString("base64"), "org1",
      expect.objectContaining({ thumb: false }),
    );
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test("resource URL commands pass parameters", async () => {
    mockFetchPersonalTodoResourceDownloadUrl.mockResolvedValue({ success: true, url: "https://example.com/download" });
    mockFetchPersonalTodoResourceUploadUrl.mockResolvedValue({ success: true, url: "https://example.com/upload" });
    await run(build(), ["personal-todo", "download-url", "res1", "org1"]);
    await run(build(), ["personal-todo", "upload-url", "a.txt", "md5", "10", "org1"]);
    expect(mockFetchPersonalTodoResourceDownloadUrl).toHaveBeenCalledWith("res1", "org1", {
      file_name: undefined,
      user_token: undefined,
    });
    expect(mockFetchPersonalTodoResourceUploadUrl).toHaveBeenCalledWith("a.txt", "md5", 10, "org1", {
      user_token: undefined,
    });
  });
});
