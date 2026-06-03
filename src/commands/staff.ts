import { Command } from "commander";
import { getClient, outputResult, checkError } from "../utils";

export function registerStaffCommands(program: Command) {
  const cmd = program.command("staff").description("Query staff/employee information");

  cmd
    .command("basic-info")
    .description("Fetch basic staff info")
    .requiredOption("--staff-id <staffId>", "Staff ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchStaffBasicInfo(opts.staffId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("detail")
    .description("Fetch detailed staff info")
    .requiredOption("--staff-id <staffId>", "Staff ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchStaffDetail(opts.staffId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("ancestors")
    .description("Fetch department ancestors for a staff member")
    .requiredOption("--staff-id <staffId>", "Staff ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchDepartmentAncestors(opts.staffId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("id-mapping")
    .description("Map an ID (phone/email/etc.) to a staff ID")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .requiredOption("--id-type <idType>", "ID type (e.g. mobile_phone, email)")
    .requiredOption("--id-value <idValue>", "ID value to look up")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchStaffIdMapping(opts.orgId, opts.idType, opts.idValue, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("search")
    .description("Search staff by keyword")
    .requiredOption("--keyword <keyword>", "Search keyword")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.searchStaff(opts.keyword, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("org-info")
    .description("Fetch organization info")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchOrgInfo(opts.orgId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("org-extra-fields")
    .description("Fetch organization extra field IDs")
    .requiredOption("--org-id <orgId>", "Organization ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchOrgExtraFieldIds(opts.orgId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });
}