import { Command } from "commander";
import { getClient, outputResult, outputList, checkError, parseJsonOption } from "../utils";

export function registerCalendarCommands(program: Command) {
  const cmd = program.command("calendar").description("Calendar and schedule operations");

  cmd
    .command("primary")
    .description("Fetch primary calendar")
    .option("--user-token <token>", "User token", "")
    .option("--user-id <userId>", "User ID", "")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchPrimaryCalendar({
        user_token: opts.userToken || undefined,
        user_id: opts.userId || undefined,
      });
      checkError(result);
      outputResult(result, ["calendar_id", "summary", "description", "permissions", "role"], "Primary Calendar");
    });

  cmd
    .command("create-schedule")
    .description("Create a schedule/event")
    .argument("<calendarId>", "Calendar ID")
    .argument("<summary>", "Schedule summary/title")
    .argument("<startTime>", "Start time (unix timestamp in seconds)")
    .argument("<endTime>", "End time (unix timestamp in seconds)")
    .argument("<attendees>", "Attendees as JSON list: '[{\"staffId\":\"xxx\",\"attendeeFlag\":\"yes\"}]'")
    .option("-d, --desc <desc>", "Schedule description", "")
    .option("--all-day <allDay>", "yes or no", "no")
    .option("--date <date>", "Date string for allDay=yes, e.g. 2026-01-01", "")
    .option("--repeat <repeat>", "Repeat type: no, daily, weekly, monthly, yearly, work_day, custom", "no")
    .option("--reminder <reminder>", "Reminder type: yes or no", "yes")
    .option("--tz <tz>", "Time zone, e.g. Asia/Shanghai", "Asia/Shanghai")
    .option("--rule <rule>", "Repeat rule (RFC 5545 JSON)", "")
    .option("--expire <expire>", "Expire date type: yes or no", "")
    .option("--attendee-perms <perms>", "Attendee permissions: can_modify/can_invite/can_see/none", "")
    .option("--user-token <token>", "User token", "")
    .option("--user-id <userId>", "User ID", "")
    .action(async (calendarId, summary, startTime, endTime, attendees, opts) => {
      const client = getClient();
      const attendeesList = parseJsonOption(attendees);
      const startTimeInt = parseInt(startTime);
      const endTimeInt = parseInt(endTime);
      const startTimeDict: any = { time: startTimeInt, date: opts.date, timeZone: opts.tz };
      const endTimeDict: any = { time: endTimeInt, date: opts.date, timeZone: opts.tz };
      if (opts.allDay === "yes") {
        startTimeDict.timeZone = "UTC";
        endTimeDict.timeZone = "UTC";
      }
      const result = await client.createSchedule(calendarId, summary, startTimeDict, endTimeDict, attendeesList, {
        description: opts.desc || undefined,
        all_day: opts.allDay,
        repeat_type: opts.repeat,
        reminder_type: opts.reminder,
        rule: opts.rule || undefined,
        expire_date_type: opts.expire || undefined,
        attendee_permissions: opts.attendeePerms || undefined,
        user_token: opts.userToken || undefined,
        user_id: opts.userId || undefined,
      });
      checkError(result);
      outputResult(result, ["schedule_id"], "Create Schedule Result");
    });

  cmd
    .command("fetch-schedule")
    .description("Fetch a schedule by ID")
    .argument("<calendarId>", "Calendar ID")
    .argument("<scheduleId>", "Schedule ID")
    .option("--user-token <token>", "User token", "")
    .option("--user-id <userId>", "User ID", "")
    .action(async (calendarId, scheduleId, opts) => {
      const client = getClient();
      const result = await client.fetchSchedule(calendarId, scheduleId, {
        user_token: opts.userToken || undefined,
        user_id: opts.userId || undefined,
      });
      checkError(result);
      outputResult(result, ["schedule_id", "summary", "description", "all_day", "start_time", "end_time", "creator", "rsvp_status"], "Schedule Info");
    });

  cmd
    .command("delete-schedule")
    .description("Delete a schedule")
    .argument("<calendarId>", "Calendar ID")
    .argument("<scheduleId>", "Schedule ID")
    .option("--user-token <token>", "User token", "")
    .option("--user-id <userId>", "User ID", "")
    .action(async (calendarId, scheduleId, opts) => {
      const client = getClient();
      const result = await client.deleteSchedule(calendarId, scheduleId, {
        user_token: opts.userToken || undefined,
        user_id: opts.userId || undefined,
      });
      checkError(result);
      outputResult(result, ["schedule_id"], "Delete Schedule Result");
    });

  cmd
    .command("list-schedules")
    .description("List schedules in a time range")
    .argument("<calendarId>", "Calendar ID")
    .argument("<startTime>", "Start time (unix timestamp)")
    .argument("<endTime>", "End time (unix timestamp)")
    .option("--user-token <token>", "User token", "")
    .option("--user-id <userId>", "User ID", "")
    .action(async (calendarId, startTime, endTime, opts) => {
      const client = getClient();
      const result = await client.fetchScheduleList(calendarId, parseInt(startTime), parseInt(endTime), {
        user_token: opts.userToken || undefined,
        user_id: opts.userId || undefined,
      });
      checkError(result);
      if (result.success && result.schedule_list && result.schedule_list.length > 0) {
        outputList(result.schedule_list, ["Schedule ID", "Summary"], (s: any) => [
          s.scheduleId || "", s.summary || "",
        ]);
      } else {
        outputResult(result, undefined, "Schedule List");
      }
    });

  cmd
    .command("attendees")
    .description("Fetch schedule attendees")
    .argument("<calendarId>", "Calendar ID")
    .argument("<scheduleId>", "Schedule ID")
    .option("--user-token <token>", "User token", "")
    .option("--user-id <userId>", "User ID", "")
    .option("-p, --page <page>", "Page number", "1")
    .option("-s, --size <size>", "Page size", "500")
    .action(async (calendarId, scheduleId, opts) => {
      const client = getClient();
      const result = await client.fetchScheduleAttendees(calendarId, scheduleId, {
        user_token: opts.userToken || undefined,
        user_id: opts.userId || undefined,
        page: parseInt(opts.page),
        page_size: parseInt(opts.size),
      });
      checkError(result);
      outputResult(result, ["total"], "Schedule Attendees");
    });

  cmd
    .command("add-attendees")
    .description("Add attendees to a schedule")
    .argument("<calendarId>", "Calendar ID")
    .argument("<scheduleId>", "Schedule ID")
    .argument("<attendees>", "Attendee staff IDs as JSON list: '[\"id1\",\"id2\"]'")
    .option("--reminder <reminder>", "Reminder type: yes or no", "")
    .option("--user-token <token>", "User token", "")
    .option("--user-id <userId>", "User ID", "")
    .action(async (calendarId, scheduleId, attendees, opts) => {
      const client = getClient();
      const attendeesList = parseJsonOption(attendees);
      const result = await client.addScheduleAttendees(calendarId, scheduleId, attendeesList, {
        reminder_type: opts.reminder || undefined,
        user_token: opts.userToken || undefined,
        user_id: opts.userId || undefined,
      });
      checkError(result);
      outputResult(result, ["schedule_id"], "Add Attendees Result");
    });

  cmd
    .command("delete-attendees")
    .description("Remove attendees from a schedule")
    .argument("<calendarId>", "Calendar ID")
    .argument("<scheduleId>", "Schedule ID")
    .argument("<attendees>", "Attendee staff IDs as JSON list")
    .option("--reminder <reminder>", "Reminder type: yes or no", "")
    .option("--user-token <token>", "User token", "")
    .option("--user-id <userId>", "User ID", "")
    .action(async (calendarId, scheduleId, attendees, opts) => {
      const client = getClient();
      const attendeesList = parseJsonOption(attendees);
      const result = await client.deleteScheduleAttendees(calendarId, scheduleId, attendeesList, {
        reminder_type: opts.reminder || undefined,
        user_token: opts.userToken || undefined,
        user_id: opts.userId || undefined,
      });
      checkError(result);
      outputResult(result, ["schedule_id"], "Delete Attendees Result");
    });

  cmd
    .command("update-schedule")
    .description("Update a schedule")
    .argument("<calendarId>", "Calendar ID")
    .argument("<scheduleId>", "Schedule ID")
    .option("--summary <summary>", "New schedule summary", "")
    .option("-d, --desc <desc>", "New description", "")
    .option("--op <op>", "Operation type: modify_all, modify_current, modify_current_after", "modify_all")
    .option("--current-time <time>", "Required when op != modify_all", "0")
    .option("--reminder <reminder>", "Reminder type: yes or no", "")
    .option("--repeat <repeat>", "Repeat type: no, day, week, month, year, work_day, custom", "")
    .option("--rule <rule>", "RFC 5545 repeat rule", "")
    .option("--expire <expire>", "Expire date type: yes or no", "")
    .option("--all-day <allDay>", "All day: yes or no", "")
    .option("--permissions <permissions>", "Attendee permissions: can_modify, can_invite, can_see, none", "")
    .option("--start-time <json>", "Start time as JSON dict: {\"time\":..., \"date\":..., \"timeZone\":...}", "")
    .option("--end-time <json>", "End time as JSON dict", "")
    .option("--user-token <token>", "User token", "")
    .option("--user-id <userId>", "User ID", "")
    .action(async (calendarId, scheduleId, opts) => {
      const client = getClient();
      const startTimeDict = opts.startTime ? parseJsonOption(opts.startTime) : undefined;
      const endTimeDict = opts.endTime ? parseJsonOption(opts.endTime) : undefined;
      const result = await client.updateSchedule(calendarId, scheduleId, {
        summary: opts.summary || undefined,
        description: opts.desc || undefined,
        operation_type: opts.op,
        current_time: opts.currentTime ? parseInt(opts.currentTime) : undefined,
        reminder_type: opts.reminder || undefined,
        repeat_type: opts.repeat || undefined,
        rule: opts.rule || undefined,
        expire_date_type: opts.expire || undefined,
        all_day: opts.allDay || undefined,
        attendee_permissions: opts.permissions || undefined,
        start_time: startTimeDict,
        end_time: endTimeDict,
        user_token: opts.userToken || undefined,
        user_id: opts.userId || undefined,
      });
      checkError(result);
      outputResult(result, ["schedule_ids"], "Update Schedule Result");
    });

  cmd
    .command("attendee-meta")
    .description("Update attendee metadata (rsvp, busy/free, reminders)")
    .argument("<calendarId>", "Calendar ID")
    .argument("<scheduleId>", "Schedule ID")
    .option("--rsvp <rsvp>", "RSVP status: accept, tentative, decline", "")
    .option("--color <color>", "Hex color (e.g. #FF347AFC)", "")
    .option("--permissions <permissions>", "Visibility: private, public, default", "")
    .option("--busy-free <state>", "Busy/free state: busy, free", "")
    .option("--remind-times <json>", "Reminder offsets in minutes as JSON list, e.g. '[5,15]'", "")
    .option("--user-token <token>", "User token", "")
    .option("--user-id <userId>", "User ID", "")
    .action(async (calendarId, scheduleId, opts) => {
      const client = getClient();
      const remindTimesList = opts.remindTimes ? parseJsonOption(opts.remindTimes) : undefined;
      const result = await client.updateScheduleAttendeeMeta(calendarId, scheduleId, {
        rsvp_status: opts.rsvp || undefined,
        color: opts.color || undefined,
        permissions: opts.permissions || undefined,
        busy_free_state: opts.busyFree || undefined,
        remind_times: remindTimesList,
        user_token: opts.userToken || undefined,
        user_id: opts.userId || undefined,
      });
      checkError(result);
      outputResult(result, undefined, "Update Attendee Meta Result");
    });
}
