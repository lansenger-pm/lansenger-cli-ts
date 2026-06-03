#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const utils_1 = require("./utils");
const config_1 = require("./commands/config");
const message_1 = require("./commands/message");
const staff_1 = require("./commands/staff");
const department_1 = require("./commands/department");
const group_1 = require("./commands/group");
const calendar_1 = require("./commands/calendar");
const todo_1 = require("./commands/todo");
const oauth_1 = require("./commands/oauth");
const callback_1 = require("./commands/callback");
const media_1 = require("./commands/media");
const streaming_1 = require("./commands/streaming");
const chat_1 = require("./commands/chat");
const health_1 = require("./commands/health");
const program = new commander_1.Command();
program
    .name("lansenger-ts")
    .description("CLI for Lansenger (蓝信) — send messages, manage groups, staff, departments, calendars, todos, and more")
    .version("1.0.0")
    .option("-j, --json", "Output as JSON", false)
    .option("-P, --profile <profile>", "Credential profile", "default")
    .hook("preAction", () => {
    const opts = program.opts();
    if (opts.json)
        (0, utils_1.setJsonOutput)(true);
    if (opts.profile)
        (0, utils_1.setActiveProfile)(opts.profile);
});
(0, config_1.registerConfigCommands)(program);
(0, message_1.registerMessageCommands)(program);
(0, staff_1.registerStaffCommands)(program);
(0, department_1.registerDepartmentCommands)(program);
(0, group_1.registerGroupCommands)(program);
(0, calendar_1.registerCalendarCommands)(program);
(0, todo_1.registerTodoCommands)(program);
(0, oauth_1.registerOauthCommands)(program);
(0, callback_1.registerCallbackCommands)(program);
(0, media_1.registerMediaCommands)(program);
(0, streaming_1.registerStreamingCommands)(program);
(0, chat_1.registerChatCommands)(program);
(0, health_1.registerHealthCommands)(program);
program.parse();
