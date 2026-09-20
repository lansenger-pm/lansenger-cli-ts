import { Command } from "commander";
import { getClient, outputResult, checkError, commaList, parseJsonOption, confirmHighRisk } from "../utils";

export function registerVideoconferenceCommands(program: Command) {
  const cmd = program.command("videoconference").description("Manage videoconference meetings (视频会议开放能力)");

  cmd
    .command("create")
    .description("Create a meeting (instant or reserved)")
    .argument("<subject>", "Meeting subject")
    .argument("<startTime>", "Start time (epoch ms)")
    .argument("<members>", "Members as JSON: '[{\"staffId\":\"s1\",\"employeeName\":\"Host\",\"role\":\"admin\"}]' (exactly one role='admin')")
    .argument("<orgId>", "Organization ID")
    .option("--auto-record <flag>", "Auto record: 0=off, 1=on", "0")
    .option("-t, --type <type>", "0=instant, 1=reserved", "1")
    .option("--group-new <flag>", "0/1", "0")
    .option("--conf-password <pwd>", "Meeting password", "")
    .option("--control-password <pwd>", "Host control password", "")
    .option("--mask-type <type>", "Mask type", "0")
    .option("--ext-attr <attr>", "Extension attribute", "")
    .option("--join-mute <flag>", "Join mute (PRS >=3.7)", "")
    .option("--open-mute <flag>", "Open mute (PRS >=3.7)", "")
    .option("--enable-pre-join <flag>", "Enable pre-join (PRS >=3.8)", "")
    .option("--user-stop-time <ts>", "Auto stop time (epoch ms)", "")
    .option("--invite-admin <flag>", "Invite admin (PRS >=3.8)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (subject, startTime, members, orgId, opts) => {
      const client = getClient();
      const result = await client.createVideoconferenceMeeting({
        subject, start_time: parseInt(startTime, 10), members: parseJsonOption(members), org_id: orgId,
        auto_record: parseInt(opts.autoRecord, 10), type: parseInt(opts.type, 10),
        group_new: parseInt(opts.groupNew, 10),
        conf_password: opts.confPassword || undefined, control_password: opts.controlPassword || undefined,
        mask_type: parseInt(opts.maskType, 10), ext_attr: opts.extAttr || undefined,
        join_mute: opts.joinMute ? parseInt(opts.joinMute, 10) : undefined,
        open_mute: opts.openMute ? parseInt(opts.openMute, 10) : undefined,
        enable_pre_join: opts.enablePreJoin ? parseInt(opts.enablePreJoin, 10) : undefined,
        user_stop_time: opts.userStopTime ? parseInt(opts.userStopTime, 10) : undefined,
        invite_admin: opts.inviteAdmin ? parseInt(opts.inviteAdmin, 10) : undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["mid", "subject", "meeting_number", "start_time", "type", "status"], "Create Meeting Result");
    });

  cmd
    .command("modify")
    .description("Modify a meeting that has not started")
    .argument("<mid>", "Meeting ID")
    .argument("<subject>", "New subject")
    .argument("<startTime>", "Start time (epoch ms)")
    .argument("<members>", "Members as JSON (exactly one role='admin')")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--auto-record <flag>", "Auto record", "0")
    .option("-t, --type <type>", "0=instant, 1=reserved", "1")
    .option("--group-new <flag>", "0/1", "0")
    .option("--conf-password <pwd>", "Meeting password", "")
    .option("--control-password <pwd>", "Host control password", "")
    .option("--user-token <token>", "User token", "")
    .action(async (mid, subject, startTime, members, orgId, operator, opts) => {
      const client = getClient();
      const result = await client.modifyVideoconferenceMeeting({
        mid, subject, start_time: parseInt(startTime, 10), members: parseJsonOption(members),
        org_id: orgId, operator, auto_record: parseInt(opts.autoRecord, 10),
        type: parseInt(opts.type, 10), group_new: parseInt(opts.groupNew, 10),
        conf_password: opts.confPassword || undefined, control_password: opts.controlPassword || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["done", "message"], "Modify Meeting Result");
    });

  cmd
    .command("cancel")
    .description("Cancel a meeting that has not started (use stop once started)")
    .argument("<mid>", "Meeting ID")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (mid, orgId, operator, opts) => {
      confirmHighRisk("cancel", `meeting ${mid}`, (opts as any).yes, (opts as any).dryRun);
      if ((opts as any).dryRun) return;
      const client = getClient();
      const result = await client.cancelVideoconferenceMeeting({ mid, org_id: orgId, operator, user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["done", "message"], "Cancel Meeting Result");
    })
    .option("-y, --yes", "Confirm meeting cancellation before executing", false)
    .option("--dry-run", "Validate inputs without cancelling", false);

  cmd
    .command("stop")
    .description("End a running meeting")
    .argument("<mid>", "Meeting ID")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (mid, orgId, operator, opts) => {
      confirmHighRisk("stop", `meeting ${mid}`, (opts as any).yes, (opts as any).dryRun);
      if ((opts as any).dryRun) return;
      const client = getClient();
      const result = await client.stopVideoconferenceMeeting({ mid, org_id: orgId, operator, user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["done", "message"], "Stop Meeting Result");
    })
    .option("-y, --yes", "Confirm meeting stop before executing", false)
    .option("--dry-run", "Validate inputs without stopping", false);

  cmd
    .command("detail")
    .description("Fetch meeting detail by mid")
    .argument("<mid>", "Meeting ID")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (mid, orgId, operator, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceDetail({ mid, org_id: orgId, operator, user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["mid", "subject", "meeting_number", "start_time", "stop_time", "type", "status", "admin"], "Meeting Detail");
    });

  cmd
    .command("list")
    .description("List meetings by time range")
    .argument("<orgId>", "Organization ID")
    .argument("<startTime>", "Start time (epoch ms)")
    .argument("<endTime>", "End time (epoch ms)")
    .option("--fetch-range <range>", "my / all / person", "all")
    .option("--staff-id <staffId>", "Staff ID (required when fetch-range=person)", "")
    .option("--limit <n>", "Page size", "10")
    .option("--offset <n>", "Page offset", "0")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, startTime, endTime, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceMeetingList({
        org_id: orgId, start_time: parseInt(startTime, 10), end_time: parseInt(endTime, 10),
        fetch_range: opts.fetchRange, staff_id: opts.staffId || undefined,
        limit: parseInt(opts.limit, 10), offset: parseInt(opts.offset, 10),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["offset", "total", "items"], "Meeting List");
    });

  cmd
    .command("record-list")
    .description("List meeting operation records by time range")
    .argument("<orgId>", "Organization ID")
    .argument("<startTime>", "Start time (epoch ms)")
    .argument("<endTime>", "End time (epoch ms)")
    .option("--admin <staffId>", "Filter by admin staff ID", "")
    .option("--create-source <src>", "0=platform client, 1=third-party", "0")
    .option("--limit <n>", "Page size", "10")
    .option("--offset <n>", "Page offset", "0")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, startTime, endTime, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceRecordList({
        org_id: orgId, start_time: parseInt(startTime, 10), end_time: parseInt(endTime, 10),
        admin: opts.admin || undefined, create_source: parseInt(opts.createSource, 10),
        limit: parseInt(opts.limit, 10), offset: parseInt(opts.offset, 10),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["offset", "total", "items"], "Meeting Record List");
    });

  cmd
    .command("simplerecord")
    .description("List member join/leave records of a meeting")
    .argument("<mid>", "Meeting ID")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--limit <n>", "Page size", "10")
    .option("--offset <n>", "Page offset", "0")
    .option("--user-token <token>", "User token", "")
    .action(async (mid, orgId, operator, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceSimplerecord({
        mid, org_id: orgId, operator, limit: parseInt(opts.limit, 10), offset: parseInt(opts.offset, 10),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["offset", "total", "items"], "Member Simplerecord");
    });

  cmd
    .command("fixroom-list")
    .description("List fixed (cloud) meeting rooms")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--limit <n>", "Page size", "10")
    .option("--offset <n>", "Page offset", "0")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, operator, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceFixroomList({
        org_id: orgId, operator, limit: parseInt(opts.limit, 10), offset: parseInt(opts.offset, 10),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["offset", "total", "items"], "Fixroom List");
    });

  cmd
    .command("status")
    .description("Batch meeting status by mids")
    .argument("<mids>", "Meeting IDs (comma-separated)")
    .argument("<orgId>", "Organization ID")
    .option("--user-token <token>", "User token", "")
    .action(async (mids, orgId, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceStatus({ mids: commaList(mids), org_id: orgId, user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["statuses"], "Meeting Status");
    });

  cmd
    .command("subscribe")
    .description("Subscribe meeting status-change events")
    .argument("<mid>", "Meeting ID")
    .argument("<orgId>", "Organization ID")
    .argument("<events>", "Events as JSON: '[{\"eventType\":1,\"callbackUrl\":\"https://cb\"}]'")
    .option("--callback-info <info>", "Callback info", "")
    .option("--user-token <token>", "User token", "")
    .action(async (mid, orgId, events, opts) => {
      const client = getClient();
      const result = await client.subscribeVideoconferenceEvents({
        mid, org_id: orgId, events: parseJsonOption(events), call_back_info: opts.callbackInfo || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["done", "message"], "Subscribe Events Result");
    });

  cmd
    .command("params")
    .description("Fetch meeting params by meetingNumber (PRS >=3.8)")
    .argument("<meetingNumber>", "Meeting number")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (meetingNumber, orgId, operator, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceParams({ meeting_number: meetingNumber, org_id: orgId, operator, user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["data"], "Meeting Params");
    });

  cmd
    .command("history")
    .description("Fetch a person's past meetings")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--limit <n>", "Page size", "10")
    .option("--offset <n>", "Page offset", "0")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, operator, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceHistory({
        org_id: orgId, operator, limit: parseInt(opts.limit, 10), offset: parseInt(opts.offset, 10),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["offset", "total", "items"], "History Meetings");
    });

  cmd
    .command("active")
    .description("Fetch a person's running and reserved meetings")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--limit <n>", "Page size", "10")
    .option("--offset <n>", "Page offset", "0")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, operator, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceActive({
        org_id: orgId, operator, limit: parseInt(opts.limit, 10), offset: parseInt(opts.offset, 10),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["offset", "total", "items"], "Active Meetings");
    });

  cmd
    .command("member-control")
    .description("Host controls a member of a meeting")
    .argument("<mid>", "Meeting ID")
    .argument("<staffId>", "Target member staff ID")
    .argument("<opCode>", `Operation code: kick/quit/join/handup/muteall/setHost/...`)
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (mid, staffId, opCode, orgId, operator, opts) => {
      const client = getClient();
      const result = await client.controlVideoconferenceMember({
        mid, staff_id: staffId, op_code: opCode, operator, org_id: orgId,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["done", "message"], "Member Control Result");
    });

  cmd
    .command("invite")
    .description("Invite members to a running meeting")
    .argument("<meetingNumber>", "Meeting number")
    .argument("<members>", "Members as JSON: '[{\"staffId\":\"s2\",\"employeeName\":\"M\",\"type\":0,\"video\":true,\"audio\":true}]'")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (meetingNumber, members, orgId, operator, opts) => {
      const client = getClient();
      const result = await client.inviteVideoconferenceMembers({
        meeting_number: meetingNumber, members: parseJsonOption(members), org_id: orgId, operator,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["done", "message"], "Invite Members Result");
    });

  cmd
    .command("member-list")
    .description("List members of a meeting (paged)")
    .argument("<mid>", "Meeting ID")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--limit <n>", "Page size", "10")
    .option("--offset <n>", "Page offset", "0")
    .option("--user-token <token>", "User token", "")
    .action(async (mid, orgId, operator, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceMemberList({
        mid, org_id: orgId, operator, limit: parseInt(opts.limit, 10), offset: parseInt(opts.offset, 10),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["offset", "total", "items"], "Meeting Member List");
    });

  cmd
    .command("vod-list")
    .description("List recordings of a meeting")
    .argument("<mid>", "Meeting ID")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (mid, orgId, operator, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceVodList({ mid, org_id: orgId, operator, user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["items"], "Vod List");
    });

  cmd
    .command("vod-download")
    .description("Fetch recording download URLs (max 3 vods per call)")
    .argument("<vods>", "Vods as JSON: '[{\"vodId\":\"v1\"}]' (1..3 entries)")
    .argument("<orgId>", "Organization ID")
    .argument("<operator>", "Operator staff ID")
    .option("--user-token <token>", "User token", "")
    .action(async (vods, orgId, operator, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceVodDownloadUrls({
        vods: parseJsonOption(vods), org_id: orgId, operator, user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["data"], "Vod Download Urls");
    });

  cmd
    .command("org-conf")
    .description("Fetch org videoconference config (PRS >=3.8)")
    .argument("<orgId>", "Organization ID")
    .option("--meeting-number <number>", "Meeting number", "")
    .option("--operator <staffId>", "Operator staff ID", "")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, opts) => {
      const client = getClient();
      const result = await client.fetchVideoconferenceConf({
        org_id: orgId, meeting_number: opts.meetingNumber || undefined,
        operator: opts.operator || undefined, user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["max_person", "default_max_person", "allowed_record_flag", "force_passwd_flag", "space_size"], "Org Videoconf Config");
    });
}
