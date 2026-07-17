import { Command } from "commander";

// --- mock the LansengerClient method used by health check ---
const mockHealthCheck = jest.fn();

jest.mock("../src/utils", () => ({
  getClient: jest.fn().mockReturnValue({
    healthCheck: mockHealthCheck,
  }),
  outputResult: jest.fn(),
}));

import { registerHealthCommands } from "../src/commands/health";

/** Access Commander's internal action handler (stable across versions). */
function invokeAction(cmd: Command, args: unknown[] = []) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (cmd as any)._actionHandler(args);
}

describe("registerHealthCommands", () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    jest.clearAllMocks();
  });

  // ── import / registration ──────────────────────────────────────────

  test("exports a function", () => {
    expect(typeof registerHealthCommands).toBe("function");
  });

  test("registers health command on the program", () => {
    registerHealthCommands(program);
    const healthCmd = program.commands.find(c => c.name() === "health");
    expect(healthCmd).toBeDefined();
    expect(healthCmd!.description()).toBe("Health check for API connectivity");
  });

  test("registers check subcommand with correct description", () => {
    registerHealthCommands(program);
    const healthCmd = program.commands.find(c => c.name() === "health")!;
    const checkCmd = healthCmd.commands.find(c => c.name() === "check");
    expect(checkCmd).toBeDefined();
    expect(checkCmd!.description()).toBe(
      "Check API connectivity by attempting to get a token"
    );
  });

  test("health command has exactly one subcommand (check)", () => {
    registerHealthCommands(program);
    const healthCmd = program.commands.find(c => c.name() === "health")!;
    expect(healthCmd.commands).toHaveLength(1);
    expect(healthCmd.commands[0].name()).toBe("check");
  });

  // ── health check action ────────────────────────────────────────────

  test("health check reports OK when client returns true", async () => {
    mockHealthCheck.mockResolvedValue(true);
    registerHealthCommands(program);

    const { outputResult } = require("../src/utils");
    const checkCmd = findCheckCmd(program);

    await invokeAction(checkCmd);

    expect(outputResult).toHaveBeenCalledWith({
      success: true,
      status: "OK",
    });
  });

  test("health check reports FAIL when client returns false", async () => {
    mockHealthCheck.mockResolvedValue(false);
    registerHealthCommands(program);

    const { outputResult } = require("../src/utils");
    const checkCmd = findCheckCmd(program);

    await invokeAction(checkCmd);

    expect(outputResult).toHaveBeenCalledWith({
      success: false,
      status: "FAIL",
    });
  });

  test("health check handles thrown error gracefully", async () => {
    mockHealthCheck.mockRejectedValue(new Error("Connection refused"));
    registerHealthCommands(program);

    const { outputResult } = require("../src/utils");
    const checkCmd = findCheckCmd(program);

    await invokeAction(checkCmd);

    expect(outputResult).toHaveBeenCalledWith({
      success: false,
      status: "FAIL",
      error: "Connection refused",
    });
  });

  test("health check handles non-Error throws (string)", async () => {
    mockHealthCheck.mockRejectedValue("timeout");
    registerHealthCommands(program);

    const { outputResult } = require("../src/utils");
    const checkCmd = findCheckCmd(program);

    await invokeAction(checkCmd);

    const data = outputResult.mock.calls[0][0];
    expect(data.success).toBe(false);
    expect(data.status).toBe("FAIL");
    expect(data.error).toBe("timeout");
  });
});

// ── helpers ─────────────────────────────────────────────────────────────

function findCheckCmd(program: Command): Command {
  const healthCmd = program.commands.find(c => c.name() === "health")!;
  const checkCmd = healthCmd.commands.find(c => c.name() === "check")!;
  expect(checkCmd).toBeDefined();
  return checkCmd;
}
