import { Command } from "commander";
import { getClient, outputResult, checkError, commaList, parseJsonOption, confirmHighRisk } from "../utils";

export function registerBoardroomCommands(program: Command) {
  const cmd = program.command("boardroom").description("Meeting-room reservation (会议室预定 V2)");

  cmd
    .command("rooms")
    .description("Filter meeting rooms (paged)")
    .option("--grading-id <id>", "Grading (分区) ID", "")
    .option("--area-office-id <id>", "Office area ID", "")
    .option("--floor-ids <ids>", "Comma-separated floor IDs", "")
    .option("--equipment <list>", "Comma-separated equipment", "")
    .option("--time-start <str>", "Filter start (yyyy-MM-dd HH:mm)", "")
    .option("--time-end <str>", "Filter end (yyyy-MM-dd HH:mm)", "")
    .option("--date <date>", "Query date (yyyy-MM-dd)", "")
    .option("--page <no>", "Page number", "1")
    .option("--size <n>", "Page size", "10")
    .option("--user-token <token>", "User token", "")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchBoardroomList({
        grading_id: opts.gradingId || undefined,
        area_office_id: opts.areaOfficeId || undefined,
        floor_ids: opts.floorIds ? commaList(opts.floorIds) : undefined,
        equipment: opts.equipment ? commaList(opts.equipment) : undefined,
        reserve_time_start: opts.timeStart || undefined,
        reserve_time_end: opts.timeEnd || undefined,
        query_date: opts.date || undefined,
        page: Number(opts.page),
        limit: Number(opts.size),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["count", "items"], "Boardroom List");
    });

  cmd
    .command("room-detail")
    .description("Fetch meeting-room detail")
    .argument("<roomId>", "Meeting-room ID")
    .option("--user-token <token>", "User token", "")
    .action(async (roomId, opts) => {
      const client = getClient();
      const result = await client.fetchBoardroomDetail(roomId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["room_id", "name", "status", "people_num", "can_reserve_flag", "area_name", "address"], "Boardroom Detail");
    });

  cmd
    .command("schedule")
    .description("Fetch a room's bookings + deactivations for a date")
    .argument("<roomId>", "Meeting-room ID")
    .argument("<queryDate>", "Query date (yyyy-MM-dd)")
    .requiredOption("--grading-id <id>", "Grading (分区) ID")
    .option("--user-token <token>", "User token", "")
    .action(async (roomId, queryDate, opts) => {
      const client = getClient();
      const result = await client.fetchBoardroomSchedule(roomId, queryDate, opts.gradingId, {
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["room_id", "name", "people_num", "can_reserve_flag", "reserves", "deactivations"], "Room Schedule");
    });

  cmd
    .command("reserve-detail")
    .description("Fetch reservation detail (attendees, approval flow)")
    .argument("<reserveRoomId>", "Reservation ID")
    .option("--grading-id <id>", "Grading (分区) ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (reserveRoomId, opts) => {
      const client = getClient();
      const result = await client.fetchBoardroomReserveDetail(reserveRoomId, {
        grading_id: opts.gradingId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["reserve_id", "boardroom_name", "meeting_name", "status", "reserve_time_start", "reserve_time_end", "reserve_user_name", "people_number"], "Reserve Detail");
    });

  cmd
    .command("reserve")
    .description("Reserve a meeting room (single or repeating)")
    .argument("<boardRoomId>", "Meeting-room ID")
    .argument("<name>", "Meeting name")
    .requiredOption("--grading-id <id>", "Grading (分区) ID")
    .requiredOption("--start <str>", "Reserve start (yyyy-MM-dd HH:mm:ss)")
    .requiredOption("--end <str>", "Reserve end (yyyy-MM-dd HH:mm:ss)")
    .requiredOption("--notice-time <value>", "Meeting reminder: 不提醒/立即提醒/会前15分钟/会前30分钟/会前1小时/会前2小时/会前1天")
    .option("--people <n>", "Attendee count", "")
    .option("--toastmaster <name>", "Host (max 10 chars)", "")
    .option("--leader <name>", "Attending leader (max 200 chars)", "")
    .option("--leader-attend <flag>", "Leader attendance: 0=attend, 1=not attend", "")
    .option("--is-video <flag>", "Video meeting: 0=on, 1=off", "")
    .option("--video-name <name>", "Video meeting name", "")
    .option("--other-demand <text>", "Other meeting requirements", "")
    .option("--table-cards <flag>", "Table cards: 0=on, 1=off", "")
    .option("--invite <ids>", "Comma-separated attendee staff IDs", "")
    .option("--approvers <ids>", "Comma-separated approver staff IDs", "")
    .option("--reserve-type <type>", "0=single, 1=repeat", "0")
    .option("--repeat-type <type>", "day/week/month", "")
    .option("--repeat-days <days>", "Comma-separated repeat day numbers", "")
    .option("--skip <flag>", "Skip weekends/holidays: 0=skip, 1=don't", "")
    .option("--repeat-end <str>", "Repeat end (yyyy-MM-dd HH:mm:ss)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (boardRoomId, name, opts) => {
      const client = getClient();
      const result = await client.reserveBoardroom(boardRoomId, name, {
        grading_id: opts.gradingId,
        reserve_time_start: opts.start,
        reserve_time_end: opts.end,
        notice_time: opts.noticeTime,
        people_number: opts.people || undefined,
        toastmaster: opts.toastmaster || undefined,
        leader: opts.leader || undefined,
        leader_attend: opts.leaderAttend || undefined,
        is_video: opts.isVideo || undefined,
        video_name: opts.videoName || undefined,
        other_demand: opts.otherDemand || undefined,
        table_cards: opts.tableCards || undefined,
        invitation_user_list: opts.invite ? commaList(opts.invite) : undefined,
        user_list: opts.approvers ? commaList(opts.approvers) : undefined,
        reserve_type: opts.reserveType,
        repeat_type: opts.repeatType || undefined,
        repeat_days: opts.repeatDays ? commaList(opts.repeatDays).map(Number) : undefined,
        skip: opts.skip || undefined,
        repeat_end_date: opts.repeatEnd || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["reserve_id", "reserve_code", "boardroom_name", "meeting_name", "status", "reserve_time"], "Reserve Result");
    });

  cmd
    .command("edit-reserve")
    .description("Edit a reservation (only non-approval-flow bookings)")
    .argument("<reserveId>", "Reservation ID")
    .argument("<boardRoomId>", "Meeting-room ID")
    .argument("<name>", "Meeting name")
    .requiredOption("--grading-id <id>", "Grading (分区) ID")
    .requiredOption("--start <str>", "Reserve start (yyyy-MM-dd HH:mm:ss)")
    .requiredOption("--end <str>", "Reserve end (yyyy-MM-dd HH:mm:ss)")
    .requiredOption("--notice-time <value>", "Meeting reminder")
    .option("--edit-type <type>", "1=this booking, 2=this and following", "1")
    .option("--people <n>", "Attendee count", "")
    .option("--user-token <token>", "User token", "")
    .action(async (reserveId, boardRoomId, name, opts) => {
      const client = getClient();
      const result = await client.editBoardroomReserve(reserveId, boardRoomId, name, {
        grading_id: opts.gradingId,
        reserve_time_start: opts.start,
        reserve_time_end: opts.end,
        notice_time: opts.noticeTime,
        edit_type: opts.editType,
        people_number: opts.people || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["reserve_id", "reserve_code", "meeting_name", "status", "reserve_time"], "Edit Reserve Result");
    });

  cmd
    .command("cancel")
    .description("Cancel a reservation (status 0/1/5 only)")
    .argument("<reserveId>", "Reservation ID")
    .option("--reason <text>", "Cancel reason (max 200 chars)", "")
    .option("--cancel-type <type>", "1=this, 2=this and following, 3=all unfinished", "")
    .option("--notify", "Notify attendees", false)
    .option("--user-token <token>", "User token", "")
    .option("-y, --yes", "Confirm cancellation before executing", false)
    .option("--dry-run", "Validate inputs without cancelling", false)
    .action(async (reserveId, opts) => {
      confirmHighRisk("cancel", `reservation ${reserveId}`, opts.yes, opts.dryRun);
      if (opts.dryRun) return;
      const client = getClient();
      const result = await client.cancelBoardroomReserve(reserveId, {
        cancel_reason: opts.reason || undefined,
        cancel_type: opts.cancelType || undefined,
        is_send: opts.notify ? true : undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["done"], "Cancel Result");
    });

  cmd
    .command("confirm-sign")
    .description("Scan-code confirmation (status 1 only)")
    .argument("<reserveId>", "Reservation ID")
    .option("--user-token <token>", "User token", "")
    .action(async (reserveId, opts) => {
      const client = getClient();
      const result = await client.confirmBoardroomSign(reserveId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["done"], "Confirm Sign Result");
    });

  cmd
    .command("my-reserves")
    .description("Page my reservations with filters")
    .requiredOption("--grading-id <id>", "Grading (分区) ID")
    .option("--keys <text>", "Keyword search", "")
    .option("--start-time <str>", "Reserve start filter", "")
    .option("--end-time <str>", "Reserve end filter", "")
    .option("--room-id <id>", "Meeting-room ID", "")
    .option("--page <no>", "Page number", "1")
    .option("--size <n>", "Page size", "10")
    .option("--user-token <token>", "User token", "")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchMyBoardroomReserves(opts.gradingId, {
        keys: opts.keys || undefined,
        start_time: opts.startTime || undefined,
        end_time: opts.endTime || undefined,
        boardroom_id: opts.roomId || undefined,
        page: Number(opts.page),
        limit: Number(opts.size),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["count", "items"], "My Reservations");
    });

  cmd
    .command("gradings")
    .description("Fetch gradings visible to the user (gradingId source)")
    .option("--user-token <token>", "User token", "")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchBoardroomGradings({ user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["total", "gradings"], "Boardroom Gradings");
    });

  cmd
    .command("area-offices")
    .description("Fetch office areas under a grading")
    .argument("<gradingId>", "Grading (分区) ID")
    .option("--user-token <token>", "User token", "")
    .action(async (gradingId, opts) => {
      const client = getClient();
      const result = await client.fetchBoardroomAreaOffices(gradingId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["total", "areas"], "Office Areas");
    });
}
