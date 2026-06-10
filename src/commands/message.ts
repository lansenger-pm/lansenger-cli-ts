import { Command } from "commander";
import { getClient, outputResult, outputList, checkError, parseJsonOption } from "../utils";

export function registerMessageCommands(program: Command) {
  const cmd = program.command("message").description("Send and manage messages");

  cmd
    .command("send-text")
    .description("Send a text message")
    .argument("<chatId>", "Chat ID (user/group)")
    .argument("<content>", "Text content")
    .option("-f, --file <path>", "File path to attach", "")
    .option("-t, --media-type <type>", "1=video, 2=image, 3=file (auto-detected if omitted)")
    .option("--cover-image <path>", "Cover image path for video attachments", "")
    .option("-g, --group", "Send as group message", false)
    .option("--mention-all", "@all in group", false)
    .option("-m, --mention <ids...>", "User IDs to @mention (space-separated)")
    .option("--user-token <token>", "User token for private channel", "")
    .option("--sender-id <senderId>", "Sender staff ID for group message", "")
    .action(async (chatId, content, opts) => {
      const client = getClient();
      const result = await client.sendText(chatId, content, {
        file_path: opts.file || undefined,
        media_type: opts.mediaType ? parseInt(opts.mediaType) : undefined,
        cover_image_path: opts.coverImage || undefined,
        is_group: opts.group,
        reminder_all: opts.mentionAll,
        reminder_user_ids: opts.mention || undefined,
        user_token: opts.userToken || undefined,
        sender_id: opts.senderId || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id","msg_type","operation"], "Send Text Result");
    });

  cmd
    .command("send-markdown")
    .description("Send a markdown/formatted text message")
    .argument("<chatId>", "Chat ID")
    .argument("<content>", "Markdown content")
    .option("--mention-all", "@all in group", false)
    .option("-m, --mention <ids...>", "User IDs to @mention (space-separated)")
    .option("-g, --group", "Send as group message", false)
    .option("--user-token <token>", "User token for private channel", "")
    .option("--sender-id <senderId>", "Sender staff ID for group message", "")
    .action(async (chatId, content, opts) => {
      const client = getClient();
      const result = await client.sendMarkdown(chatId, content, {
        reminder_all: opts.mentionAll,
        reminder_user_ids: opts.mention || undefined,
        is_group: opts.group,
        user_token: opts.userToken || undefined,
        sender_id: opts.senderId || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id","msg_type","operation"], "Send Markdown Result");
    });

  cmd
    .command("send-file")
    .description("Send a file message")
    .argument("<chatId>", "Chat ID")
    .argument("<filePath>", "Local file path")
    .option("-c, --content <content>", "Content/caption text", "")
    .option("--media-type <type>", "1=video, 2=image, 3=file")
    .option("--cover-image <path>", "Cover image path for video attachments", "")
    .option("-g, --group", "Send as group message", false)
    .option("--user-token <token>", "User token for private channel", "")
    .option("--sender-id <senderId>", "Sender staff ID for group message", "")
    .action(async (chatId, filePath, opts) => {
      const client = getClient();
      const result = await client.sendFile(chatId, filePath, {
        caption: opts.content || undefined,
        media_type: opts.mediaType ? parseInt(opts.mediaType) : undefined,
        cover_image_path: opts.coverImage || undefined,
        is_group: opts.group,
        user_token: opts.userToken || undefined,
        sender_id: opts.senderId || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id","msg_type","operation"], "Send File Result");
    });

  cmd
    .command("send-image-url")
    .description("Send an image by URL")
    .argument("<chatId>", "Chat ID")
    .argument("<imageUrl>", "Image URL to send")
    .option("-c, --content <content>", "Content/caption text", "")
    .option("-g, --group", "Send as group message", false)
    .option("--user-token <token>", "User token for private channel", "")
    .option("--sender-id <senderId>", "Sender staff ID for group message", "")
    .action(async (chatId, imageUrl, opts) => {
      const client = getClient();
      const result = await client.sendImageUrl(chatId, imageUrl, {
        caption: opts.content || undefined,
        is_group: opts.group,
        user_token: opts.userToken || undefined,
        sender_id: opts.senderId || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id","msg_type","operation"], "Send Image Result");
    });

  cmd
    .command("send-link-card")
    .description("Send a link card message")
    .argument("<chatId>", "Chat ID")
    .argument("<title>", "Card title")
    .argument("<link>", "Card link URL")
    .option("-d, --desc <desc>", "Card description", "")
    .option("--icon <url>", "Icon URL", "")
    .option("--pc-link <url>", "PC link URL", "")
    .option("--pad-link <url>", "Pad link URL", "")
    .option("--from-name <name>", "Source name", "")
    .option("--from-icon <url>", "Source icon URL", "")
    .option("-g, --group", "Send as group message", false)
    .option("--user-token <token>", "User token for private channel", "")
    .option("--sender-id <senderId>", "Sender staff ID for group message", "")
    .action(async (chatId, title, link, opts) => {
      const client = getClient();
      const result = await client.sendLinkCard(chatId, title, link, {
        description: opts.desc || undefined,
        icon_link: opts.icon || undefined,
        pc_link: opts.pcLink || undefined,
        pad_link: opts.padLink || undefined,
        from_name: opts.fromName || undefined,
        from_icon_link: opts.fromIcon || undefined,
        is_group: opts.group,
        user_token: opts.userToken || undefined,
        sender_id: opts.senderId || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id","msg_type","operation"], "Send Link Card Result");
    });

  cmd
    .command("send-app-articles")
    .description("Send app articles message")
    .argument("<chatId>", "Chat ID")
    .argument("<articles...>", "Articles as JSON dicts, e.g. '{\"title\":\"T\",\"url\":\"U\"}'")
    .option("-g, --group", "Send as group message", false)
    .option("--user-token <token>", "User token for private channel", "")
    .option("--sender-id <senderId>", "Sender staff ID for group message", "")
    .action(async (chatId, articles, opts) => {
      const client = getClient();
      const parsed = articles.map((a: string) => parseJsonOption(a));
      const result = await client.sendAppArticles(chatId, parsed, {
        is_group: opts.group,
        user_token: opts.userToken || undefined,
        sender_id: opts.senderId || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id","msg_type","operation"], "Send App Articles Result");
    });

  cmd
    .command("send-app-card")
    .description("Send an app card message")
    .argument("<chatId>", "Chat ID")
    .argument("<bodyTitle>", "Card body title")
    .option("--head-title <title>", "Card head title", "")
    .option("--sub-title <sub>", "Card sub title", "")
    .option("--content <content>", "Card body content (supports div-style HTML)", "")
    .option("--signature <sig>", "Card signature", "")
    .option("--card-link <url>", "Card link URL", "")
    .option("--pc-card-link <url>", "PC card link URL", "")
    .option("--pad-card-link <url>", "Pad card link URL", "")
    .option("--dynamic", "Enable dynamic card updates", false)
    .option("--staff-id <id>", "Staff ID", "")
    .option("--head-icon <url>", "Head icon URL", "")
    .option("--status-desc <desc>", "Head status description (div-style HTML, max 30 bytes)", "")
    .option("--status-colour <colour>", "Head status DOT colour (hex, e.g. #FFB116)", "")
    .option("-F, --field <json...>", "Card fields as JSON dicts (space-separated)")
    .option("-L, --link <json...>", "Card links as JSON dicts (space-separated)")
    .option("-g, --group", "Send as group message", false)
    .option("--user-token <token>", "User token for private channel", "")
    .option("--sender-id <senderId>", "Sender staff ID for group message", "")
    .action(async (chatId, bodyTitle, opts) => {
      const client = getClient();
      let headStatusInfo = undefined;
      if (opts.statusDesc || opts.statusColour) {
        headStatusInfo = {
          description: opts.statusDesc || "",
          colour: opts.statusColour || "",
        };
      }
      const parsedFields = opts.field ? opts.field.map((f: string) => parseJsonOption(f)) : undefined;
      const parsedLinks = opts.link ? opts.link.map((l: string) => parseJsonOption(l)) : undefined;
      const result = await client.sendAppCard(chatId, bodyTitle, {
        head_title: opts.headTitle || undefined,
        body_sub_title: opts.subTitle || undefined,
        body_content: opts.content || undefined,
        signature: opts.signature || undefined,
        card_link: opts.cardLink || undefined,
        pc_card_link: opts.pcCardLink || undefined,
        pad_card_link: opts.padCardLink || undefined,
        is_dynamic: opts.dynamic,
        staff_id: opts.staffId || undefined,
        head_icon_url: opts.headIcon || undefined,
        head_status_info: headStatusInfo,
        fields: parsedFields,
        links: parsedLinks,
        is_group: opts.group,
        user_token: opts.userToken || undefined,
        sender_id: opts.senderId || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id","msg_type","operation"], "Send App Card Result");
    });

  cmd
    .command("update-dynamic-card")
    .description("Update a dynamic card message")
    .argument("<msgId>", "Message ID of the dynamic card")
    .option("--last", "Mark as last update", false)
    .option("--status-desc <desc>", "New status description (div-style HTML, max 30 bytes)", "")
    .option("--status-colour <colour>", "New status DOT colour (hex)", "")
    .option("-L, --link <json...>", "Updated links as JSON dicts (space-separated)")
    .action(async (msgId, opts) => {
      const client = getClient();
      let headStatusInfo = undefined;
      if (opts.statusDesc || opts.statusColour) {
        headStatusInfo = {
          description: opts.statusDesc || "",
          colour: opts.statusColour || "",
        };
      }
      const parsedLinks = opts.link ? opts.link.map((l: string) => parseJsonOption(l)) : undefined;
      const result = await client.updateDynamicCard(msgId, {
        is_last_update: opts.last,
        head_status_info: headStatusInfo,
        links: parsedLinks,
      });
      checkError(result);
      outputResult(result, ["message_id","operation"], "Update Dynamic Card Result");
    });

  cmd
    .command("revoke")
    .description("Revoke messages by IDs")
    .argument("<messageIds...>", "Message IDs to revoke")
    .option("--chat-type <type>", "staff, group, notification, account, or bot", "bot")
    .option("--sender-id <senderId>", "Sender staff ID (required for staff/group)", "")
    .action(async (messageIds, opts) => {
      const client = getClient();
      const result = await client.revokeMessage(messageIds, {
        chat_type: opts.chatType,
        sender_id: opts.senderId || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id","operation"], "Revoke Message Result");
    });

  cmd
    .command("send-bot-message")
    .description("Send a bot notification message")
    .argument("<msgType>", "Message type")
    .argument("<msgData>", "Message data as JSON")
    .option("-C, --chat-id <ids...>", "Chat IDs (space-separated, or group IDs if --group)")
    .option("-D, --dept <ids...>", "Department IDs (space-separated, bot channel only)")
    .option("--user-token <token>", "User token", "")
    .option("--entry-id <entryId>", "App entry selector", "")
    .option("-g, --group", "Send to groups instead of users", false)
    .action(async (msgType, msgData, opts) => {
      const client = getClient();
      const parsedData = parseJsonOption(msgData);
      const result = await client.sendBotMessage(msgType, parsedData, opts.chatId || undefined, opts.dept || undefined, {
        user_token: opts.userToken || undefined,
        entry_id: opts.entryId || undefined,
        is_group: opts.group,
      });
      checkError(result);
      outputResult(result, ["message_id"], "Bot Message Result");
    });

  cmd
    .command("send-group-message")
    .description("Send a group message")
    .argument("<groupId>", "Group ID")
    .argument("<msgType>", "Message type")
    .argument("<msgData>", "Message data as JSON")
    .option("--user-token <token>", "User token", "")
    .option("--sender-id <senderId>", "Sender staff ID", "")
    .option("--mention-all", "@all (text/formatText only)", false)
    .option("-m, --mention <ids...>", "User IDs to @mention (space-separated, text/formatText only)")
    .option("--outlines <outlines>", "Group notification digest", "")
    .option("--entry-id <entryId>", "App entry selector", "")
    .action(async (groupId, msgType, msgData, opts) => {
      const client = getClient();
      const parsedData = parseJsonOption(msgData);
      const result = await client.sendGroupMessage(groupId, msgType, parsedData, {
        user_token: opts.userToken || undefined,
        sender_id: opts.senderId || undefined,
        reminder_all: opts.mentionAll,
        reminder_user_ids: opts.mention || undefined,
        outlines: opts.outlines || undefined,
        entry_id: opts.entryId || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id"], "Group Message Result");
    });

  cmd
    .command("query-groups")
    .description("Query group IDs with pagination")
    .option("-p, --page <page>", "Page offset", "1")
    .option("-s, --size <size>", "Page size", "100")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.queryGroups({
        page_offset: parseInt(opts.page),
        page_size: parseInt(opts.size),
      });
      checkError(result);
      outputResult(result, ["total_group_ids","operation"], "Query Groups Result");
      if (result.success && result.group_ids && result.group_ids.length > 0) {
        outputList(result.group_ids.map((id: string) => ({ group_id: id })), ["Group ID"], (g: any) => [g.group_id]);
      }
    });

  cmd
    .command("send-oacard")
    .description("Send an OA card message")
    .argument("<chatId>", "Chat ID")
    .argument("<title>", "OA card title")
    .option("--head <head>", "OA card head title", "")
    .option("--sub-title <sub>", "OA card sub title", "")
    .option("--staff-id <id>", "Staff ID", "")
    .option("-F, --field <json...>", "Card fields as JSON dicts (space-separated)")
    .option("--link <url>", "Card click link URL", "")
    .option("--pc-link <url>", "PC link URL", "")
    .option("--pad-link <url>", "Pad link URL", "")
    .option("--card-action <json>", "Card action as JSON dict")
    .option("-g, --group", "Send as group message", false)
    .option("--user-token <token>", "User token for private channel", "")
    .option("--sender-id <senderId>", "Sender staff ID for group message", "")
    .action(async (chatId, title, opts) => {
      const client = getClient();
      const parsedFields = opts.field ? opts.field.map((f: string) => parseJsonOption(f)) : undefined;
      const parsedAction = opts.cardAction ? parseJsonOption(opts.cardAction) : undefined;
      const result = await client.sendOacard(chatId, title, {
        head: opts.head || undefined,
        sub_title: opts.subTitle || undefined,
        staff_id: opts.staffId || undefined,
        fields: parsedFields,
        link: opts.link || undefined,
        pc_link: opts.pcLink || undefined,
        pad_link: opts.padLink || undefined,
        card_action: parsedAction,
        is_group: opts.group,
        user_token: opts.userToken || undefined,
        sender_id: opts.senderId || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id","msg_type","operation"], "Send OA Card Result");
    });

  cmd
    .command("send-account-message")
    .description("Send a public account message")
    .argument("<msgType>", "Message type")
    .argument("<msgData>", "Message data as JSON")
    .option("-C, --chat-id <ids...>", "Chat IDs (space-separated)")
    .option("-D, --dept <ids...>", "Department IDs (space-separated)")
    .option("--account-id <id>", "Account ID", "")
    .option("--entry-id <entryId>", "App entry selector", "")
    .option("--attach <attach>", "Attach info", "")
    .option("--user-token <token>", "User token", "")
    .action(async (msgType, msgData, opts) => {
      const client = getClient();
      const parsedData = parseJsonOption(msgData);
      const result = await client.sendAccountMessage(msgType, parsedData, opts.chatId || undefined, opts.dept || undefined, {
        account_id: opts.accountId || undefined,
        entry_id: opts.entryId || undefined,
        attach: opts.attach || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id"], "Account Message Result");
    });

  cmd
    .command("send-user-message")
    .description("Send a user-to-user private message")
    .argument("<receiverId>", "Receiver user ID")
    .argument("<msgType>", "Message type")
    .argument("<msgData>", "Message data as JSON")
    .option("--user-token <token>", "User token", "")
    .option("--common <json>", "Common data as JSON dict")
    .option("--uuid <uuid>", "Deduplication UUID", "")
    .action(async (receiverId, msgType, msgData, opts) => {
      const client = getClient();
      const parsedData = parseJsonOption(msgData);
      const parsedCommon = opts.common ? parseJsonOption(opts.common) : undefined;
      const result = await client.sendUserMessage(receiverId, msgType, parsedData, {
        user_token: opts.userToken || undefined,
        common: parsedCommon,
        uuid: opts.uuid || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id"], "User Message Result");
    });

  cmd
    .command("send-reminder")
    .description("Send a reminder for a message")
    .argument("<msgId>", "Message ID to remind about")
    .option("-t, --type <types...>", "Reminder types (space-separated): 1=popup, 2=SMS, 3=phone call")
    .option("-u, --user <ids...>", "User IDs to remind (space-separated, staff openIds)")
    .action(async (msgId, opts) => {
      const client = getClient();
      const reminderTypes = opts.type ? opts.type.map(Number) : [];
      const userIdList = opts.user || [];
      const result = await client.sendReminderMsg(msgId, reminderTypes, userIdList);
      checkError(result);
      outputResult(result, ["operation"], "Send Reminder Result");
    });
}