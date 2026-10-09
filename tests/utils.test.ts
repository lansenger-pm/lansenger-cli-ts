import { wrapWithAutoUserToken, parseGlobalVersionFlag } from "../src/utils";
import { CredentialStore } from "lansenger-sdk-ts";

function mockStore(): CredentialStore {
  return { loadUserToken: jest.fn().mockReturnValue({}) } as any;
}

describe("wrapWithAutoUserToken", () => {
  test("injects user_id when opts has empty user_id", async () => {
    const store = mockStore();
    const staffId = "staff_123";

    const methodSpy = jest.fn().mockResolvedValue({ success: true });
    const raw = { createSchedule: methodSpy, someProp: "hello" };

    const proxy = wrapWithAutoUserToken(raw as any, store, staffId);

    const result = await (proxy as any).createSchedule("cal1", "Meeting", {}, {}, [], { user_id: "" });
    expect(result).toEqual({ success: true });
    expect(methodSpy).toHaveBeenCalledTimes(1);

    // The last arg should have user_id replaced with staffId
    const callArgs = methodSpy.mock.calls[0];
    const lastArg = callArgs[callArgs.length - 1];
    expect(lastArg.user_id).toBe(staffId);
  });

  test("does not override user_id when already set", async () => {
    const store = mockStore();
    const staffId = "staff_123";

    const methodSpy = jest.fn().mockResolvedValue({ success: true });
    const raw = { createSchedule: methodSpy };

    const proxy = wrapWithAutoUserToken(raw as any, store, staffId);

    await (proxy as any).createSchedule("cal1", "Meeting", {}, {}, [], { user_id: "explicit_user" });

    const callArgs = methodSpy.mock.calls[0];
    const lastArg = callArgs[callArgs.length - 1];
    expect(lastArg.user_id).toBe("explicit_user");
  });

  test("injects create_user_id when opts has an empty create_user_id", async () => {
    const store = mockStore();
    const staffId = "staff_123";

    const methodSpy = jest.fn().mockResolvedValue({ success: true });
    const raw = { createRecord: methodSpy };

    const proxy = wrapWithAutoUserToken(raw as any, store, staffId);

    await (proxy as any).createRecord({ create_user_id: "" });

    const callArgs = methodSpy.mock.calls[0];
    const lastArg = callArgs[callArgs.length - 1];
    expect(lastArg.create_user_id).toBe(staffId);
  });

  test("does not override create_user_id when already set", async () => {
    const store = mockStore();
    const staffId = "staff_123";

    const methodSpy = jest.fn().mockResolvedValue({ success: true });
    const raw = { createRecord: methodSpy };

    const proxy = wrapWithAutoUserToken(raw as any, store, staffId);

    await (proxy as any).createRecord({ create_user_id: "explicit_user" });

    const callArgs = methodSpy.mock.calls[0];
    const lastArg = callArgs[callArgs.length - 1];
    expect(lastArg.create_user_id).toBe("explicit_user");
  });

  test("passes through non-function properties unchanged", () => {
    const store = mockStore();
    const proxy = wrapWithAutoUserToken({ someProp: "hello" } as any, store, "staff_123");
    expect((proxy as any).someProp).toBe("hello");
  });

  test("does not modify args when last arg has no user_id key", async () => {
    const store = mockStore();
    const staffId = "staff_123";

    const methodSpy = jest.fn().mockResolvedValue({ success: true });
    const raw = { fetchSchedule: methodSpy };

    const proxy = wrapWithAutoUserToken(raw as any, store, staffId);

    await (proxy as any).fetchSchedule("cal1", "sch1", { some_other: "val" });

    const callArgs = methodSpy.mock.calls[0];
    const lastArg = callArgs[callArgs.length - 1];
    expect(lastArg.some_other).toBe("val");
    expect(lastArg.user_id).toBeUndefined();
  });

  test("works when last arg is not an object (passes through)", async () => {
    const store = mockStore();
    const staffId = "staff_123";

    const methodSpy = jest.fn().mockResolvedValue("ok");
    const raw = { someMethod: methodSpy };

    const proxy = wrapWithAutoUserToken(raw as any, store, staffId);

    const result = await (proxy as any).someMethod("arg1", "arg2");
    expect(result).toBe("ok");
    expect(methodSpy).toHaveBeenCalledWith("arg1", "arg2");
  });

  test("works when called with no extra args", async () => {
    const store = mockStore();
    const staffId = "staff_123";

    const methodSpy = jest.fn().mockResolvedValue("ok");
    const raw = { someMethod: methodSpy };

    const proxy = wrapWithAutoUserToken(raw as any, store, staffId);

    const result = await (proxy as any).someMethod();
    expect(result).toBe("ok");
    expect(methodSpy).toHaveBeenCalledWith();
  });
});

describe("parseGlobalVersionFlag", () => {
  test("detects -v and --version", () => {
    expect(parseGlobalVersionFlag(["-v"])).toEqual({ requested: true, json: false });
    expect(parseGlobalVersionFlag(["--version"])).toEqual({ requested: true, json: false });
  });

  test("reports json output when -j/--json is also global", () => {
    expect(parseGlobalVersionFlag(["-j", "-v"])).toEqual({ requested: true, json: true });
    expect(parseGlobalVersionFlag(["--json", "--version"])).toEqual({ requested: true, json: true });
  });

  test("skips values of global options that take one", () => {
    expect(parseGlobalVersionFlag(["--profile", "codex-stage-v3", "-v"]))
      .toEqual({ requested: true, json: false });
    expect(parseGlobalVersionFlag(["-P", "staging", "-j", "--version"]))
      .toEqual({ requested: true, json: true });
    expect(parseGlobalVersionFlag(["--as", "staff_1", "--user-token", "t", "-v"]))
      .toEqual({ requested: true, json: false });
    expect(parseGlobalVersionFlag(["--profile=staging", "-v"]))
      .toEqual({ requested: true, json: false });
  });

  test("ignores other global flags", () => {
    expect(parseGlobalVersionFlag(["--verbose", "-v"])).toEqual({ requested: true, json: false });
  });

  test("does not hijack a subcommand's own --version option", () => {
    expect(parseGlobalVersionFlag(["chat", "messages", "--version", "0"]))
      .toEqual({ requested: false, json: false });
    expect(parseGlobalVersionFlag(["chat", "messages", "--version", "0", "-j"]))
      .toEqual({ requested: false, json: false });
  });

  test("returns not-requested for plain command invocations", () => {
    expect(parseGlobalVersionFlag([])).toEqual({ requested: false, json: false });
    expect(parseGlobalVersionFlag(["health", "check"])).toEqual({ requested: false, json: false });
    expect(parseGlobalVersionFlag(["-j", "health", "check"])).toEqual({ requested: false, json: true });
  });
});
