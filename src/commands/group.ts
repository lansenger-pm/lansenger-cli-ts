import { Command } from "commander";
import { getClient, outputResult, checkError, commaList } from "../utils";

export function registerGroupCommands(program: Command) {
  const cmd = program.command("group").description("Manage groups");

  cmd
    .command("create")
    .description("Create a new group")
    .argument("<name>", "Group name")
    .argument("<orgId>", "Organization ID")
    .option("--owner <ownerId>", "Owner staff ID", "")
    .option("-d, --desc <desc>", "Group description", "")
    .option("--avatar <avatarId>", "Avatar ID", "")
    .option("--staff <ids>", "Staff IDs to add, comma-separated")
    .option("--dept <ids>", "Department IDs to add, comma-separated")
    .option("--user-token <token>", "User token", "")
    .action(async (name, orgId, opts) => {
      const client = getClient();
      const result = await client.createGroup(name, orgId, {
        owner_id: opts.owner || undefined,
        description: opts.desc || undefined,
        avatar_id: opts.avatar || undefined,
        staff_id_list: opts.staff ? commaList(opts.staff) : undefined,
        department_id_list: opts.dept ? commaList(opts.dept) : undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("info")
    .description("Fetch group info")
    .argument("<groupId>", "Group ID")
    .option("--user-token <token>", "User token", "")
    .action(async (groupId, opts) => {
      const client = getClient();
      const result = await client.fetchGroupInfo(groupId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("members")
    .description("Fetch group members")
    .argument("<groupId>", "Group ID")
    .option("--user-token <token>", "User token", "")
    .option("-p, --page <page>", "Page offset", "0")
    .option("-s, --size <size>", "Page size", "100")
    .action(async (groupId, opts) => {
      const client = getClient();
      const result = await client.fetchGroupMembers(groupId, {
        user_token: opts.userToken || undefined,
        page_offset: parseInt(opts.page),
        page_size: parseInt(opts.size),
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("list")
    .description("List all groups")
    .option("--user-token <token>", "User token", "")
    .option("-p, --page <page>", "Page offset", "0")
    .option("-s, --size <size>", "Page size", "100")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchGroupList({
        user_token: opts.userToken || undefined,
        page_offset: parseInt(opts.page),
        page_size: parseInt(opts.size),
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("check")
    .description("Check if a user is in a group")
    .argument("<groupId>", "Group ID")
    .option("--user-token <token>", "User token", "")
    .option("--staff-id <staffId>", "Staff ID to check", "")
    .action(async (groupId, opts) => {
      const client = getClient();
      const result = await client.checkIsInGroup(groupId, {
        staff_id: opts.staffId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("update")
    .description("Update group info")
    .argument("<groupId>", "Group ID")
    .option("--name <name>", "New group name", "")
    .option("--desc <desc>", "New description", "")
    .option("--owner <ownerId>", "New owner ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (groupId, opts) => {
      const client = getClient();
      const result = await client.updateGroupInfo(groupId, {
        name: opts.name || undefined,
        description: opts.desc || undefined,
        owner_id: opts.owner || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("update-members")
    .description("Add or remove group members")
    .argument("<groupId>", "Group ID")
    .option("--add <ids>", "Staff IDs to add, comma-separated")
    .option("--remove <ids>", "Staff IDs to remove, comma-separated")
    .option("--add-dept <ids>", "Department IDs to add, comma-separated")
    .option("--user-token <token>", "User token", "")
    .action(async (groupId, opts) => {
      const client = getClient();
      const result = await client.updateGroupMembers(groupId, {
        add_user_list: opts.add ? commaList(opts.add) : undefined,
        del_user_list: opts.remove ? commaList(opts.remove) : undefined,
        add_department_id_list: opts.addDept ? commaList(opts.addDept) : undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("dismiss")
    .description("Dismiss/delete a group")
    .argument("<groupId>", "Group ID to dismiss/delete")
    .option("--user-token <token>", "User token", "")
    .action(async (groupId, opts) => {
      const client = getClient();
      const result = await client.dismissGroup(groupId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });
}