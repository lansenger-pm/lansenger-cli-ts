"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMessageCommands = registerMessageCommands;
const utils_1 = require("../utils");
function registerMessageCommands(program) {
    const cmd = program.command("message").description("Send and manage messages");
    cmd
        .command("send-text")
        .description("Send a text message")
        .requiredOption("-c, --chat-id <chatId>", "Chat ID (receiver)")
        .requiredOption("--content <content>", "Message content")
        .option("-g, --group", "Send as group message", false)
        .option("--mention-all", "Mention all group members", false)
        .option("--mention <ids>", "Comma-separated user IDs to mention")
        .option("--user-token <token>", "User token for user-context sending")
        .option("--file-path <path>", "File path to attach")
        .option("--media-type <type>", "Media type (1=video,2=image,3=file)")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const mentionUserIds = opts.mention ? (0, utils_1.commaList)(opts.mention) : undefined;
        const result = await client.sendText(opts.chatId, opts.content, {
            is_group: opts.group,
            reminder_all: opts.mentionAll,
            reminder_user_ids: mentionUserIds,
            user_token: opts.userToken || undefined,
            file_path: opts.filePath || undefined,
            media_type: opts.mediaType ? parseInt(opts.mediaType) : undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("send-markdown")
        .description("Send a markdown/formatted text message")
        .requiredOption("-c, --chat-id <chatId>", "Chat ID (receiver)")
        .requiredOption("--content <content>", "Markdown content")
        .option("-g, --group", "Send as group message", false)
        .option("--mention-all", "Mention all group members", false)
        .option("--mention <ids>", "Comma-separated user IDs to mention")
        .option("--user-token <token>", "User token for user-context sending")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const mentionUserIds = opts.mention ? (0, utils_1.commaList)(opts.mention) : undefined;
        const result = await client.sendMarkdown(opts.chatId, opts.content, {
            is_group: opts.group,
            reminder_all: opts.mentionAll,
            reminder_user_ids: mentionUserIds,
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("send-file")
        .description("Send a file message")
        .requiredOption("-c, --chat-id <chatId>", "Chat ID (receiver)")
        .requiredOption("--file-path <path>", "File path to send")
        .option("--caption <caption>", "Caption text")
        .option("--media-type <type>", "Media type (1=video,2=image,3=file)")
        .option("-g, --group", "Send as group message", false)
        .option("--user-token <token>", "User token for user-context sending")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.sendFile(opts.chatId, opts.filePath, {
            caption: opts.caption || undefined,
            media_type: opts.mediaType ? parseInt(opts.mediaType) : undefined,
            is_group: opts.group,
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("send-link-card")
        .description("Send a link card message")
        .requiredOption("-c, --chat-id <chatId>", "Chat ID (receiver)")
        .requiredOption("--title <title>", "Card title")
        .requiredOption("--link <link>", "Card link URL")
        .option("--description <desc>", "Card description")
        .option("-g, --group", "Send as group message", false)
        .option("--user-token <token>", "User token for user-context sending")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.sendLinkCard(opts.chatId, opts.title, opts.link, {
            description: opts.description || undefined,
            is_group: opts.group,
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("send-app-articles")
        .description("Send app articles message")
        .requiredOption("-c, --chat-id <chatId>", "Chat ID (receiver)")
        .requiredOption("--articles <json>", "Articles JSON array")
        .option("-g, --group", "Send as group message", false)
        .option("--user-token <token>", "User token for user-context sending")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const articles = (0, utils_1.parseJsonOption)(opts.articles);
        const result = await client.sendAppArticles(opts.chatId, articles, {
            is_group: opts.group,
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("send-app-card")
        .description("Send an app card message")
        .requiredOption("-c, --chat-id <chatId>", "Chat ID (receiver)")
        .requiredOption("--body-title <title>", "Card body title")
        .option("--head-title <title>", "Card head title")
        .option("--body-content <content>", "Card body content")
        .option("--is-dynamic", "Mark as dynamic card", false)
        .option("--fields <json>", "Card fields JSON array")
        .option("--links <json>", "Card links JSON array")
        .option("-g, --group", "Send as group message", false)
        .option("--user-token <token>", "User token for user-context sending")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const fields = opts.fields ? (0, utils_1.parseJsonOption)(opts.fields) : undefined;
        const links = opts.links ? (0, utils_1.parseJsonOption)(opts.links) : undefined;
        const result = await client.sendAppCard(opts.chatId, opts.bodyTitle, {
            head_title: opts.headTitle || undefined,
            body_content: opts.bodyContent || undefined,
            is_dynamic: opts.isDynamic,
            fields,
            links,
            is_group: opts.group,
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("send-oacard")
        .description("Send an OA card message")
        .requiredOption("-c, --chat-id <chatId>", "Chat ID (receiver)")
        .requiredOption("--title <title>", "OA card title")
        .option("--fields <json>", "OA card fields JSON array")
        .option("--link <link>", "OA card link URL")
        .option("-g, --group", "Send as group message", false)
        .option("--user-token <token>", "User token for user-context sending")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const fields = opts.fields ? (0, utils_1.parseJsonOption)(opts.fields) : undefined;
        const result = await client.sendOacard(opts.chatId, opts.title, {
            fields,
            link: opts.link || undefined,
            is_group: opts.group,
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("update-dynamic-card")
        .description("Update a dynamic card message")
        .requiredOption("--msg-id <msgId>", "Message ID of the dynamic card")
        .option("--is-last-update", "Mark as last update", false)
        .option("--head-status-info <json>", "Head status info JSON")
        .option("--links <json>", "Updated links JSON array")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const headStatusInfo = opts.headStatusInfo ? (0, utils_1.parseJsonOption)(opts.headStatusInfo) : undefined;
        const links = opts.links ? (0, utils_1.parseJsonOption)(opts.links) : undefined;
        const result = await client.updateDynamicCard(opts.msgId, {
            is_last_update: opts.isLastUpdate,
            head_status_info: headStatusInfo,
            links,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("revoke")
        .description("Revoke messages by IDs")
        .requiredOption("--message-ids <ids>", "Comma-separated message IDs to revoke")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const messageIds = (0, utils_1.commaList)(opts.messageIds);
        const result = await client.revokeMessage(messageIds);
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("send-account-message")
        .description("Send a public account message")
        .requiredOption("--msg-type <msgType>", "Message type")
        .requiredOption("--msg-data <json>", "Message data JSON")
        .requiredOption("--chat-ids <ids>", "Comma-separated chat IDs")
        .option("--dept-ids <ids>", "Comma-separated department IDs")
        .option("--account-id <id>", "Account ID")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const msgData = (0, utils_1.parseJsonOption)(opts.msgData);
        const chatIds = (0, utils_1.commaList)(opts.chatIds);
        const deptIds = opts.deptIds ? (0, utils_1.commaList)(opts.deptIds) : undefined;
        const result = await client.sendAccountMessage(opts.msgType, msgData, chatIds, deptIds, {
            account_id: opts.accountId || undefined,
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("send-user-message")
        .description("Send a user-to-user private message")
        .requiredOption("--receiver-id <receiverId>", "Receiver staff ID")
        .requiredOption("--msg-type <msgType>", "Message type")
        .requiredOption("--msg-data <json>", "Message data JSON")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const msgData = (0, utils_1.parseJsonOption)(opts.msgData);
        const result = await client.sendUserMessage(opts.receiverId, opts.msgType, msgData, {
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("send-group-message")
        .description("Send a group message")
        .requiredOption("--group-id <groupId>", "Group ID")
        .requiredOption("--msg-type <msgType>", "Message type")
        .requiredOption("--msg-data <json>", "Message data JSON")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const msgData = (0, utils_1.parseJsonOption)(opts.msgData);
        const result = await client.sendGroupMessage(opts.groupId, opts.msgType, msgData, {
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("send-reminder")
        .description("Send a reminder for a message")
        .requiredOption("--msg-id <msgId>", "Message ID")
        .requiredOption("--reminder-types <types>", "Comma-separated reminder types (0=none,1=popup,2=sms,3=phone)")
        .requiredOption("--user-ids <ids>", "Comma-separated user IDs to remind")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const reminderTypes = (0, utils_1.commaList)(opts.reminderTypes).map(Number);
        const userIdList = (0, utils_1.commaList)(opts.userIds);
        const result = await client.sendReminderMsg(opts.msgId, reminderTypes, userIdList);
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
}
