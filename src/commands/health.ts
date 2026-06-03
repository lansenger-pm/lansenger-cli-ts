import { Command } from "commander";
import { getClient, outputResult } from "../utils";

export function registerHealthCommands(program: Command) {
  const cmd = program.command("health").description("Health check for API connectivity");

  cmd
    .command("check")
    .description("Check API connectivity by attempting to get a token")
    .action(async () => {
      const client = getClient();
      try {
        const ok = await client.healthCheck();
        outputResult({ success: ok, status: ok ? "OK" : "FAIL" });
      } catch (err: any) {
        outputResult({ success: false, status: "FAIL", error: err.message || String(err) });
      }
    });
}