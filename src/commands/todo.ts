import { Command } from "commander";
import { getClient, outputResult, checkError, commaList } from "../utils";

export function registerTodoCommands(program: Command) {
  const cmd = program.command("todo").description("Manage todo tasks");

  cmd
    .command("create")
    .description("Create a todo task")
    .requiredOption("--title <title>", "Task title")
    .requiredOption("--link <link>", "Task link URL")
    .requiredOption("--pc-link <pcLink>", "Task PC link URL")
    .requiredOption("--executor-ids <ids>", "Comma-separated executor staff IDs")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .option("--type <type>", "Task type (1=notification, 2=approval)", "1")
    .action(async (opts) => {
      const client = getClient();
      const executorIds = commaList(opts.executorIds);
      const result = await client.createTodoTask(opts.title, opts.link, opts.pcLink, executorIds, opts.orgId, parseInt(opts.type));
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("update")
    .description("Update a todo task")
    .requiredOption("--task-id <taskId>", "Todo task ID")
    .requiredOption("--title <title>", "New title")
    .requiredOption("--link <link>", "New link URL")
    .requiredOption("--pc-link <pcLink>", "New PC link URL")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.updateTodoTask(opts.taskId, opts.title, opts.link, opts.pcLink, opts.orgId);
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("update-status")
    .description("Update todo task status")
    .requiredOption("--task-id <taskId>", "Todo task ID")
    .requiredOption("--status <status>", "New status (11=pending_read,12=read,21=pending_do,22=done)")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.updateTodoTaskStatus(opts.taskId, opts.status, opts.orgId);
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("delete")
    .description("Delete a todo task")
    .requiredOption("--task-id <taskId>", "Todo task ID")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.deleteTodoTask(opts.taskId, opts.orgId);
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("list")
    .description("List todo tasks for an organization")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchTodoTaskList(opts.orgId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("fetch-by-id")
    .description("Fetch a todo task by ID")
    .requiredOption("--task-id <taskId>", "Todo task ID")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchTodoTaskById(opts.taskId, opts.orgId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("fetch-by-source")
    .description("Fetch a todo task by source ID")
    .requiredOption("--source-id <sourceId>", "Source ID")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchTodoTaskBySourceId(opts.sourceId, opts.orgId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("status-counts")
    .description("Fetch todo task status counts")
    .requiredOption("--staff-id <staffId>", "Staff ID")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchTodoTaskStatusCounts(opts.staffId, opts.orgId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("add-executors")
    .description("Add executors to a todo task")
    .requiredOption("--executor-ids <ids>", "Comma-separated executor staff IDs")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .option("--todotask-id <taskId>", "Todo task ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const executorIds = commaList(opts.executorIds);
      const result = await client.addExecutors(executorIds, opts.orgId, {
        todotask_id: opts.todotaskId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("delete-executors")
    .description("Remove executors from a todo task")
    .requiredOption("--executor-ids <ids>", "Comma-separated executor staff IDs")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .option("--todotask-id <taskId>", "Todo task ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const executorIds = commaList(opts.executorIds);
      const result = await client.deleteExecutors(executorIds, opts.orgId, {
        todotask_id: opts.todotaskId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("executor-list")
    .description("List executors of a todo task")
    .requiredOption("--task-id <taskId>", "Todo task ID")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchExecutorList(opts.taskId, opts.orgId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });
}