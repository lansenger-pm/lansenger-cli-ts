import { Command } from "commander";
import { getClient, outputResult, outputList, checkError, jsonOutput } from "../utils";

function splitMonths(startUs: number, endUs: number): [number, number][] {
  const results: [number, number][] = [];
  const startDt = startUs !== 0 ? new Date(startUs / 1_000) : new Date(2020, 0, 1);
  const endDt = endUs !== 0 ? new Date(endUs / 1_000) : new Date();

  let year = startDt.getFullYear();
  let month = startDt.getMonth();
  while (new Date(year, month, 1) <= endDt) {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const msStart = Math.floor(new Date(year, month, 1).getTime() * 1_000);
    const msEnd = Math.floor(new Date(year, month, lastDay, 23, 59, 59).getTime() * 1_000);
    results.push([msStart, msEnd]);
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  return results;
}

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
      if (result.success) {
        outputResult(result);
        if (result.staff_infos) {
          outputList(result.staff_infos, ["Staff ID", "Name", "Sectors"], (s: any) => [
            s.staff_id || "", s.staff_name || "", String(s.sector_names || ""),
          ]);
        }
        if (result.group_infos) {
          outputList(result.group_infos, ["Group ID", "Name"], (g: any) => [
            g.group_id || "", g.group_name || "",
          ]);
        }
      } else {
        outputResult(result);
      }
    });

  cmd
    .command("messages")
    .description("Fetch chat messages")
    .option("--staff-id <staffId>", "Private chat partner staffId", "")
    .option("--group-id <groupId>", "Group openId", "")
    .option("-s, --size <size>", "Per-page count (max 100)", "100")
    .option("--cursor <cursor>", "Deep pagination cursor, first call: 0", "0")
    .option("--start <start>", "Start time in microseconds", "0")
    .option("--end <end>", "End time in microseconds", "0")
    .option("--sender-id <senderId>", "Filter by sender staffId", "")
    .option("--split-month", "Auto-split query by month when range > 1 month", false)
    .option("--progress", "Show pagination progress (pages/messages fetched)", false)
    .option("--user-token <token>", "User token", "")
    .action(async (opts) => {
      const client = getClient();

      if (!opts.splitMonth) {
        const result = await client.fetchChatMessages({
          staff_id: opts.staffId || undefined,
          group_id: opts.groupId || undefined,
          page_size: parseInt(opts.size),
          base_version: opts.cursor,
          start_time: parseInt(opts.start),
          end_time: parseInt(opts.end),
          sender_id: opts.senderId || undefined,
          user_token: opts.userToken || undefined,
        });
        checkError(result);
        if (result.success) {
          outputResult(result);
          if (result.messages) {
            outputList(result.messages, ["Time", "Sender", "Type"], (m: any) => [
              m.send_time || "", m.sender || "", m.message_type || "",
            ]);
          }
        } else {
          outputResult(result);
        }
        return;
      }

      const allMessages: any[] = [];
      let pageCount = 0;
      let msgCount = 0;
      const startUs = parseInt(opts.start) || 0;
      const endUs = parseInt(opts.end) || Math.floor(Date.now() * 1_000);

      const months = splitMonths(startUs, endUs);
      for (let i = 0; i < months.length; i++) {
        const [msStart, msEnd] = months[i];
        let cursor = "0";
        while (true) {
          const result = await client.fetchChatMessages({
            staff_id: opts.staffId || undefined,
            group_id: opts.groupId || undefined,
            page_size: parseInt(opts.size),
            base_version: cursor,
            start_time: msStart,
            end_time: msEnd,
            sender_id: opts.senderId || undefined,
            user_token: opts.userToken || undefined,
          });
          if (!result.success) {
            outputResult(result);
            return;
          }
          pageCount++;
          msgCount += result.messages ? result.messages.length : 0;
          if (result.messages) allMessages.push(...result.messages);

          if (opts.progress && !jsonOutput) {
            console.log(`Month ${i + 1}/${months.length} | Page ${pageCount} | ${msgCount} messages total`);
          }

          if (!(result.messages && result.has_more)) break;
          cursor = String(result.last_version || "");
        }
      }

      if (jsonOutput) {
        console.log(JSON.stringify(allMessages.map(m => m.toDict ? m.toDict() : m), null, 2));
        return;
      }
      if (opts.progress) {
        console.log(`Done: ${pageCount} pages, ${msgCount} messages across ${months.length} months`);
      }
      if (allMessages.length) {
        outputList(allMessages, ["Time", "Sender", "Type"], (m: any) => [
          m.send_time || "", m.sender || "", m.message_type || "",
        ]);
      }
    });
}