#!/usr/bin/env node
import { Command } from "commander";
import { setJsonOutput, setActiveProfile } from "./utils";
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
  .name("lansenger-ts")
  .description("CLI for Lansenger (蓝信) — send messages, manage groups, staff, departments, calendars, todos, and more")
  .version("1.0.0")
  .option("-j, --json", "Output as JSON", false)
  .option("-P, --profile <profile>", "Credential profile", "default")
  .hook("preAction", () => {
    const opts = program.opts();
    if (opts.json) setJsonOutput(true);
    if (opts.profile) setActiveProfile(opts.profile);
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