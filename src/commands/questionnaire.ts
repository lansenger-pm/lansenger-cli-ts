import { Command } from "commander";
import { getClient, outputResult, checkError, commaList, parseJsonOption, confirmHighRisk } from "../utils";

export function registerQuestionnaireCommands(program: Command) {
  const cmd = program.command("questionnaire").description("Manage questionnaires (问卷系统)");

  cmd
    .command("save")
    .description("Create a questionnaire (or update when --code is given)")
    .argument("<title>", "Questionnaire title (max 100 chars)")
    .argument("<accountCode>", "Official account CODE (see `questionnaire accounts`)")
    .option("--code <code>", "Existing questionnaire code (update when given)", "")
    .option("--welcome <text>", "Welcome speech", "")
    .option("--bye <text>", "Bye speech", "")
    .option("--cover <resourceId>", "Cover resource ID", "")
    .option("--resource-ids <ids>", "Comma-joined resource id string", "")
    .option("--create-mobile <mobile>", "Operator mobile (omit when --as/--user-token is set)", "")
    .option("--create-user-id <staffId>", "Creator staff ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (title, accountCode, opts) => {
      const client = getClient();
      const result = await client.saveQuestionnaire({
        title, account_code: accountCode,
        code: opts.code || undefined,
        welcome_speech: opts.welcome || undefined,
        bye_speech: opts.bye || undefined,
        cover_resource_id: opts.cover || undefined,
        resource_ids: opts.resourceIds || undefined,
        create_mobile: opts.createMobile || undefined,
        create_user_id: opts.createUserId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["questionnaire_code"], "Save Questionnaire Result");
    });

  cmd
    .command("save-questions")
    .description("Batch-save questions (new or update; 16 question types)")
    .argument("<questionnaireCode>", "Questionnaire code")
    .requiredOption("--questions <json>", 'JSON list of questions: \'[{"questionName":"Q1","questionType":"radio","requiredFlag":1}]\'')
    .option("--create-user-id <staffId>", "Creator staff ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.saveQuestionnaireQuestions(questionnaireCode, parseJsonOption(opts.questions), {
        create_user_id: opts.createUserId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["saved_count"], "Save Questions Result");
    });

  cmd
    .command("delete-question")
    .description("Delete a question by code")
    .argument("<questionCode>", "Question code")
    .option("--create-user-id <staffId>", "Creator staff ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .option("-y, --yes", "Confirm question deletion before executing", false)
    .option("--dry-run", "Validate inputs without deleting", false)
    .action(async (questionCode, opts) => {
      confirmHighRisk("delete", `question ${questionCode}`, opts.yes, opts.dryRun);
      if (opts.dryRun) return;
      const client = getClient();
      const result = await client.deleteQuestionnaireQuestion(questionCode, {
        create_user_id: opts.createUserId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["deleted"], "Delete Question Result");
    });

  cmd
    .command("publish")
    .description("Publish a questionnaire")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--scope <type>", "Publish scope: 1=internal, 2=public", "1")
    .option("--staff-ids <ids>", "Comma-separated target staff openIds (internal scope)", "")
    .option("--phones <phones>", "Comma-separated target mobiles (internal scope)", "")
    .option("--answer-limit <limit>", "Answer limit: 1=once, -1=unlimited", "1")
    .option("--message-flag <flag>", "Official-account message: 1=on, 0=off", "0")
    .option("--page-flag <flag>", "One question per page: 1=on, 0=off", "0")
    .option("--share-flag <flag>", "Allow sharing: 1=on, 0=off", "0")
    .option("--view-stats-flag <flag>", "Allow viewing stats: 1=on, 0=off", "1")
    .option("--anonym-flag <flag>", "Allow anonymous answers: 1=on, 0=off", "0")
    .option("--publish-user-id <staffId>", "Operator staff ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.publishQuestionnaire(questionnaireCode, {
        scope_type: Number(opts.scope),
        staff_ids: opts.staffIds ? commaList(opts.staffIds) : undefined,
        phones: opts.phones ? commaList(opts.phones) : undefined,
        answer_limit: Number(opts.answerLimit),
        message_flag: Number(opts.messageFlag),
        page_flag: Number(opts.pageFlag),
        share_flag: Number(opts.shareFlag),
        view_stats_flag: Number(opts.viewStatsFlag),
        anonym_flag: Number(opts.anonymFlag),
        publish_user_id: opts.publishUserId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["done"], "Publish Questionnaire Result");
    });

  cmd
    .command("withdraw")
    .description("Withdraw a published questionnaire back to draft")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--operate-user-id <staffId>", "Operator staff ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.withdrawQuestionnaire(questionnaireCode, {
        operate_user_id: opts.operateUserId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["done"], "Withdraw Result");
    });

  cmd
    .command("finish")
    .description("End an ongoing questionnaire (no more answers)")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--operate-user-id <staffId>", "Operator staff ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.finishQuestionnaire(questionnaireCode, {
        operate_user_id: opts.operateUserId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["done"], "Finish Result");
    });

  cmd
    .command("delete")
    .description("Delete a questionnaire")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--operate-user-id <staffId>", "Operator staff ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .option("-y, --yes", "Confirm questionnaire deletion before executing", false)
    .option("--dry-run", "Validate inputs without deleting", false)
    .action(async (questionnaireCode, opts) => {
      confirmHighRisk("delete", `questionnaire ${questionnaireCode}`, opts.yes, opts.dryRun);
      if (opts.dryRun) return;
      const client = getClient();
      const result = await client.deleteQuestionnaire(questionnaireCode, {
        operate_user_id: opts.operateUserId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["done"], "Delete Questionnaire Result");
    });

  cmd
    .command("detail")
    .description("Fetch full questionnaire detail incl. questions (needs admin permission)")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--operate-user-id <staffId>", "Operator staff ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.fetchQuestionnaireDetail(questionnaireCode, {
        operate_user_id: opts.operateUserId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["code", "title", "status", "question_count", "answer_user_count", "account_code", "questions"], "Questionnaire Detail");
    });

  cmd
    .command("brief")
    .description("Fetch questionnaire detail without admin check (no questions)")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--user-token <token>", "User token", "")
    .action(async (questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.fetchQuestionnaireBrief(questionnaireCode, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["code", "title", "status", "question_count", "answer_user_count", "account_code"], "Questionnaire Brief");
    });

  cmd
    .command("answer-url")
    .description("Fetch the answer-page URL")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--operate-user-id <staffId>", "Operator staff ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.fetchQuestionnaireAnswerUrl(questionnaireCode, {
        operate_user_id: opts.operateUserId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["url"], "Answer URL");
    });

  cmd
    .command("copy")
    .description("Copy a questionnaire into a new draft")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--operate-user-id <staffId>", "Operator staff ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.copyQuestionnaire(questionnaireCode, {
        operate_user_id: opts.operateUserId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["new_code"], "Copy Questionnaire Result");
    });

  cmd
    .command("query-codes")
    .description("Batch-fetch questionnaire basic info by codes")
    .requiredOption("--codes <codes>", "Comma-separated questionnaire codes")
    .option("--include-deleted <flag>", "0=exclude deleted, 1=include", "0")
    .option("--user-token <token>", "User token", "")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchQuestionnairesByCodes(commaList(opts.codes), {
        include_deleted: Number(opts.includeDeleted),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["total", "items"], "Questionnaire Query Result");
    });

  cmd
    .command("accounts")
    .description("Fetch office accounts the user can manage (accountCode source)")
    .option("--user-id <userId>", "User ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchQuestionnaireOfficeAccounts({
        user_id: opts.userId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["total", "accounts"], "Questionnaire Office Accounts");
    });

  cmd
    .command("created-list")
    .description("Page questionnaires created under an office account")
    .argument("<accountCode>", "Official account CODE")
    .option("--page <no>", "Page number", "1")
    .option("--size <n>", "Page size", "10")
    .option("--status <status>", "1=draft, 2=ongoing, 3=withdrawn, 4=finished", "")
    .option("--user-id <userId>", "User ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (accountCode, opts) => {
      const client = getClient();
      const result = await client.fetchCreatedQuestionnaires(accountCode, {
        page_no: Number(opts.page),
        page_size: Number(opts.size),
        status: opts.status === "" ? undefined : Number(opts.status),
        user_id: opts.userId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["total", "page_no", "page_size", "has_more", "items"], "Created Questionnaires");
    });

  cmd
    .command("my-created")
    .description("Page all questionnaires I created (personal + official)")
    .argument("<orgId>", "Organization ID")
    .option("--page <no>", "Page number", "1")
    .option("--size <n>", "Page size", "10")
    .option("--title <title>", "Filter by title", "")
    .option("--status <status>", "1=draft, 2=ongoing, 3=withdrawn, 4=finished", "")
    .option("--user-id <userId>", "User ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, opts) => {
      const client = getClient();
      const result = await client.fetchMyCreatedQuestionnaires(orgId, {
        page_no: Number(opts.page),
        page_size: Number(opts.size),
        title: opts.title || undefined,
        status: opts.status === "" ? undefined : Number(opts.status),
        user_id: opts.userId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["total", "page_no", "page_size", "has_more", "items"], "My Created Questionnaires");
    });

  cmd
    .command("participated")
    .description("Page questionnaires the user answered")
    .argument("<orgId>", "Organization ID")
    .option("--page <no>", "Page number", "1")
    .option("--size <n>", "Page size", "10")
    .option("--status <status>", "2=ongoing, 4=finished", "")
    .option("--user-id <userId>", "User ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (orgId, opts) => {
      const client = getClient();
      const result = await client.fetchParticipatedQuestionnaires(orgId, {
        page_no: Number(opts.page),
        page_size: Number(opts.size),
        status: opts.status === "" ? undefined : Number(opts.status),
        user_id: opts.userId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["total", "page_no", "page_size", "has_more", "items"], "Participated Questionnaires");
    });

  cmd
    .command("answers")
    .description("Page answer records of a questionnaire")
    .argument("<accountCode>", "Official account CODE")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--page <no>", "Page number", "1")
    .option("--size <n>", "Page size", "10")
    .option("--user-id <userId>", "User ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (accountCode, questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.fetchAnswerRecords(accountCode, questionnaireCode, {
        page_no: Number(opts.page),
        page_size: Number(opts.size),
        user_id: opts.userId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["total", "page_no", "page_size", "has_more", "items"], "Answer Records");
    });

  cmd
    .command("answer-detail")
    .description("Fetch one answer record's full detail (questionnaire + questions + answers)")
    .argument("<accountCode>", "Official account CODE")
    .argument("<answerCode>", "Answer record code")
    .option("--user-id <userId>", "User ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (accountCode, answerCode, opts) => {
      const client = getClient();
      const result = await client.fetchQuestionnaireAnswerDetail(accountCode, answerCode, {
        user_id: opts.userId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["answer_code", "answer_user_name", "answer_status", "answer_commit_time", "questionnaire", "answers"], "Answer Detail");
    });

  cmd
    .command("last-answer-detail")
    .description("Fetch the user's last answer detail for a questionnaire")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--answer-record-code <code>", "Specific answer record code", "")
    .option("--user-id <userId>", "User ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.fetchQuestionnaireLastAnswerDetail(questionnaireCode, {
        answer_record_code: opts.answerRecordCode || undefined,
        user_id: opts.userId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["answer_code", "answer_user_name", "answer_status", "answer_commit_time", "answers"], "Last Answer Detail");
    });

  cmd
    .command("answer-data")
    .description("Page answer data for export (JSON structure)")
    .argument("<accountCode>", "Official account CODE")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--page <no>", "Page number", "1")
    .option("--size <n>", "Page size", "10")
    .option("--user-id <userId>", "User ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (accountCode, questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.fetchAnswerData(accountCode, questionnaireCode, {
        page_no: Number(opts.page),
        page_size: Number(opts.size),
        user_id: opts.userId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["total", "page_no", "page_size", "has_more", "items"], "Answer Data");
    });

  cmd
    .command("last-answer-record")
    .description("Fetch the user's last answer record (main table only)")
    .argument("<questionnaireCode>", "Questionnaire code")
    .option("--answer-record-code <code>", "Specific answer record code", "")
    .option("--user-id <userId>", "User ID (omit when --as/--user-token is set)", "")
    .option("--user-token <token>", "User token", "")
    .action(async (questionnaireCode, opts) => {
      const client = getClient();
      const result = await client.fetchQuestionnaireLastAnswerRecord(questionnaireCode, {
        answer_record_code: opts.answerRecordCode || undefined,
        user_id: opts.userId || undefined,
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["record_code", "answer_user_name", "answer_status", "answer_commit_time", "stats_status"], "Last Answer Record");
    });

  cmd
    .command("upload-url")
    .description("Fetch a presigned upload URL (then PUT the file with a Content-MD5 header)")
    .argument("<fileName>", "File name with extension")
    .argument("<md5>", "File MD5 hex digest")
    .argument("<size>", "File size in bytes")
    .option("--user-token <token>", "User token", "")
    .action(async (fileName, md5, size, opts) => {
      const client = getClient();
      const result = await client.fetchQuestionnaireUploadUrl(fileName, md5, Number(size), {
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["url"], "Upload URL");
    });
}
