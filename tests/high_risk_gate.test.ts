import { Command } from "commander";

// Mock getClient so no real API calls happen.
const mockDismissGroup = jest.fn();
const mockRevokeMessage = jest.fn();
const mockUpdateGroupMembers = jest.fn();
const mockDeleteTodoTask = jest.fn();
const mockDeleteSchedule = jest.fn();

jest.mock("../src/utils", () => ({
  __esModule: true,
  getClient: jest.fn(() => ({
    dismissGroup: mockDismissGroup,
    revokeMessage: mockRevokeMessage,
    updateGroupMembers: mockUpdateGroupMembers,
    deleteTodoTask: mockDeleteTodoTask,
    deleteSchedule: mockDeleteSchedule,
  })),
  outputResult: jest.fn(),
  outputList: jest.fn(),
  checkError: jest.fn(),
  parseJsonOption: (v: string) => JSON.parse(v),
  parseFieldOrJson: (v: string) => JSON.parse(v),
  commaList: (v: string) => v.split(",").map((s: string) => s.trim()).filter(Boolean),
  confirmHighRisk: jest.requireActual("../src/utils").confirmHighRisk,
  setJsonOutput: jest.fn(),
  jsonOutput: false,
}));

import { registerGroupCommands } from "../src/commands/group";
import { registerMessageCommands } from "../src/commands/message";
import { registerTodoCommands } from "../src/commands/todo";
import { registerCalendarCommands } from "../src/commands/calendar";

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

function build(): Command {
  const program = new Command();
  registerGroupCommands(program);
  registerMessageCommands(program);
  registerTodoCommands(program);
  registerCalendarCommands(program);
  return program;
}

describe("high-risk gate", () => {
  beforeEach(() => jest.clearAllMocks());

  // --- exit 10 without --yes ---

  test("group dismiss without --yes exits 10 and no API call", async () => {
    const code = await parseExit(build(), ["group", "dismiss", "g1"]);
    expect(code).toBe(10);
    expect(mockDismissGroup).not.toHaveBeenCalled();
  });

  test("group dismiss with --yes calls API", async () => {
    const code = await parseExit(build(), ["group", "dismiss", "g1", "--yes"]);
    expect(code).toBe(null);
    expect(mockDismissGroup).toHaveBeenCalledTimes(1);
  });

  test("message revoke without --yes exits 10", async () => {
    const code = await parseExit(build(), ["message", "revoke", "m1"]);
    expect(code).toBe(10);
    expect(mockRevokeMessage).not.toHaveBeenCalled();
  });

  test("group update-members with only --add does not gate", async () => {
    const code = await parseExit(build(), ["group", "update-members", "g1", "--add", "u1"]);
    expect(code).toBe(null);
    expect(mockUpdateGroupMembers).toHaveBeenCalledTimes(1);
  });

  test("group update-members with --remove requires --yes", async () => {
    const code = await parseExit(build(), ["group", "update-members", "g1", "--remove", "u1"]);
    expect(code).toBe(10);
    expect(mockUpdateGroupMembers).not.toHaveBeenCalled();
  });

  test("todo delete without --yes exits 10", async () => {
    const code = await parseExit(build(), ["todo", "delete", "t1", "org1"]);
    expect(code).toBe(10);
    expect(mockDeleteTodoTask).not.toHaveBeenCalled();
  });

  test("calendar delete-schedule without --yes exits 10", async () => {
    const code = await parseExit(build(), ["calendar", "delete-schedule", "cal1", "sch1"]);
    expect(code).toBe(10);
    expect(mockDeleteSchedule).not.toHaveBeenCalled();
  });

  // --- dry-run ---

  test("group dismiss --dry-run exits 0 and no API call", async () => {
    const code = await parseExit(build(), ["group", "dismiss", "g1", "--dry-run"]);
    expect(code).toBe(null);
    expect(mockDismissGroup).not.toHaveBeenCalled();
  });

  test("group update-members --remove --dry-run exits 0 and no API call", async () => {
    const code = await parseExit(build(), ["group", "update-members", "g1", "--remove", "u1", "u2", "--dry-run"]);
    expect(code).toBe(null);
    expect(mockUpdateGroupMembers).not.toHaveBeenCalled();
  });

  test("todo delete --yes calls API", async () => {
    const code = await parseExit(build(), ["todo", "delete", "t1", "org1", "--yes"]);
    expect(code).toBe(null);
    expect(mockDeleteTodoTask).toHaveBeenCalledTimes(1);
  });
});
