import { Command } from "commander";
import { getClient, outputResult, checkError, parseJsonOption } from "../utils";

export function registerBoardroomCommands(program: Command) {
  const cmd = program.command("boardroom").description("Manage boardroom");

  cmd
    .command("room-schedule")
    .description("Get room schedule")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.roomSchedule(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("room-list")
    .description("List rooms")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.roomList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("room-detail")
    .description("Get room detail")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.roomDetail(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("reserve")
    .description("Reserve a room")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.reserve(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("reserve-detail")
    .description("Get reserve detail")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.reserveDetail(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("reserve-cancel")
    .description("Cancel a reserve")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.reserveCancel(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("remove-bind")
    .description("Remove binding")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.removeBind(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("reject-approve")
    .description("Reject an approval")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.rejectApprove(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("pending-approve-list")
    .description("Get pending approval list")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.pendingApproveList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("my-reserve-list")
    .description("Get my reserve list")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.myReserveList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("grading-list")
    .description("Get grading list")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.gradingList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("get-my-reserve-moom-list")
    .description("Get my reserve room list")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.getMyReserveMoomList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("get-my-reserve-by-source")
    .description("Get my reserve by source")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.getMyReserveBySource(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("edit-reserve")
    .description("Edit a reserve")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.editReserve(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("confirm-sign")
    .description("Confirm sign")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.confirmSign(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("change-approve")
    .description("Change approver")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.changeApprove(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("cancel")
    .description("Cancel")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client["cancel"](dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("bind")
    .description("Bind")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client["bind"](dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("batch-approve")
    .description("Batch approve")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.batchApprove(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("area-office-list")
    .description("Get area office list")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.areaOfficeList(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("approve-detail")
    .description("Get approve detail")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.approveDetail(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("agree-approve")
    .description("Agree an approval")
    .argument("<jsonBody>", "JSON body")
    .option("--user-token <token>", "User token", "")
    .action(async (jsonBody, opts) => {
      const client = getClient();
      const dto = parseJsonOption(jsonBody);
      const result = await client.agreeApprove(dto, { user_token: opts.userToken });
      checkError(result);
      outputResult(result);
    });
}
