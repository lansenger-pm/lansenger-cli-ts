"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCalendarCommands = registerCalendarCommands;
const utils_1 = require("../utils");
function registerCalendarCommands(program) {
    const cmd = program.command("calendar").description("Manage calendars and schedules");
    cmd
        .command("primary")
        .description("Fetch primary calendar")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.fetchPrimaryCalendar({ user_token: opts.userToken || undefined });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("create-schedule")
        .description("Create a schedule/event")
        .requiredOption("--calendar-id <calendarId>", "Calendar ID")
        .requiredOption("--summary <summary>", "Schedule summary/title")
        .requiredOption("--start-time <json>", "Start time JSON")
        .requiredOption("--end-time <json>", "End time JSON")
        .requiredOption("--attendees <json>", "Attendees JSON array")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const startTime = (0, utils_1.parseJsonOption)(opts.startTime);
        const endTime = (0, utils_1.parseJsonOption)(opts.endTime);
        const attendees = (0, utils_1.parseJsonOption)(opts.attendees);
        const result = await client.createSchedule(opts.calendarId, opts.summary, startTime, endTime, attendees, {
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("fetch-schedule")
        .description("Fetch a schedule by ID")
        .requiredOption("--calendar-id <calendarId>", "Calendar ID")
        .requiredOption("--schedule-id <scheduleId>", "Schedule ID")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.fetchSchedule(opts.calendarId, opts.scheduleId, { user_token: opts.userToken || undefined });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("delete-schedule")
        .description("Delete a schedule")
        .requiredOption("--calendar-id <calendarId>", "Calendar ID")
        .requiredOption("--schedule-id <scheduleId>", "Schedule ID")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.deleteSchedule(opts.calendarId, opts.scheduleId, { user_token: opts.userToken || undefined });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("list-schedules")
        .description("List schedules in a time range")
        .requiredOption("--calendar-id <calendarId>", "Calendar ID")
        .requiredOption("--start-ts <startTs>", "Start timestamp (seconds)")
        .requiredOption("--end-ts <endTs>", "End timestamp (seconds)")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.fetchScheduleList(opts.calendarId, parseInt(opts.startTs), parseInt(opts.endTs), {
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("attendees")
        .description("Fetch schedule attendees")
        .requiredOption("--calendar-id <calendarId>", "Calendar ID")
        .requiredOption("--schedule-id <scheduleId>", "Schedule ID")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.fetchScheduleAttendees(opts.calendarId, opts.scheduleId, { user_token: opts.userToken || undefined });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("add-attendees")
        .description("Add attendees to a schedule")
        .requiredOption("--calendar-id <calendarId>", "Calendar ID")
        .requiredOption("--schedule-id <scheduleId>", "Schedule ID")
        .requiredOption("--attendees <ids>", "Comma-separated attendee staff IDs")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const attendees = (0, utils_1.commaList)(opts.attendees);
        const result = await client.addScheduleAttendees(opts.calendarId, opts.scheduleId, attendees, {
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("delete-attendees")
        .description("Remove attendees from a schedule")
        .requiredOption("--calendar-id <calendarId>", "Calendar ID")
        .requiredOption("--schedule-id <scheduleId>", "Schedule ID")
        .requiredOption("--attendees <ids>", "Comma-separated attendee staff IDs")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const attendees = (0, utils_1.commaList)(opts.attendees);
        const result = await client.deleteScheduleAttendees(opts.calendarId, opts.scheduleId, attendees, {
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("update-schedule")
        .description("Update a schedule")
        .requiredOption("--calendar-id <calendarId>", "Calendar ID")
        .requiredOption("--schedule-id <scheduleId>", "Schedule ID")
        .option("--summary <summary>", "New summary/title")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.updateSchedule(opts.calendarId, opts.scheduleId, {
            summary: opts.summary || undefined,
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("attendee-meta")
        .description("Update attendee metadata (rsvp, busy/free, reminders)")
        .requiredOption("--calendar-id <calendarId>", "Calendar ID")
        .requiredOption("--schedule-id <scheduleId>", "Schedule ID")
        .option("--rsvp-status <status>", "RSVP status")
        .option("--busy-free-state <state>", "Busy/free state")
        .option("--remind-times <times>", "Comma-separated reminder times (seconds before event)")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const remindTimes = opts.remindTimes ? (0, utils_1.commaList)(opts.remindTimes).map(Number) : undefined;
        const result = await client.updateScheduleAttendeeMeta(opts.calendarId, opts.scheduleId, {
            rsvp_status: opts.rsvpStatus || undefined,
            busy_free_state: opts.busyFreeState || undefined,
            remind_times: remindTimes,
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
}
