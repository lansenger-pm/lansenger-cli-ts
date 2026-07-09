import { Command } from "commander";
import { getClient, outputResult, checkError, parseJsonOption } from "../utils";

export function registerLeaveCommands(program: Command) {
  const cmd = program.command("leave").description("Manage leave");

  cmd
    .command("config")
    .description("Get leave config for a staff member")
    .argument("<orgId>", "Organization ID")
    .argument("<staffId>", "Staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, staffId, opts) => {
      const client = getClient();
      const result = await client.getLeaveConfig(orgId, staffId, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("types")
    .description("Get leave types")
    .argument("<cmcId>", "CMC ID")
    .option("--user-token <token>", "User token", "")
    .action(async (cmcId, opts) => {
      const client = getClient();
      const result = await client.getLeaveTypes(parseInt(cmcId), { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("groups")
    .description("Get leave groups for a staff member")
    .argument("<orgId>", "Organization ID")
    .argument("<staffId>", "Staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, staffId, opts) => {
      const client = getClient();
      const result = await client.getLeaveGroups(orgId, staffId, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("balance")
    .description("Get leave balance for a staff member")
    .argument("<orgId>", "Organization ID")
    .argument("<staffId>", "Staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, staffId, opts) => {
      const client = getClient();
      const result = await client.getLeaveBalance(orgId, staffId, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("calc-times")
    .description("Calculate leave duration")
    .argument("<beginTime>", "Begin time (unix timestamp)")
    .argument("<endTime>", "End time (unix timestamp)")
    .option("--cmc-id <cmcId>", "CMC ID")
    .option("--group-code <groupCode>", "Group code")
    .option("--user-token <token>", "User token", "")
    .action(async (beginTime, endTime, opts) => {
      const client = getClient();
      const result = await client.calculateLeaveDuration(
        parseInt(beginTime),
        parseInt(endTime),
        { cmc_id: opts.cmcId, group_code: opts.groupCode, user_token: opts.userToken }
      );
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("upload-url")
    .description("Get leave upload URL")
    .argument("<fileName>", "File name")
    .argument("<md5>", "File MD5 hash")
    .argument("<orgId>", "Organization ID")
    .argument("<size>", "File size in bytes")
    .option("--user-token <token>", "User token", "")
    .action(async (fileName, md5, orgId, size, opts) => {
      const client = getClient();
      const result = await client.getLeaveUploadURL(fileName, md5, orgId, parseInt(size), { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("submit")
    .description("Submit a leave application")
    .argument("<jsonBody>", "JSON body for the leave submission")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.submitLeave(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("list")
    .description("List my leave applications")
    .argument("<jsonBody>", "JSON body for the list query")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.getLeaveMyApplyList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });
}
