import { Command } from "commander";
import { getClient, outputResult, checkError } from "../utils";

export function registerStaffCommands(program: Command) {
  const cmd = program.command("staff").description("Query staff/contacts information");

  cmd
    .command("basic-info")
    .description("Fetch basic staff info")
    .argument("<staffId>", "Staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (staffId, opts) => {
      const client = getClient();
      const result = await client.fetchStaffBasicInfo(staffId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("detail")
    .description("Fetch detailed staff info")
    .argument("<staffId>", "Staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (staffId, opts) => {
      const client = getClient();
      const result = await client.fetchStaffDetail(staffId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("ancestors")
    .description("Fetch department ancestors for a staff member")
    .argument("<staffId>", "Staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (staffId, opts) => {
      const client = getClient();
      const result = await client.fetchDepartmentAncestors(staffId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("id-mapping")
    .description("Map an ID (phone/email/etc.) to a staff ID")
    .argument("<orgId>", "Organization ID")
    .argument("<idType>", "ID type: phone, email, login_name, external_id")
    .argument("<idValue>", "ID value to map")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, idType, idValue, opts) => {
      const client = getClient();
      const result = await client.fetchStaffIdMapping(orgId, idType, idValue, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("org-extra-fields")
    .description("Fetch organization extra field IDs")
    .argument("<orgId>", "Organization ID")
    .option("--user-token <token>", "User token", "")
    .option("-p, --page <page>", "Page number", "1")
    .option("-s, --size <size>", "Page size", "1000")
    .action(async (orgId, opts) => {
      const client = getClient();
      const result = await client.fetchOrgExtraFieldIds(orgId, {
        user_token: opts.userToken || undefined,
        page: parseInt(opts.page),
        page_size: parseInt(opts.size),
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("search")
    .description("Search staff by keyword")
    .argument("<keyword>", "Search keyword")
    .option("--user-token <token>", "User token", "")
    .option("--user-id <userId>", "User ID context", "")
    .option("-R, --recursive", "Recursive search", true)
    .option("-S, --sector <ids...>", "Sector IDs (space-separated)")
    .option("-p, --page <page>", "Page number")
    .option("-s, --size <size>", "Page size")
    .action(async (keyword, opts) => {
      const client = getClient();
      const result = await client.searchStaff(keyword, {
        user_token: opts.userToken || undefined,
        user_id: opts.userId || undefined,
        recursive: opts.recursive,
        sector_ids: opts.sector || undefined,
        page: opts.page ? parseInt(opts.page) : undefined,
        page_size: opts.size ? parseInt(opts.size) : undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("org-info")
    .description("Fetch organization info")
    .argument("<orgId>", "Organization ID")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, opts) => {
      const client = getClient();
      const result = await client.fetchOrgInfo(orgId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });
}