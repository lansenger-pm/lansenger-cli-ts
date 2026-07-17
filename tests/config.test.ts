import { Command } from "commander";

// --- mock state (must be before jest.mock so factory closures capture them) ---
const mockLoadCredentials = jest.fn().mockReturnValue({
  app_id: "test_app",
  app_secret: "test_secret",
  api_gateway_url: "https://api.example.com",
  passport_url: "https://passport.example.com",
  encoding_key: "test_key",
  callback_token: "test_callback",
  redirect_uri: "https://redirect.example.com",
});
const mockHasFullConfig = jest.fn().mockReturnValue(true);
const mockStorePath = "/fake/path/to/store.json";
const mockListProfiles = jest.fn().mockReturnValue(["default", "staging"]);
const mockGetActiveProfile = jest.fn().mockReturnValue("default");
const mockDeleteProfileByName = jest.fn().mockReturnValue(true);
const mockSaveCredentials = jest.fn();
const mockClear = jest.fn();
const mockClearProfile = jest.fn();
const mockListUserTokens = jest.fn().mockReturnValue(["staff_001"]);
const mockLoadUserToken = jest.fn().mockReturnValue({});

// Mock the SDK before command modules import it
jest.mock("lansenger-sdk-ts", () => ({
  CredentialStore: jest.fn().mockImplementation(() => ({
    loadCredentials: mockLoadCredentials,
    hasFullConfig: mockHasFullConfig,
    path: mockStorePath,
    saveCredentials: mockSaveCredentials,
    clear: mockClear,
    clearProfile: mockClearProfile,
    listProfiles: mockListProfiles,
    getActiveProfile: mockGetActiveProfile,
    deleteProfileByName: mockDeleteProfileByName,
    listUserTokens: mockListUserTokens,
    loadUserToken: mockLoadUserToken,
  })),
}));

jest.mock("../src/utils", () => ({
  outputResult: jest.fn(),
  activeProfile: "default",
}));

import { registerConfigCommands } from "../src/commands/config";

/** Access Commander's internal action handler (stable across versions). */
function invokeAction(cmd: Command, args: unknown[] = []) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (cmd as any)._actionHandler(args);
}

describe("registerConfigCommands", () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    jest.clearAllMocks();
  });

  // ── import / registration ──────────────────────────────────────────

  test("exports a function", () => {
    expect(typeof registerConfigCommands).toBe("function");
  });

  test("registers config command on the program", () => {
    registerConfigCommands(program);
    const configCmd = program.commands.find(c => c.name() === "config");
    expect(configCmd).toBeDefined();
    expect(configCmd!.description()).toBe("Manage CLI configuration and credentials");
  });

  test("registers all expected subcommands", () => {
    registerConfigCommands(program);
    const configCmd = program.commands.find(c => c.name() === "config")!;
    const names = configCmd.commands.map(c => c.name());
    expect(names).toEqual(
      expect.arrayContaining(["show", "set", "clear", "list-profiles", "delete-profile", "list-users"])
    );
    expect(configCmd.commands).toHaveLength(6);
  });

  // ── subcommand descriptions ────────────────────────────────────────

  test("show has expected description", () => {
    registerConfigCommands(program);
    const showCmd = findSubcommand(program, "config", "show");
    expect(showCmd.description()).toBe("Show current configuration");
  });

  test("set has expected description", () => {
    registerConfigCommands(program);
    const setCmd = findSubcommand(program, "config", "set");
    expect(setCmd.description()).toBe("Set credentials (app_id, app_secret, api_gateway_url, passport_url, encoding_key, callback_token)");
  });

  test("clear has expected description", () => {
    registerConfigCommands(program);
    const clearCmd = findSubcommand(program, "config", "clear");
    expect(clearCmd.description()).toBe("Clear stored credentials for current profile");
  });

  test("list-profiles has expected description", () => {
    registerConfigCommands(program);
    const lpCmd = findSubcommand(program, "config", "list-profiles");
    expect(lpCmd.description()).toBe("List all stored credential profiles");
  });

  test("delete-profile has expected description", () => {
    registerConfigCommands(program);
    const dpCmd = findSubcommand(program, "config", "delete-profile");
    expect(dpCmd.description()).toBe("Delete a credential profile by name");
  });

  test("list-users has expected description", () => {
    registerConfigCommands(program);
    const luCmd = findSubcommand(program, "config", "list-users");
    expect(luCmd.description()).toBe("List all users with stored user tokens in the current profile");
  });

  // ── options / flags ────────────────────────────────────────────────

  test("config show has --profile (-P) option", () => {
    registerConfigCommands(program);
    const showCmd = findSubcommand(program, "config", "show");
    const opts = showCmd.options;
    expect(opts.some(o => o.short === "-P" && o.long === "--profile")).toBe(true);
  });

  test("config clear has --profile (-P) and --all options", () => {
    registerConfigCommands(program);
    const clearCmd = findSubcommand(program, "config", "clear");
    const opts = clearCmd.options;
    expect(opts.some(o => o.short === "-P" && o.long === "--profile")).toBe(true);
    expect(opts.some(o => o.long === "--all")).toBe(true);
  });

  test("config list-users has --profile (-P) and --show-tokens (-T) options", () => {
    registerConfigCommands(program);
    const luCmd = findSubcommand(program, "config", "list-users");
    const opts = luCmd.options;
    expect(opts.some(o => o.short === "-P" && o.long === "--profile")).toBe(true);
    expect(opts.some(o => o.short === "-T" && o.long === "--show-tokens")).toBe(true);
  });

  // ── config show action ─────────────────────────────────────────────

  test("config show action outputs masked credentials", () => {
    registerConfigCommands(program);
    const { outputResult } = require("../src/utils");
    const showCmd = findSubcommand(program, "config", "show");

    invokeAction(showCmd);

    expect(outputResult).toHaveBeenCalledTimes(1);
    const data = outputResult.mock.calls[0][0];
    expect(data).toMatchObject({
      app_id: "***",
      app_secret: "***",
      encoding_key: "***",
      callback_token: "***",
      api_gateway_url: "https://api.example.com",
      passport_url: "https://passport.example.com",
      redirect_uri: "https://redirect.example.com",
      profile: "default",
      has_credentials: true,
      store_path: mockStorePath,
    });
  });

  test("config show respects --profile option", () => {
    registerConfigCommands(program);
    const { outputResult } = require("../src/utils");
    const showCmd = findSubcommand(program, "config", "show");

    jest.spyOn(showCmd, "opts").mockReturnValue({ profile: "staging" });
    invokeAction(showCmd);

    const data = outputResult.mock.calls[0][0];
    expect(data.profile).toBe("staging");
  });

  test("config show marks credentials as empty when none stored", () => {
    mockLoadCredentials.mockReturnValueOnce({
      app_id: "",
      app_secret: "",
      api_gateway_url: undefined,
      passport_url: undefined,
      encoding_key: "",
      callback_token: "",
      redirect_uri: undefined,
    });
    registerConfigCommands(program);
    const { outputResult } = require("../src/utils");
    const showCmd = findSubcommand(program, "config", "show");

    invokeAction(showCmd);

    const data = outputResult.mock.calls[0][0];
    expect(data.app_id).toBe("(empty)");
    expect(data.app_secret).toBe("(empty)");
  });

  // ── config list-profiles action ────────────────────────────────────

  test("config list-profiles outputs profile list", () => {
    registerConfigCommands(program);
    const { outputResult } = require("../src/utils");
    const lpCmd = findSubcommand(program, "config", "list-profiles");

    invokeAction(lpCmd);

    expect(outputResult).toHaveBeenCalledWith({
      profiles: ["default", "staging"],
      active_profile: "default",
    });
  });

  // ── config delete-profile action ───────────────────────────────────

  test("config delete-profile deletes existing profile", () => {
    mockDeleteProfileByName.mockReturnValueOnce(true);
    registerConfigCommands(program);
    const { outputResult } = require("../src/utils");
    const dpCmd = findSubcommand(program, "config", "delete-profile");

    invokeAction(dpCmd, ["staging"]);

    expect(mockDeleteProfileByName).toHaveBeenCalledWith("staging");
    expect(outputResult).toHaveBeenCalledWith({
      profile: "staging",
      status: "deleted",
      active_profile: "default",
    });
  });

  test("config delete-profile exits on unknown profile", () => {
    const spy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("process.exit"); });
    const spyErr = jest.spyOn(console, "error").mockImplementation(() => {});

    mockDeleteProfileByName.mockReturnValueOnce(false);
    registerConfigCommands(program);
    const dpCmd = findSubcommand(program, "config", "delete-profile");

    expect(() => invokeAction(dpCmd, ["nonexistent"])).toThrow("process.exit");

    expect(spyErr).toHaveBeenCalledWith("Error: Profile 'nonexistent' does not exist.");
    expect(spy).toHaveBeenCalledWith(1);

    spy.mockRestore();
    spyErr.mockRestore();
  });

  // ── config set action ──────────────────────────────────────────────

  test("config set rejects invalid key", () => {
    const spy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("process.exit"); });
    const spyErr = jest.spyOn(console, "error").mockImplementation(() => {});

    registerConfigCommands(program);
    const setCmd = findSubcommand(program, "config", "set");

    expect(() => invokeAction(setCmd, ["bad_key", "val"])).toThrow("process.exit");

    expect(spyErr).toHaveBeenCalledWith(
      expect.stringContaining("Invalid key 'bad_key'")
    );
    expect(spy).toHaveBeenCalledWith(1);

    spy.mockRestore();
    spyErr.mockRestore();
  });

  test("config set saves valid key", () => {
    registerConfigCommands(program);
    const { outputResult } = require("../src/utils");
    const setCmd = findSubcommand(program, "config", "set");

    invokeAction(setCmd, ["app_id", "new_app_id"]);

    expect(mockSaveCredentials).toHaveBeenCalled();
    expect(outputResult).toHaveBeenCalledWith({
      success: true,
      message: "Set app_id = new_app_id",
      profile: "default",
    });
  });

  // ── config clear action ────────────────────────────────────────────

  test("config clear clears profile", () => {
    registerConfigCommands(program);
    const { outputResult } = require("../src/utils");
    const clearCmd = findSubcommand(program, "config", "clear");

    invokeAction(clearCmd);

    expect(mockClearProfile).toHaveBeenCalled();
    expect(outputResult).toHaveBeenCalledWith({
      success: true,
      message: "Cleared profile 'default'.",
    });
  });

  test("config clear --all clears entire state", () => {
    registerConfigCommands(program);
    const { outputResult } = require("../src/utils");
    const clearCmd = findSubcommand(program, "config", "clear");

    jest.spyOn(clearCmd, "opts").mockReturnValue({ all: true });
    invokeAction(clearCmd);

    expect(mockClear).toHaveBeenCalled();
    expect(outputResult).toHaveBeenCalledWith({
      success: true,
      message: "Cleared entire state file (all profiles).",
    });
  });

  // ── config list-users action ───────────────────────────────────────

  test("config list-users shows users without tokens by default", () => {
    registerConfigCommands(program);
    const { outputResult } = require("../src/utils");
    const luCmd = findSubcommand(program, "config", "list-users");

    invokeAction(luCmd);

    expect(outputResult).toHaveBeenCalledWith({
      profile: "default",
      users: ["staff_001"],
    });
  });

  test("config list-users --show-tokens includes token data", () => {
    mockLoadUserToken.mockReturnValueOnce({
      user_token: "tok_abc",
      user_token_expiry: 1712345678,
    });
    registerConfigCommands(program);
    const { outputResult } = require("../src/utils");
    const luCmd = findSubcommand(program, "config", "list-users");

    jest.spyOn(luCmd, "opts").mockReturnValue({ showTokens: true });
    invokeAction(luCmd);

    expect(outputResult).toHaveBeenCalledWith({
      profile: "default",
      users: ["staff_001"],
      tokens: {
        staff_001: {
          user_token: "tok_abc",
          refresh_token: "",
          expires_in: 1712345678,
          refresh_expires_in: 0,
        },
      },
    });
  });
});

// ── helpers ─────────────────────────────────────────────────────────────

function findSubcommand(program: Command, parentName: string, childName: string): Command {
  const parent = program.commands.find(c => c.name() === parentName)!;
  const child = parent.commands.find(c => c.name() === childName)!;
  expect(child).toBeDefined();
  return child;
}
