"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDepartmentCommands = registerDepartmentCommands;
const utils_1 = require("../utils");
function registerDepartmentCommands(program) {
    const cmd = program.command("department").description("Query department/organization structure");
    cmd
        .command("detail")
        .description("Fetch department detail")
        .requiredOption("--dept-id <deptId>", "Department ID")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.fetchDepartmentDetail(opts.deptId, { user_token: opts.userToken || undefined });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("children")
        .description("Fetch child departments")
        .requiredOption("--dept-id <deptId>", "Department ID")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.fetchDepartmentChildren(opts.deptId, { user_token: opts.userToken || undefined });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("staffs")
        .description("Fetch staff members of a department")
        .requiredOption("--dept-id <deptId>", "Department ID")
        .option("--page <page>", "Page number", "1")
        .option("--size <size>", "Page size", "50")
        .option("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.fetchDepartmentStaffs(opts.deptId, {
            page: parseInt(opts.page),
            page_size: parseInt(opts.size),
            user_token: opts.userToken || undefined,
        });
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
}
