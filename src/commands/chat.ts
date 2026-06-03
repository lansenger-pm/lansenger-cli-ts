import { Command } from "commander";
import { getClient, outputResult, checkError } from "../utils";

export function registerChatCommands(program: Command) {
  const cmd = program.command("chat").description("View chat list and message history");

  cmd
    .command("list")
    .description("Fetch chat list (private + group chats)")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchChatList({ user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("messages")
    .description("Fetch chat messages")
    .option("--staff-id <staffId>", "Staff ID for private chat messages")
    .option("--group-id <groupId>", "Group ID for group chat messages")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchChatMessages({
        staff_id: opts.staffId || undefined,
        group_id: opts.groupId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });
}