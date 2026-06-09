import { Command } from "commander";
import { getClient, outputResult, checkError } from "../utils";

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
    .option("--staff <ids...>", "Staff IDs to add (space-separated)")
    .option("--dept <ids...>", "Department IDs to add (space-separated)")
    .option("--user-token <token>", "User token", "")
    .action(async (name, orgId, opts) => {
      const client = getClient();
      const result = await client.createGroup(name, orgId, {
        owner_id: opts.owner || undefined,
        description: opts.desc || undefined,
        avatar_id: opts.avatar || undefined,
        staff_id_list: opts.staff || undefined,
        department_id_list: opts.dept || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["group_id", "total_members"], "Create Group Result");
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
      outputResult(result, ["name", "description", "owner", "creator", "state", "manage_mode", "is_public", "max_members", "total_members"], "Group Info");
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
      outputResult(result, ["total_members"], "Group Members");
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
      outputResult(result, ["total_group_ids"], "Group List");
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
      outputResult(result, ["is_in_group"], "Is In Group");
    });

  cmd
    .command("update")
    .description("Update group info")
    .argument("<groupId>", "Group ID")
    .option("--name <name>", "New group name", "")
    .option("--desc <desc>", "New description", "")
    .option("--owner <ownerId>", "New owner ID", "")
    .option("--avatar <avatarId>", "New avatar ID", "")
    .option("--assistant <ids...>", "Staff IDs to promote to assistant")
    .option("--demote-assistant <ids...>", "Staff IDs to demote from assistant")
    .option("--manage-mode <mode>", "0=all manage, 1=owner only")
    .option("--location-share", "Enable location sharing")
    .option("--no-location-share", "Disable location sharing")
    .option("--needs-confirm", "Join requires confirmation")
    .option("--no-needs-confirm", "Join does not require confirmation")
    .option("--is-public", "Public visibility")
    .option("--no-is-public", "Not public")
    .option("--max-members <count>", "Maximum member count")
    .option("--max-history <count>", "Max history message count")
    .option("--remind-all", "@mention enabled")
    .option("--no-remind-all", "@mention disabled")
    .option("--mute", "Group mute on")
    .option("--no-mute", "Group mute off")
    .option("--user-token <token>", "User token", "")
    .action(async (groupId, opts) => {
      const client = getClient();
      const result = await client.updateGroupInfo(groupId, {
        name: opts.name || undefined,
        description: opts.desc || undefined,
        owner_id: opts.owner || undefined,
        avatar_id: opts.avatar || undefined,
        assistant: opts.assistant || undefined,
        demote_assistant: opts.demoteAssistant || undefined,
        manage_mode: opts.manageMode ? parseInt(opts.manageMode) : undefined,
        location_share: opts.locationShare !== undefined ? opts.locationShare : undefined,
        needs_confirm: opts.needsConfirm !== undefined ? opts.needsConfirm : undefined,
        is_public: opts.isPublic !== undefined ? opts.isPublic : undefined,
        max_members: opts.maxMembers ? parseInt(opts.maxMembers) : undefined,
        max_history_msg_count: opts.maxHistory ? parseInt(opts.maxHistory) : undefined,
        remind_all: opts.remindAll !== undefined ? opts.remindAll : undefined,
        send_msg_status: opts.mute !== undefined ? opts.mute : undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("update-members")
    .description("Add or remove group members")
    .argument("<groupId>", "Group ID")
    .option("--add <ids...>", "Staff IDs to add (space-separated)")
    .option("--remove <ids...>", "Staff IDs to remove (space-separated)")
    .option("--add-dept <ids...>", "Department IDs to add (space-separated)")
    .option("--user-token <token>", "User token", "")
    .action(async (groupId, opts) => {
      const client = getClient();
      const result = await client.updateGroupMembers(groupId, {
        add_user_list: opts.add || undefined,
        del_user_list: opts.remove || undefined,
        add_department_id_list: opts.addDept || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["total_members", "added_staff_count", "deleted_staff_count"], "Update Members Result");
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