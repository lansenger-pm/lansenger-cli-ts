import { Command } from "commander";

const mockSendNotice = jest.fn();
const mockFetchNoticeAccounts = jest.fn();

jest.mock("../src/utils", () => ({
  __esModule: true,
  getClient: jest.fn(() => ({
    sendNotice: mockSendNotice,
    fetchNoticeAccounts: mockFetchNoticeAccounts,
  })),
  outputResult: jest.fn(),
  checkError: jest.fn(),
  commaList: (v: string) => v.split(",").map((s: string) => s.trim()).filter(Boolean),
  parseJsonOption: (v: string) => JSON.parse(v),
}));

import { registerNoticeCommands } from "../src/commands/notice";

function build(): Command {
  const program = new Command();
  registerNoticeCommands(program);
  return program;
}

async function run(program: Command, argv: string[]): Promise<void> {
  program.exitOverride();
  await program.parseAsync(argv, { from: "user" });
}

describe("notice commands", () => {
  beforeEach(() => jest.clearAllMocks());

  test("registers send and accounts", () => {
    const program = build();
    const notice = program.commands.find(c => c.name() === "notice")!;
    expect(notice.commands.map(c => c.name())).toEqual(["send", "accounts"]);
  });

  test("send parses lists, JSON, flags, and passes the documented body", async () => {
    mockSendNotice.mockResolvedValue({ success: true });
    const program = build();
    await run(program, [
      "notice", "send", "系统通知", "ACC001",
      "--content", "维护通知",
      "--content-type", "1",
      "--user-type", "1",
      "--release-phones", "13800138000,13800138001",
      "--cc-phones", "13800138002",
      "--create-mobile", "13800138000",
      "--confirm-flag", "1",
      "--remind-status", "1",
      "--user-token", "ut1",
    ]);
    expect(mockSendNotice).toHaveBeenCalledWith(expect.objectContaining({
      title: "系统通知",
      account_code: "ACC001",
      content: "维护通知",
      content_type: 1,
      user_type: 1,
      release_phones: ["13800138000", "13800138001"],
      cc_phones: ["13800138002"],
      create_mobile: "13800138000",
      confirm_flag: 1,
      remind_status: 1,
      user_token: "ut1",
    }));
  });

  test("send parses release-range JSON and resource JSON", async () => {
    mockSendNotice.mockResolvedValue({ success: true });
    await run(build(), [
      "notice", "send", "通知", "ACC001",
      "--content", "正文",
      "--user-type", "2",
      "--release-range", '[{"objId":"dept1","objName":"研发","objType":2}]',
      "--resources", '[{"fileName":"a.pdf","resourceId":"res1","fileType":"application/pdf","fileSize":1}]',
      "--create-user-id", "u1",
    ]);
    expect(mockSendNotice).toHaveBeenCalledWith(expect.objectContaining({
      release_range: [{ objId: "dept1", objName: "研发", objType: 2 }],
      resource_list: [{ fileName: "a.pdf", resourceId: "res1", fileType: "application/pdf", fileSize: 1 }],
      create_user_id: "u1",
    }));
  });

  test("accounts passes org and user tokens", async () => {
    mockFetchNoticeAccounts.mockResolvedValue({ success: true });
    await run(build(), ["notice", "accounts", "--org-id", "org1", "--user-token", "ut1"]);
    expect(mockFetchNoticeAccounts).toHaveBeenCalledWith({
      org_id: "org1",
      user_token: "ut1",
    });
  });
});
