import { Command } from "commander";
import { getClient, outputResult, checkError, commaList, parseJsonOption } from "../utils";

export function registerNoticeCommands(program: Command) {
  const cmd = program.command("notice").description("Notice operations via official accounts (通知系统)");

  cmd
    .command("send")
    .description("Send a notice via an official account")
    .argument("<title>", "Notice title")
    .argument("<accountCode>", "Official account CODE (see `notice accounts`)")
    .option("-c, --content <content>", "Text content (required when --content-type is 1)", "")
    .option("--link <url>", "Link URL (required when --content-type is 2)", "")
    .option("-t, --content-type <type>", "Content type: 1=text, 2=link", "1")
    .option("-u, --user-type <type>", "Targeting type: 1=phone, 2=staff/department", "1")
    .option("--release-phones <phones>", "Comma-separated receiver phones (user-type=1, max 10)", "")
    .option("--cc-phones <phones>", "Comma-separated cc phones (user-type=1, max 10)", "")
    .option("--release-range <json>", 'JSON list (user-type=2, max 200): [{"objId":"dept-1","objName":"RD","objType":2}]', "")
    .option("--cc-staff-ids <ids>", "Comma-separated cc staff IDs (user-type=2, max 200)", "")
    .option("--create-mobile <mobile>", "Operator mobile (user-type=1; omit when --as/--user-token is set)", "")
    .option("--create-user-id <staffId>", "Creator staff ID (user-type=2; omit when --as/--user-token is set)", "")
    .option("--location <location>", "Notice address", "")
    .option("--resources <json>", 'JSON list of attachments: [{"fileName":"a.pdf","resourceId":"res-1","fileType":"application/pdf","fileSize":1024}]', "")
    .option("--extend-id <id>", "Caller-side correlation ID", "")
    .option("--confirm-flag <flag>", "Require read confirmation: 1=yes, 0=no", "")
    .option("--forward-flag <flag>", "Allow forwarding: 1=yes, 0=no", "")
    .option("--reply-flag <flag>", "Allow reply: 1=yes, 0=no", "")
    .option("--anonymous-flag <flag>", "Allow anonymous reply: 1=yes, 0=no", "")
    .option("--remind-status <flag>", "Enable reminding: 1=yes, 0=no", "")
    .option("--remind-msg-type <types>", "Remind channels, comma-separated: mobile,sms,app", "")
    .option("--at-once <flag>", "Remind immediately: 1=yes, 0=no", "")
    .option("--remind-after <type>", "Follow-up remind type: never, unOperate, count", "")
    .option("--remind-max-count <count>", "Max remind count (remind-after=count)", "")
    .option("--remind-interval <value>", "Remind interval value", "")
    .option("--remind-interval-unit <unit>", "Interval unit: minutes, hour, day", "")
    .option("--remind-range <type>", "Remind range type: all, receiver, partialRemind, notReminder", "")
    .option("--remind-exclude <ids>", "Comma-separated staff IDs excluded from reminding", "")
    .option("--user-token <token>", "User token", "")
    .action(async (title, accountCode, opts) => {
      const client = getClient();
      const result = await client.sendNotice({
        title,
        account_code: accountCode,
        content_type: Number(opts.contentType),
        user_type: Number(opts.userType),
        content: opts.content || undefined,
        notice_link: opts.link || undefined,
        notice_location: opts.location || undefined,
        release_phones: opts.releasePhones ? commaList(opts.releasePhones) : undefined,
        cc_phones: opts.ccPhones ? commaList(opts.ccPhones) : undefined,
        release_range: opts.releaseRange ? parseJsonOption(opts.releaseRange) : undefined,
        cc_staff_ids: opts.ccStaffIds ? commaList(opts.ccStaffIds) : undefined,
        create_mobile: opts.createMobile || undefined,
        create_user_id: opts.createUserId || undefined,
        resource_list: opts.resources ? parseJsonOption(opts.resources) : undefined,
        extend_id: opts.extendId || undefined,
        confirm_flag: opts.confirmFlag === "" ? undefined : Number(opts.confirmFlag),
        forward_flag: opts.forwardFlag === "" ? undefined : Number(opts.forwardFlag),
        reply_flag: opts.replyFlag === "" ? undefined : Number(opts.replyFlag),
        anonymous_flag: opts.anonymousFlag === "" ? undefined : Number(opts.anonymousFlag),
        remind_status: opts.remindStatus === "" ? undefined : Number(opts.remindStatus),
        remind_msg_type: opts.remindMsgType || undefined,
        at_once_flag: opts.atOnce === "" ? undefined : Number(opts.atOnce),
        remind_after_type: opts.remindAfter || undefined,
        remind_max_count: opts.remindMaxCount === "" ? undefined : Number(opts.remindMaxCount),
        remind_interval_time: opts.remindInterval === "" ? undefined : Number(opts.remindInterval),
        remind_interval_time_duration: opts.remindIntervalUnit || undefined,
        remind_range_type: opts.remindRange || undefined,
        remind_range_staff_ids: opts.remindExclude ? commaList(opts.remindExclude) : undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["notice_code", "title", "notice_status", "confirm_status", "publish_user_name"], "Send Notice Result");
    });

  cmd
    .command("accounts")
    .description("List official accounts (fetch accountCode for sending)")
    .option("--org-id <orgId>", "Organization ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchNoticeAccounts({ org_id: opts.orgId || undefined, user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["total", "accounts"], "Notice Accounts");
    });
}
