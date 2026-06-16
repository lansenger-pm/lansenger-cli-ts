#!/usr/bin/env node
import { Command } from "commander";
import { setJsonOutput, setActiveProfile, setActiveStaffId, jsonOutput } from "./utils";
import * as pkg from "../package.json";
import { registerConfigCommands } from "./commands/config";
import { registerMessageCommands } from "./commands/message";
import { registerStaffCommands } from "./commands/staff";
import { registerDepartmentCommands } from "./commands/department";
import { registerGroupCommands } from "./commands/group";
import { registerCalendarCommands } from "./commands/calendar";
import { registerTodoCommands } from "./commands/todo";
import { registerOauthCommands } from "./commands/oauth";
import { registerCallbackCommands } from "./commands/callback";
import { registerMediaCommands } from "./commands/media";
import { registerStreamingCommands } from "./commands/streaming";
import { registerChatCommands } from "./commands/chat";
import { registerHealthCommands } from "./commands/health";

const program = new Command();

program
  .name("lansenger")
  .description("CLI for Lansenger (蓝信) — send messages, manage groups, staff, departments, calendars, todos, and more")
  .option("-j, --json", "Output as JSON", false)
  .option("-P, --profile <profile>", "Credential profile", "default")
  .option("--as <staffId>", "Act as a staff member (auto-load user token)", "")
  .option("-v, --version", "Show CLI and SDK versions", false)
  .hook("preAction", () => {
    const opts = program.opts();
    if (opts.json) setJsonOutput(true);
    if (opts.profile) setActiveProfile(opts.profile);
    if (opts.as) setActiveStaffId(opts.as);
    if (opts.version) {
      const sdkPkg = require("lansenger-sdk-ts/package.json");
      if (jsonOutput) {
        console.log(JSON.stringify({ cli_version: pkg.version, sdk_version: sdkPkg.version }, null, 2));
      } else {
        console.log(`lansenger-cli ${pkg.version} (SDK ${sdkPkg.version})`);
      }
      process.exit(0);
    }
  });

registerConfigCommands(program);
registerMessageCommands(program);
registerStaffCommands(program);
registerDepartmentCommands(program);
registerGroupCommands(program);
registerCalendarCommands(program);
registerTodoCommands(program);
registerOauthCommands(program);
registerCallbackCommands(program);
registerMediaCommands(program);
registerStreamingCommands(program);
registerChatCommands(program);
registerHealthCommands(program);

program.parse();