import { Command } from "commander";
import { registerVideoconferenceCommands } from "../src/commands/videoconference";

function makeProgram(): Command {
  const program = new Command();
  program.option("-j, --json", "Output as JSON", false);
  registerVideoconferenceCommands(program);
  return program;
}

describe("videoconference command group", () => {
  const EXPECTED = [
    "create", "modify", "cancel", "stop", "detail", "list", "record-list",
    "simplerecord", "fixroom-list", "status", "subscribe", "params",
    "history", "active", "member-control", "invite", "member-list",
    "vod-list", "vod-download", "org-conf",
  ];

  test("registers all 20 subcommands", () => {
    const program = makeProgram();
    const vc = program.commands.find(c => c.name() === "videoconference");
    expect(vc).toBeDefined();
    const names = vc!.commands.map(c => c.name());
    for (const name of EXPECTED) expect(names).toContain(name);
    expect(names.length).toBe(20);
  });

  test("create requires subject, startTime, members, orgId", () => {
    const program = makeProgram();
    const create = program.commands
      .find(c => c.name() === "videoconference")!.commands
      .find(c => c.name() === "create")!;
    expect(create.registeredArguments.map((a: any) => a.name())).toEqual(["subject", "startTime", "members", "orgId"]);
    expect(create.options.map(o => o.long)).toContain("--user-token");
  });

  test("cancel/stop expose the high-risk write gate flags", () => {
    const program = makeProgram();
    const vc = program.commands.find(c => c.name() === "videoconference")!;
    for (const name of ["cancel", "stop"]) {
      const sub = vc.commands.find(c => c.name() === name)!;
      const flags = sub.options.map(o => o.long);
      expect(flags).toContain("--yes");
      expect(flags).toContain("--dry-run");
    }
  });

  test("member-control takes mid, staffId, opCode, orgId, operator", () => {
    const program = makeProgram();
    const sub = program.commands
      .find(c => c.name() === "videoconference")!.commands
      .find(c => c.name() === "member-control")!;
    expect(sub.registeredArguments.map((a: any) => a.name())).toEqual(["mid", "staffId", "opCode", "orgId", "operator"]);
  });

  test("vod-download exposes --user-token", () => {
    const program = makeProgram();
    const sub = program.commands
      .find(c => c.name() === "videoconference")!.commands
      .find(c => c.name() === "vod-download")!;
    expect(sub.options.map(o => o.long)).toContain("--user-token");
  });
});
