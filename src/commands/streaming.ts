import { Command } from "commander";
import { getClient, outputResult, checkError } from "../utils";

export function registerStreamingCommands(program: Command) {
  const cmd = program.command("streaming").description("Streaming message operations (for AI agent progressive output)");

  cmd
    .command("create")
    .description("Create a stream message session")
    .argument("<receiverId>", "Receiver ID")
    .argument("<receiverType>", "Receiver type: staff or group")
    .argument("<streamId>", "Stream ID (unique per session)")
    .action(async (receiverId, receiverType, streamId) => {
      const client = getClient();
      const result = await client.createStreamMessage(receiverId, receiverType, streamId);
      checkError(result);
      outputResult(result, ["message_id"], "Create Stream Message Result");
    });

  cmd
    .command("fetch")
    .description("Fetch stream message status")
    .argument("<msgId>", "Message ID of the stream message")
    .action(async (msgId) => {
      const client = getClient();
      const result = await client.fetchStreamMessage(msgId);
      checkError(result);
      outputResult(result, ["message_id"], "Fetch Stream Message Result");
    });
}
