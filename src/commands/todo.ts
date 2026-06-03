import { Command } from "commander";
import { getClient, outputResult, checkError, commaList, parseJsonOption } from "../utils";

export function registerTodoCommands(program: Command) {
  const cmd = program.command("todo").description("Manage todo tasks");

  cmd
    .command("create")
    .description("Create a todo task")
    .argument("<title>", "Task title")
    .argument("<link>", "Task link URL")
    .argument("<pcLink>", "PC link URL")
    .argument("<executorIds>", "Executor IDs as comma-separated list")
    .argument("<orgId>", "Organization ID")
    .option("-t, --type <type>", "1=notification, 2=approval", "1")
    .option("--source-id <sourceId>", "Source ID", "")
    .option("-d, --desc <desc>", "Task description", "")
    .option("--sender-id <senderId>", "Sender staff ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (title, link, pcLink, executorIds, orgId, opts) => {
      const client = getClient();
      const ids = commaList(executorIds);
      const result = await client.createTodoTask(title, link, pcLink, ids, orgId, parseInt(opts.type), {
        source_id: opts.sourceId || undefined,
        desc: opts.desc || undefined,
        sender_id: opts.senderId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("update")
    .description("Update a todo task")
    .argument("<todotaskId>", "Todo task ID")
    .argument("<title>", "New title")
    .argument("<link>", "New link URL")
    .argument("<pcLink>", "New PC link URL")
    .argument("<orgId>", "Organization ID")
    .option("-d, --desc <desc>", "New description", "")
    .option("--user-token <token>", "User token", "")
    .action(async (todotaskId, title, link, pcLink, orgId, opts) => {
      const client = getClient();
      const result = await client.updateTodoTask(todotaskId, title, link, pcLink, orgId, {
        desc: opts.desc || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("update-status")
    .description("Update todo task status")
    .argument("<todotaskId>", "Todo task ID")
    .argument("<status>", "Status: 11=pending read, 12=read, 21=pending do, 22=done")
    .argument("<orgId>", "Organization ID")
    .option("--staff-id <staffId>", "Staff ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (todotaskId, status, orgId, opts) => {
      const client = getClient();
      const result = await client.updateTodoTaskStatus(todotaskId, status, orgId, {
        staff_id: opts.staffId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("delete")
    .description("Delete a todo task")
    .argument("<todotaskId>", "Todo task ID")
    .argument("<orgId>", "Organization ID")
    .option("--staff-id <staffId>", "Staff ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (todotaskId, orgId, opts) => {
      const client = getClient();
      const result = await client.deleteTodoTask(todotaskId, orgId, {
        staff_id: opts.staffId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("list")
    .description("List todo tasks for an organization")
    .argument("<orgId>", "Organization ID")
    .option("--user-token <token>", "User token", "")
    .option("--app-ids <ids>", "App IDs (comma-separated)")
    .option("--staff-id <staffId>", "Staff ID", "")
    .option("--status <ids>", "Status list (comma-separated)")
    .action(async (orgId, opts) => {
      const client = getClient();
      const appIdsList = opts.appIds ? commaList(opts.appIds) : undefined;
      const statusListParsed = opts.status ? commaList(opts.status) : undefined;
      const result = await client.fetchTodoTaskList(orgId, {
        user_token: opts.userToken || undefined,
        app_ids: appIdsList,
        staff_id: opts.staffId || undefined,
        status_list: statusListParsed,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("fetch-by-source")
    .description("Fetch a todo task by source ID")
    .argument("<sourceId>", "Source ID")
    .argument("<orgId>", "Organization ID")
    .option("--staff-id <staffId>", "Staff ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (sourceId, orgId, opts) => {
      const client = getClient();
      const result = await client.fetchTodoTaskBySourceId(sourceId, orgId, {
        staff_id: opts.staffId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("fetch-by-id")
    .description("Fetch a todo task by ID")
    .argument("<todotaskId>", "Todo task ID")
    .argument("<orgId>", "Organization ID")
    .option("--staff-id <staffId>", "Staff ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (todotaskId, orgId, opts) => {
      const client = getClient();
      const result = await client.fetchTodoTaskById(todotaskId, orgId, {
        staff_id: opts.staffId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("status-counts")
    .description("Fetch todo task status counts")
    .argument("<staffId>", "Staff ID")
    .argument("<orgId>", "Organization ID")
    .option("--app-id <appId>", "App ID", "")
    .option("--status <ids>", "Status list (comma-separated)")
    .option("--user-token <token>", "User token", "")
    .action(async (staffId, orgId, opts) => {
      const client = getClient();
      const statusParsed = opts.status ? commaList(opts.status) : undefined;
      const result = await client.fetchTodoTaskStatusCounts(staffId, orgId, {
        app_id: opts.appId || undefined,
        status_list: statusParsed,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("executor-status")
    .description("Update executor status list for a todo task")
    .argument("<executorStatusList>", "Executor status list as JSON: '[{\"executorId\":\"x\",\"status\":\"22\"}]'")
    .argument("<orgId>", "Organization ID")
    .option("--task-id <taskId>", "Todo task ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (executorStatusList, orgId, opts) => {
      const client = getClient();
      const parsed = parseJsonOption(executorStatusList);
      const result = await client.updateExecutorStatus(parsed, orgId, {
        todotask_id: opts.taskId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("add-executors")
    .description("Add executors to a todo task")
    .argument("<executorIds>", "Executor IDs (comma-separated)")
    .argument("<orgId>", "Organization ID")
    .option("--task-id <taskId>", "Todo task ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (executorIds, orgId, opts) => {
      const client = getClient();
      const ids = commaList(executorIds);
      const result = await client.addExecutors(ids, orgId, {
        todotask_id: opts.taskId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("delete-executors")
    .description("Remove executors from a todo task")
    .argument("<executorIds>", "Executor IDs (comma-separated)")
    .argument("<orgId>", "Organization ID")
    .option("--task-id <taskId>", "Todo task ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (executorIds, orgId, opts) => {
      const client = getClient();
      const ids = commaList(executorIds);
      const result = await client.deleteExecutors(ids, orgId, {
        todotask_id: opts.taskId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("executor-list")
    .description("List executors of a todo task")
    .argument("<todotaskId>", "Todo task ID")
    .argument("<orgId>", "Organization ID")
    .option("--staff-id <staffId>", "Staff ID", "")
    .option("--status <ids>", "Status list (comma-separated)")
    .option("--user-token <token>", "User token", "")
    .action(async (todotaskId, orgId, opts) => {
      const client = getClient();
      const statusParsed = opts.status ? commaList(opts.status) : undefined;
      const result = await client.fetchExecutorList(todotaskId, orgId, {
        staff_id: opts.staffId || undefined,
        status_list: statusParsed,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });
}