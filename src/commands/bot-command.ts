import { Command } from "commander";
import { getClient, outputResult, outputList, checkError, parseJsonOption } from "../utils";

export function registerBotCommandCommands(program: Command) {
  const cmd = program.command("bot-command").description("Manage bot slash commands (4.37)");

  cmd
    .command("create")
    .description("Create bot commands")
    .argument("<scopeType>", "Scope: 1-7")
    .argument("<commands>", "Commands as JSON array")
    .option("--chat-id <id>", "Group/staff openId", "")
    .option("--chat-type <type>", "group or staff", "")
    .option("--staff-id <id>", "Staff openId", "")
    .action(async (scopeType, commands, opts) => {
      const client = getClient();
      const cmds = parseJsonOption(commands);
      const result = await client.createBotCommands(parseInt(scopeType), cmds, {
        chat_id: opts.chatId || undefined,
        chat_type: opts.chatType || undefined,
        staff_id: opts.staffId || undefined,
      });
      checkError(result);
      outputResult(result, undefined, "Create Bot Commands Result");
    });

  cmd
    .command("query")
    .description("Query bot commands")
    .argument("<scopeType>", "Scope: 1-7")
    .option("--chat-id <id>", "Group/staff openId", "")
    .option("--chat-type <type>", "group or staff", "")
    .option("--staff-id <id>", "Staff openId", "")
    .action(async (scopeType, opts) => {
      const client = getClient();
      const result = await client.fetchBotCommands(parseInt(scopeType), {
        chat_id: opts.chatId || undefined,
        chat_type: opts.chatType || undefined,
        staff_id: opts.staffId || undefined,
      });
      checkError(result);
      outputResult(result, ["scope_type", "chat_id", "chat_type", "staff_id"], "Bot Commands");
      if (result.success && result.commands) {
        outputList(result.commands, ["Command", "Description", "Icon"], (c: any) => [
          c.command || "", c.description || "", c.icon || "",
        ]);
      }
    });

  cmd
    .command("delete")
    .description("Delete bot commands")
    .argument("<scopeType>", "Scope: 1-7")
    .option("--chat-id <id>", "Group/staff openId", "")
    .option("--chat-type <type>", "group or staff", "")
    .option("--staff-id <id>", "Staff openId", "")
    .action(async (scopeType, opts) => {
      const client = getClient();
      const result = await client.deleteBotCommands(parseInt(scopeType), {
        chat_id: opts.chatId || undefined,
        chat_type: opts.chatType || undefined,
        staff_id: opts.staffId || undefined,
      });
      checkError(result);
      outputResult(result, undefined, "Delete Bot Commands Result");
    });
}
