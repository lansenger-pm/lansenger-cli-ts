import { Command } from "commander";
import { getClient, outputResult, checkError } from "../utils";

export function registerChatCommands(program: Command) {
  const cmd = program.command("chat").description("Chat list and message history");

  cmd
    .command("list")
    .description("Fetch chat list (private + group chats)")
    .option("-t, --type <type>", "0=all, 1=private, 2=group", "0")
    .option("-k, --keyword <keyword>", "Search keyword (only for type 1 or 2)", "")
    .option("--start <start>", "Start time in microseconds", "0")
    .option("--end <end>", "End time in microseconds", "0")
    .option("--user-token <token>", "User token", "")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchChatList({
        chat_type: parseInt(opts.type),
        keyword: opts.keyword || undefined,
        start_time: parseInt(opts.start),
        end_time: parseInt(opts.end),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("messages")
    .description("Fetch chat messages")
    .option("--staff-id <staffId>", "Private chat partner staffId", "")
    .option("--group-id <groupId>", "Group openId", "")
    .option("-s, --size <size>", "Per-page count (max 100)", "100")
    .option("--version <version>", "Deep pagination cursor, first call: 0", "0")
    .option("--start <start>", "Start time in microseconds", "0")
    .option("--end <end>", "End time in microseconds", "0")
    .option("--sender-id <senderId>", "Filter by sender staffId", "")
    .option("--user-token <token>", "User token", "")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchChatMessages({
        staff_id: opts.staffId || undefined,
        group_id: opts.groupId || undefined,
        page_size: parseInt(opts.size),
        base_version: opts.version,
        start_time: parseInt(opts.start),
        end_time: parseInt(opts.end),
        sender_id: opts.senderId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });
}