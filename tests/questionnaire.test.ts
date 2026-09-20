import { Command } from "commander";

const mockSaveQuestionnaire = jest.fn();
const mockSaveQuestionnaireQuestions = jest.fn();
const mockDeleteQuestionnaireQuestion = jest.fn();
const mockDeleteQuestionnaire = jest.fn();
const mockFetchCreatedQuestionnaires = jest.fn();
const mockFetchParticipatedQuestionnaires = jest.fn();
const mockFetchQuestionnaireUploadUrl = jest.fn();

jest.mock("../src/utils", () => ({
  __esModule: true,
  getClient: jest.fn(() => ({
    saveQuestionnaire: mockSaveQuestionnaire,
    saveQuestionnaireQuestions: mockSaveQuestionnaireQuestions,
    deleteQuestionnaireQuestion: mockDeleteQuestionnaireQuestion,
    deleteQuestionnaire: mockDeleteQuestionnaire,
    fetchCreatedQuestionnaires: mockFetchCreatedQuestionnaires,
    fetchParticipatedQuestionnaires: mockFetchParticipatedQuestionnaires,
    fetchQuestionnaireUploadUrl: mockFetchQuestionnaireUploadUrl,
  })),
  outputResult: jest.fn(),
  checkError: jest.fn(),
  commaList: (v: string) => v.split(",").map((s: string) => s.trim()).filter(Boolean),
  parseJsonOption: (v: string) => JSON.parse(v),
  confirmHighRisk: jest.requireActual("../src/utils").confirmHighRisk,
}));

import { registerQuestionnaireCommands } from "../src/commands/questionnaire";

function build(): Command {
  const program = new Command();
  registerQuestionnaireCommands(program);
  return program;
}

async function run(program: Command, argv: string[]): Promise<void> {
  program.exitOverride();
  await program.parseAsync(argv, { from: "user" });
}

async function runExit(program: Command, argv: string[]): Promise<number | null> {
  let exitCode: number | null = null;
  const realExit = process.exit;
  const oldError = console.error;
  console.error = jest.fn();
  (process.exit as any) = (code: number) => {
    exitCode = code;
    throw new Error(`__EXIT_${code}__`);
  };
  try {
    await run(program, argv);
  } catch (e: any) {
    if (!String(e?.message || "").startsWith("__EXIT_")) throw e;
  } finally {
    process.exit = realExit;
    console.error = oldError;
  }
  return exitCode;
}

describe("questionnaire commands", () => {
  beforeEach(() => jest.clearAllMocks());

  test("registers all 22 command groups", () => {
    const questionnaire = build().commands.find(c => c.name() === "questionnaire")!;
    expect(questionnaire.commands).toHaveLength(22);
    expect(questionnaire.commands.map(c => c.name())).toEqual(expect.arrayContaining([
      "save", "save-questions", "delete-question", "publish", "withdraw", "finish",
      "delete", "detail", "brief", "answer-url", "copy", "query-codes", "accounts",
      "created-list", "my-created", "participated", "answers", "answer-detail",
      "last-answer-detail", "answer-data", "last-answer-record", "upload-url",
    ]));
  });

  test("save passes all documented fields", async () => {
    mockSaveQuestionnaire.mockResolvedValue({ success: true });
    await run(build(), [
      "questionnaire", "save", "满意度", "ACC001",
      "--code", "QN1",
      "--welcome", "欢迎",
      "--create-user-id", "u1",
      "--user-token", "ut1",
    ]);
    expect(mockSaveQuestionnaire).toHaveBeenCalledWith(expect.objectContaining({
      title: "满意度",
      account_code: "ACC001",
      code: "QN1",
      welcome_speech: "欢迎",
      create_user_id: "u1",
      user_token: "ut1",
    }));
  });

  test("save-questions parses JSON", async () => {
    mockSaveQuestionnaireQuestions.mockResolvedValue({ success: true });
    await run(build(), [
      "questionnaire", "save-questions", "QN1",
      "--questions", '[{"questionName":"Q1","questionType":"radio"}]',
      "--create-user-id", "u1",
    ]);
    expect(mockSaveQuestionnaireQuestions).toHaveBeenCalledWith(
      "QN1",
      [{ questionName: "Q1", questionType: "radio" }],
      { create_user_id: "u1", user_token: undefined },
    );
  });

  test("delete-question requires --yes", async () => {
    const code = await runExit(build(), ["questionnaire", "delete-question", "Q1"]);
    expect(code).toBe(10);
    expect(mockDeleteQuestionnaireQuestion).not.toHaveBeenCalled();
  });

  test("delete supports --dry-run without API call", async () => {
    const code = await runExit(build(), ["questionnaire", "delete", "QN1", "--dry-run"]);
    expect(code).toBeNull();
    expect(mockDeleteQuestionnaire).not.toHaveBeenCalled();
  });

  test("delete with --yes calls API", async () => {
    mockDeleteQuestionnaire.mockResolvedValue({ success: true });
    await run(build(), ["questionnaire", "delete", "QN1", "--yes", "--operate-user-id", "u1"]);
    expect(mockDeleteQuestionnaire).toHaveBeenCalledWith("QN1", {
      operate_user_id: "u1",
      user_token: undefined,
    });
  });

  test("created-list converts pagination and status to numbers", async () => {
    mockFetchCreatedQuestionnaires.mockResolvedValue({ success: true });
    await run(build(), ["questionnaire", "created-list", "ACC001", "--page", "2", "--size", "20", "--status", "2"]);
    expect(mockFetchCreatedQuestionnaires).toHaveBeenCalledWith("ACC001", {
      page_no: 2,
      page_size: 20,
      status: 2,
      user_token: undefined,
    });
  });

  test("participated passes explicit user id", async () => {
    mockFetchParticipatedQuestionnaires.mockResolvedValue({ success: true });
    await run(build(), [
      "questionnaire", "participated", "org1", "--user-id", "staff-001",
    ]);
    expect(mockFetchParticipatedQuestionnaires).toHaveBeenCalledWith("org1", {
      page_no: 1,
      page_size: 10,
      status: undefined,
      user_id: "staff-001",
      user_token: undefined,
    });
  });

  test("upload-url converts size to number", async () => {
    mockFetchQuestionnaireUploadUrl.mockResolvedValue({ success: true });
    await run(build(), ["questionnaire", "upload-url", "a.png", "md5", "1024"]);
    expect(mockFetchQuestionnaireUploadUrl).toHaveBeenCalledWith("a.png", "md5", 1024, {
      user_token: undefined,
    });
  });
});
