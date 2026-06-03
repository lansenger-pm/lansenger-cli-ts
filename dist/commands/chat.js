"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatCommands = registerChatCommands;
const utils_1 = require("../utils");
function registerChatCommands(program) {
    const cmd = program.command("chat").description("View chat list and message history");
    cmd
        .command("list")
        .description("Fetch chat list (private + group chats)")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.fetchChatList({ user_token: opts.userToken || undefined });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("messages")
        .description("Fetch chat messages")
        .option("--staff-id <staffId>", "Staff ID for private chat messages")
        .option("--group-id <groupId>", "Group ID for group chat messages")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.fetchChatMessages({
            staff_id: opts.staffId || undefined,
            group_id: opts.groupId || undefined,
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
}
