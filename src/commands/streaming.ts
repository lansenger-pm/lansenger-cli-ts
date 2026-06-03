import { Command } from "commander";
import { getClient, outputResult, checkError } from "../utils";

export function registerStreamingCommands(program: Command) {
  const cmd = program.command("streaming").description("Manage stream messages (AI Agent real-time push)");

  cmd
    .command("create")
    .description("Create a stream message session")
    .requiredOption("--receiver-id <receiverId>", "Receiver ID")
    .requiredOption("--receiver-type <receiverType>", "Receiver type (e.g. staff, group)")
    .requiredOption("--stream-id <streamId>", "Stream session ID")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.createStreamMessage(opts.receiverId, opts.receiverType, opts.streamId);
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("fetch")
    .description("Fetch stream message status")
    .requiredOption("--msg-id <msgId>", "Stream message ID")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchStreamMessage(opts.msgId);
      checkError(result);
      outputResult(result);
    });
}