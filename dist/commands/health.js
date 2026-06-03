"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHealthCommands = registerHealthCommands;
const utils_1 = require("../utils");
function registerHealthCommands(program) {
    const cmd = program.command("health").description("Health check for API connectivity");
    cmd
        .command("check")
        .description("Check API connectivity by attempting to get a token")
        .action(async () => {
        const client = (0, utils_1.getClient)();
        try {
            const ok = await client.healthCheck();
            (0, utils_1.outputResult)({ success: ok, status: ok ? "OK" : "FAIL" });
        }
        catch (err) {
            (0, utils_1.outputResult)({ success: false, status: "FAIL", error: err.message || String(err) });
        }
    });
}
