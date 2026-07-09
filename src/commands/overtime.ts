import { Command } from "commander";
import { getClient, outputResult, checkError, parseJsonOption } from "../utils";

export function registerOvertimeCommands(program: Command) {
  const cmd = program.command("overtime").description("Manage overtime");

  cmd
    .command("config")
    .description("Get overtime config for a staff member")
    .argument("<orgId>", "Organization ID")
    .argument("<staffId>", "Staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, staffId, opts) => {
      const client = getClient();
      const result = await client.getOvertimeConfig(orgId, staffId, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("types")
    .description("Get overtime types")
    .argument("<cmcId>", "CMC ID")
    .option("--user-token <token>", "User token", "")
    .action(async (cmcId, opts) => {
      const client = getClient();
      const result = await client.getOvertimeTypes(parseInt(cmcId), { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("groups")
    .description("Get overtime groups for a staff member")
    .argument("<orgId>", "Organization ID")
    .argument("<staffId>", "Staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, staffId, opts) => {
      const client = getClient();
      const result = await client.getOvertimeGroups(orgId, staffId, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("calc-duration")
    .description("Calculate overtime duration")
    .argument("<beginTime>", "Begin time (unix timestamp)")
    .argument("<endTime>", "End time (unix timestamp)")
    .option("--cmc-id <cmcId>", "CMC ID")
    .option("--group-code <groupCode>", "Group code")
    .option("--user-token <token>", "User token", "")
    .action(async (beginTime, endTime, opts) => {
      const client = getClient();
      const result = await client.calculateOvertimeDuration(
        parseInt(beginTime),
        parseInt(endTime),
        { cmc_id: opts.cmcId, group_code: opts.groupCode, user_token: opts.userToken }
      );
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("upload-url")
    .description("Get overtime upload URL")
    .argument("<fileName>", "File name")
    .argument("<md5>", "File MD5 hash")
    .argument("<orgId>", "Organization ID")
    .argument("<size>", "File size in bytes")
    .option("--user-token <token>", "User token", "")
    .action(async (fileName, md5, orgId, size, opts) => {
      const client = getClient();
      const result = await client.getOvertimeUploadURL(fileName, md5, orgId, parseInt(size), { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("submit")
    .description("Submit an overtime application")
    .argument("<jsonBody>", "JSON body for the overtime submission")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.submitOvertime(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("list")
    .description("List my overtime applications")
    .argument("<jsonBody>", "JSON body for the list query")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.getOvertimeMyApplyList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });
}
