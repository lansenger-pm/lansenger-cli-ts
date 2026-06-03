"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStreamingCommands = registerStreamingCommands;
const utils_1 = require("../utils");
function registerStreamingCommands(program) {
    const cmd = program.command("streaming").description("Manage stream messages (AI Agent real-time push)");
    cmd
        .command("create")
        .description("Create a stream message session")
        .requiredOption("--receiver-id <receiverId>", "Receiver ID")
        .requiredOption("--receiver-type <receiverType>", "Receiver type (e.g. staff, group)")
        .requiredOption("--stream-id <streamId>", "Stream session ID")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.createStreamMessage(opts.receiverId, opts.receiverType, opts.streamId);
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("fetch")
        .description("Fetch stream message status")
        .requiredOption("--msg-id <msgId>", "Stream message ID")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.fetchStreamMessage(opts.msgId);
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
}
