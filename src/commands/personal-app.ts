import { Command } from "commander";
import { getClient, outputResult, outputList, checkError } from "../utils";

export function registerPersonalAppCommands(program: Command) {
  const cmd = program.command("personal-app").description("Manage personal apps/bots (4.38)");

  cmd
    .command("create")
    .description("Create a personal app/bot")
    .option("--user-token <token>", "User token (required)", "")
    .option("--name <name>", "App name", "")
    .option("--avatar-id <id>", "Avatar media ID", "")
    .option("--desc <desc>", "App description", "")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.createPersonalApp({
        user_token: opts.userToken,
        name: opts.name || undefined,
        avatar_id: opts.avatarId || undefined,
        description: opts.desc || undefined,
      });
      checkError(result);
      outputResult(result, ["app_id", "secret", "apigw_addr", "passport_addr"], "Create Personal App Result");
    });

  cmd
    .command("update")
    .description("Update a personal app/bot")
    .argument("<appId>", "App ID")
    .argument("<name>", "New app name")
    .option("--user-token <token>", "User token (required)", "")
    .option("--avatar-id <id>", "Avatar media ID", "")
    .option("--desc <desc>", "App description", "")
    .action(async (appId, name, opts) => {
      const client = getClient();
      const result = await client.updatePersonalApp(appId, {
        user_token: opts.userToken,
        name: name,
        avatar_id: opts.avatarId || undefined,
        description: opts.desc || undefined,
      });
      checkError(result);
      outputResult(result, ["app_id"], "Update Personal App Result");
    });

  cmd
    .command("info")
    .description("Fetch personal app info")
    .argument("<appId>", "App ID")
    .option("--user-token <token>", "User token", "")
    .action(async (appId, opts) => {
      const client = getClient();
      const result = await client.fetchPersonalApp(appId, {
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["app_id", "name", "avatar_id", "description", "apigw_addr", "passport_addr"], "Personal App Info");
    });

  cmd
    .command("delete")
    .description("Delete a personal app/bot")
    .argument("<appId>", "App ID")
    .option("--user-token <token>", "User token", "")
    .action(async (appId, opts) => {
      const client = getClient();
      const result = await client.deletePersonalApp(appId, {
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, undefined, "Delete Personal App Result");
    });

  cmd
    .command("list")
    .description("List personal apps/bots")
    .option("--user-token <token>", "User token (required)", "")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchPersonalAppList({
        user_token: opts.userToken,
      });
      checkError(result);
      if (result.success && result.app_list) {
        outputList(result.app_list, ["App ID", "Name", "Description"], (a: any) => [
          a.appId || "", a.appName || "", a.description || "",
        ]);
      } else {
        outputResult(result, undefined, "Personal App List");
      }
    });
}
