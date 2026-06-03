import { Command } from "commander";
import { getClient, outputResult, checkError, commaList } from "../utils";

export function registerGroupCommands(program: Command) {
  const cmd = program.command("group").description("Manage groups");

  cmd
    .command("create")
    .description("Create a new group")
    .requiredOption("--name <name>", "Group name")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .option("--staff-id-list <ids>", "Comma-separated initial member staff IDs")
    .option("--owner-id <ownerId>", "Group owner ID")
    .action(async (opts) => {
      const client = getClient();
      const staffIdList = opts.staffIdList ? commaList(opts.staffIdList) : undefined;
      const result = await client.createGroup(opts.name, opts.orgId, {
        staff_id_list: staffIdList,
        owner_id: opts.ownerId || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("info")
    .description("Fetch group info")
    .requiredOption("--group-id <groupId>", "Group ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchGroupInfo(opts.groupId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("members")
    .description("Fetch group members")
    .requiredOption("--group-id <groupId>", "Group ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchGroupMembers(opts.groupId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("list")
    .description("List all groups")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchGroupList({ user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("check")
    .description("Check if a user is in a group")
    .requiredOption("--group-id <groupId>", "Group ID")
    .option("--staff-id <staffId>", "Staff ID to check")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.checkIsInGroup(opts.groupId, {
        staff_id: opts.staffId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("update")
    .description("Update group info")
    .requiredOption("--group-id <groupId>", "Group ID")
    .option("--name <name>", "New group name")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.updateGroupInfo(opts.groupId, {
        name: opts.name || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("update-members")
    .description("Add or remove group members")
    .requiredOption("--group-id <groupId>", "Group ID")
    .option("--add <ids>", "Comma-separated staff IDs to add")
    .option("--del <ids>", "Comma-separated staff IDs to remove")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const addUserList = opts.add ? commaList(opts.add) : undefined;
      const delUserList = opts.del ? commaList(opts.del) : undefined;
      const result = await client.updateGroupMembers(opts.groupId, {
        add_user_list: addUserList,
        del_user_list: delUserList,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("dismiss")
    .description("Dismiss/delete a group")
    .requiredOption("--group-id <groupId>", "Group ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.dismissGroup(opts.groupId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });
}