import { Command } from "commander";

const mockFetchBoardroomList = jest.fn();
const mockFetchBoardroomSchedule = jest.fn();
const mockReserveBoardroom = jest.fn();
const mockCancelBoardroomReserve = jest.fn();
const mockFetchMyBoardroomReserves = jest.fn();
const mockFetchBoardroomAreaOffices = jest.fn();
const mockFetchBoardroomGradings = jest.fn();

jest.mock("../src/utils", () => ({
  __esModule: true,
  getClient: jest.fn(() => ({
    fetchBoardroomList: mockFetchBoardroomList,
    fetchBoardroomSchedule: mockFetchBoardroomSchedule,
    reserveBoardroom: mockReserveBoardroom,
    cancelBoardroomReserve: mockCancelBoardroomReserve,
    fetchMyBoardroomReserves: mockFetchMyBoardroomReserves,
    fetchBoardroomAreaOffices: mockFetchBoardroomAreaOffices,
    fetchBoardroomGradings: mockFetchBoardroomGradings,
  })),
  outputResult: jest.fn(),
  checkError: jest.fn(),
  commaList: (v: string) => v.split(",").map((s: string) => s.trim()).filter(Boolean),
  parseJsonOption: (v: string) => JSON.parse(v),
  confirmHighRisk: jest.requireActual("../src/utils").confirmHighRisk,
}));

import { registerBoardroomCommands } from "../src/commands/boardroom";

function build(): Command {
  const program = new Command();
  registerBoardroomCommands(program);
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
  const oldLog = console.log;
  console.error = jest.fn();
  console.log = jest.fn();
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
    console.log = oldLog;
  }
  return exitCode;
}

describe("boardroom commands", () => {
  beforeEach(() => jest.clearAllMocks());

  test("registers all 11 commands", () => {
    const boardroom = build().commands.find(c => c.name() === "boardroom")!;
    expect(boardroom.commands).toHaveLength(11);
    expect(boardroom.commands.map(c => c.name())).toEqual([
      "rooms", "room-detail", "schedule", "reserve-detail", "reserve",
      "edit-reserve", "cancel", "confirm-sign", "my-reserves", "gradings", "area-offices",
    ]);
  });

  test("rooms parses filters and pagination", async () => {
    mockFetchBoardroomList.mockResolvedValue({ success: true });
    await run(build(), [
      "boardroom", "rooms",
      "--grading-id", "g1",
      "--floor-ids", "f1,f2",
      "--equipment", "tv,projector",
      "--date", "2026-07-22",
      "--page", "2",
      "--size", "20",
    ]);
    expect(mockFetchBoardroomList).toHaveBeenCalledWith(expect.objectContaining({
      grading_id: "g1",
      floor_ids: ["f1", "f2"],
      equipment: ["tv", "projector"],
      query_date: "2026-07-22",
      page: 2,
      limit: 20,
    }));
  });

  test("gradings passes user and organization identity", async () => {
    mockFetchBoardroomGradings.mockResolvedValue({ success: true });
    await run(build(), [
      "boardroom", "gradings", "--user-id", "staff-1", "--org-id", "org-1",
    ]);
    expect(mockFetchBoardroomGradings).toHaveBeenCalledWith({
      lx_user_id: "staff-1",
      org_id: "org-1",
      user_token: undefined,
    });
  });

  test("schedule passes required grading id", async () => {
    mockFetchBoardroomSchedule.mockResolvedValue({ success: true });
    await run(build(), [
      "boardroom", "schedule", "room1", "2026-07-22", "--grading-id", "g1",
    ]);
    expect(mockFetchBoardroomSchedule).toHaveBeenCalledWith("room1", "2026-07-22", "g1", {
      user_token: undefined,
    });
  });

  test("reserve parses repeat days and lists", async () => {
    mockReserveBoardroom.mockResolvedValue({ success: true });
    await run(build(), [
      "boardroom", "reserve", "room1", "周会",
      "--grading-id", "g1",
      "--start", "2026-07-22 09:00:00",
      "--end", "2026-07-22 10:00:00",
      "--notice-time", "会前15分钟",
      "--reserve-type", "1",
      "--repeat-days", "1,3",
      "--invite", "u1,u2",
      "--leader-attend", "0",
      "--other-demand", "需要投影",
      "--table-cards", "1",
    ]);
    expect(mockReserveBoardroom).toHaveBeenCalledWith("room1", "周会", expect.objectContaining({
      grading_id: "g1",
      reserve_time_start: "2026-07-22 09:00:00",
      reserve_time_end: "2026-07-22 10:00:00",
      notice_time: "会前15分钟",
      reserve_type: "1",
      repeat_days: [1, 3],
      invitation_user_list: ["u1", "u2"],
      leader_attend: "0",
      other_demand: "需要投影",
      table_cards: "1",
    }));
  });

  test("cancel requires --yes", async () => {
    const code = await runExit(build(), ["boardroom", "cancel", "res1"]);
    expect(code).toBe(10);
    expect(mockCancelBoardroomReserve).not.toHaveBeenCalled();
  });

  test("cancel supports --dry-run without API call", async () => {
    const code = await runExit(build(), ["boardroom", "cancel", "res1", "--dry-run"]);
    expect(code).toBeNull();
    expect(mockCancelBoardroomReserve).not.toHaveBeenCalled();
  });

  test("cancel with --yes calls API", async () => {
    mockCancelBoardroomReserve.mockResolvedValue({ success: true });
    await run(build(), [
      "boardroom", "cancel", "res1", "--yes", "--reason", "改期", "--notify",
    ]);
    expect(mockCancelBoardroomReserve).toHaveBeenCalledWith("res1", {
      cancel_reason: "改期",
      cancel_type: undefined,
      is_send: true,
      user_token: undefined,
    });
  });

  test("my-reserves passes grading and page values", async () => {
    mockFetchMyBoardroomReserves.mockResolvedValue({ success: true });
    await run(build(), ["boardroom", "my-reserves", "--grading-id", "g1", "--page", "3"]);
    expect(mockFetchMyBoardroomReserves).toHaveBeenCalledWith("g1", expect.objectContaining({
      page: 3,
      limit: 10,
    }));
  });

  test("area-offices passes grading id", async () => {
    mockFetchBoardroomAreaOffices.mockResolvedValue({ success: true });
    await run(build(), ["boardroom", "area-offices", "g1"]);
    expect(mockFetchBoardroomAreaOffices).toHaveBeenCalledWith("g1", { user_token: undefined });
  });
});
