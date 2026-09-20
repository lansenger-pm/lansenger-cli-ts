import * as fs from "fs";
import { Command } from "commander";
import { getClient, outputResult, outputList, checkError, commaList, parseJsonOption, jsonOutput } from "../utils";

function jsonList(value: string | undefined): any[] | undefined {
  return value ? parseJsonOption(value) : undefined;
}

export function registerPersonalTodoCommands(program: Command) {
  const cmd = program.command("personal-todo").description("Manage user-owned personal todos (个人待办)");

  cmd
    .command("save")
    .description("Create a personal todo")
    .argument("<subject>", "Todo subject")
    .argument("<createUserId>", "Creator staff ID")
    .argument("<orgId>", "Organization ID (required; never inferred from user-token)")
    .argument("<appid>", "Application ID")
    .requiredOption("--start-time <ms>", "Start time in epoch milliseconds")
    .requiredOption("--due-time <ms>", "Due time in epoch milliseconds")
    .option("--priority <n>", "Priority: 0=low, 1=normal, 2=urgent, 3=very urgent", "1")
    .option("--description <text>", "Description", "")
    .option("--parent-code <code>", "Parent todo code", "")
    .option("--finish-time <ms>", "Finish time in epoch milliseconds", "0")
    .option("--status-tag-no <label>", "Unfinished status label", "")
    .option("--status-tag-yes <label>", "Finished status label", "")
    .option("--subscribe-status <n>", "Subscribe: 1=yes, 0=no", "")
    .option("--user-code <code>", "Private-chat executor authorization code", "")
    .option("--executors <json>", 'JSON list: \'[{"staffId":"u1","opt":1}]\'', "")
    .option("--copys <json>", "JSON list of CC users", "")
    .option("--resources <json>", "JSON list of uploaded resources", "")
    .option("--reminds <json>", "JSON list of reminders", "")
    .option("--user-token <token>", "User token", "")
    .action(async (subject, createUserId, orgId, appid, opts) => {
      const result = await getClient().savePersonalTodo(
        subject,
        Number(opts.startTime),
        Number(opts.dueTime),
        Number(opts.priority),
        createUserId,
        orgId,
        appid,
        {
          description: opts.description || undefined,
          parent_code: opts.parentCode || undefined,
          finish_time: Number(opts.finishTime),
          status_tag_no: opts.statusTagNo || undefined,
          status_tag_yes: opts.statusTagYes || undefined,
          subscribe_status: opts.subscribeStatus === "" ? undefined : Number(opts.subscribeStatus),
          user_code: opts.userCode || undefined,
          executors: jsonList(opts.executors),
          copys: jsonList(opts.copys),
          resources: jsonList(opts.resources),
          reminds: jsonList(opts.reminds),
          user_token: opts.userToken || undefined,
        },
      );
      checkError(result);
      outputResult(result, ["todo_code"], "Personal Todo Created");
    });

  cmd
    .command("update")
    .description("Update selected fields of a personal todo")
    .argument("<todoCode>", "Todo code")
    .argument("<orgId>", "Organization ID (sent at request body top level)")
    .requiredOption("--update-fields <fields>", "Comma-separated fields to update")
    .option("--subject <text>", "New subject", "")
    .option("--description <text>", "New description", "")
    .option("--start-time <ms>", "New start time", "")
    .option("--due-time <ms>", "New due time", "")
    .option("--finish-time <ms>", "New finish time", "")
    .option("--priority <n>", "New priority", "")
    .option("--subscribe-status <n>", "New subscribe status", "")
    .requiredOption("--create-user-id <id>", "Creator staff ID")
    .requiredOption("--appid <id>", "Application ID")
    .option("--executors <json>", "JSON list of executors", "")
    .option("--copys <json>", "JSON list of CC users", "")
    .option("--resources <json>", "JSON list of resources", "")
    .option("--reminds <json>", "JSON list of reminders", "")
    .option("--user-token <token>", "User token", "")
    .action(async (todoCode, orgId, opts) => {
      const result = await getClient().updatePersonalTodo(todoCode, orgId, commaList(opts.updateFields), {
        subject: opts.subject || undefined,
        description: opts.description || undefined,
        start_time: opts.startTime === "" ? undefined : Number(opts.startTime),
        due_time: opts.dueTime === "" ? undefined : Number(opts.dueTime),
        finish_time: opts.finishTime === "" ? undefined : Number(opts.finishTime),
        priority: opts.priority === "" ? undefined : Number(opts.priority),
        subscribe_status: opts.subscribeStatus === "" ? undefined : Number(opts.subscribeStatus),
        create_user_id: opts.createUserId || undefined,
        appid: opts.appid || undefined,
        executors: jsonList(opts.executors),
        copys: jsonList(opts.copys),
        resources: jsonList(opts.resources),
        reminds: jsonList(opts.reminds),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["todo_code"], "Personal Todo Updated");
    });

  cmd
    .command("list")
    .description("Page a user's personal todos")
    .argument("<orgId>", "Organization ID")
    .argument("<staffId>", "Executor staff ID")
    .option("--page <no>", "Page number", "1")
    .option("--size <n>", "Page size", "10")
    .option("--status <n>", "0=unfinished, 1=finished; omit for all", "")
    .option("--app-id <id>", "Filter by application ID", "")
    .option("--app-category-name <name>", "Filter by application category", "")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, staffId, opts) => {
      const result = await getClient().fetchPersonalTodoList(orgId, staffId, {
        page_no: Number(opts.page),
        page_size: Number(opts.size),
        status: opts.status === "" ? undefined : Number(opts.status),
        app_id: opts.appId || undefined,
        app_category_name: opts.appCategoryName || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["page_no", "page_size", "pages", "total", "has_more"], "Personal Todos");
      if (result.items && !jsonOutput) {
        outputList(result.items, ["Task Code", "Subject", "Status", "Due Time"], item => [
          String(item.taskCode ?? ""),
          String(item.summarySubject ?? ""),
          String(item.status ?? ""),
          String(item.dueTime ?? ""),
        ]);
      }
    });

  cmd
    .command("upload-resource")
    .description("Upload a local file resource and return its resource ID")
    .argument("<appId>", "Application ID")
    .argument("<fileName>", "File name, including extension")
    .argument("<contentType>", "MIME content type")
    .argument("<orgId>", "Organization ID")
    .requiredOption("--file <path>", "Local file path to upload")
    .option("--thumb", "Generate a thumbnail", false)
    .option("--extension-info <text>", "Extension information", "")
    .option("--user-token <token>", "User token", "")
    .action(async (appId, fileName, contentType, orgId, opts) => {
      if (!fs.existsSync(opts.file)) throw new Error(`file does not exist: ${opts.file}`);
      const raw = fs.readFileSync(opts.file);
      const result = await getClient().uploadPersonalTodoResource(
        appId, raw.length, fileName, contentType, raw.toString("base64"), orgId,
        {
          thumb: opts.thumb,
          extension_info: opts.extensionInfo || undefined,
          user_token: opts.userToken || undefined,
        },
      );
      checkError(result);
      outputResult(result, ["resource_id", "file_name", "size", "mime_type", "download_url"], "Personal Todo Resource");
    });

  cmd
    .command("download-url")
    .description("Fetch a resource download URL")
    .argument("<resourceId>", "Resource ID")
    .argument("<orgId>", "Organization ID")
    .option("--file-name <name>", "Optional base64-encoded file name", "")
    .option("--user-token <token>", "User token", "")
    .action(async (resourceId, orgId, opts) => {
      const result = await getClient().fetchPersonalTodoResourceDownloadUrl(resourceId, orgId, {
        file_name: opts.fileName || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["url"], "Resource Download URL");
    });

  cmd
    .command("upload-url")
    .description("Fetch a presigned upload URL for direct S3 upload")
    .argument("<fileName>", "File name, including extension")
    .argument("<md5>", "File MD5")
    .argument("<size>", "File size in bytes")
    .argument("<orgId>", "Organization ID")
    .option("--user-token <token>", "User token", "")
    .action(async (fileName, md5, size, orgId, opts) => {
      const result = await getClient().fetchPersonalTodoResourceUploadUrl(fileName, md5, Number(size), orgId, {
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["url"], "Resource Upload URL");
    });
}
