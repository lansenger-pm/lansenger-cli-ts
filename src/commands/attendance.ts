import { Command } from "commander";
import { getClient, outputResult, checkError, parseJsonOption } from "../utils";

export function registerAttendanceCommands(program: Command) {
  const cmd = program.command("attendance").description("Manage attendance");

  cmd
    .command("associate-list")
    .description("Get associate list")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.associateList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("out-my-list")
    .description("Get my out list")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.outMyList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("out-unused")
    .description("Get unused out records")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.outUnused(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("out-submit")
    .description("Submit an out record")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.outSubmit(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("daily-stat")
    .description("Get daily statistics")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.dailyStat(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("clock-records")
    .description("Get clock records")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.clockRecords(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("staff-records")
    .description("Get staff records")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.staffRecords(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("group-info")
    .description("Get group info")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.groupInfo(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("makeup-count")
    .description("Get makeup count")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.makeupCount(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("abnormal-list")
    .description("Get abnormal list")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.abnormalList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("makeup-list")
    .description("Get makeup list")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.makeupList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("makeup-submit")
    .description("Submit a makeup record")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.makeupSubmit(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("download")
    .description("Download attendance data")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.download(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("upload-url")
    .description("Get attendance upload URL")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.uploadUrl(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("upload")
    .description("Upload attendance data")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.upload(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });
}
