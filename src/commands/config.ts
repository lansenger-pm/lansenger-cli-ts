import { Command } from "commander";
import { getStore, outputResult, activeProfile } from "../utils";

const VALID_KEYS = ["app_id", "app_secret", "api_gateway_url", "passport_url", "encoding_key", "callback_token"];

export function registerConfigCommands(program: Command) {
  const cmd = program.command("config").description("Manage CLI configuration and credentials");

  cmd
    .command("set")
    .description("Set credentials (app_id, app_secret, api_gateway_url, passport_url, encoding_key, callback_token)")
    .argument("<key>", `Config key: ${VALID_KEYS.join(", ")}`)
    .argument("<value>", "Config value")
    .option("-P, --profile <profile>", "Profile name (overrides global --profile)")
    .action((key, value, opts) => {
      if (!VALID_KEYS.includes(key)) {
        console.error(`Error: Invalid key '${key}'. Valid keys: ${VALID_KEYS.join(", ")}`);
        process.exit(1);
      }
      const p = opts.profile || activeProfile;
      const store = getStore();
      const creds = store.loadCredentials();
      creds[key] = value;
      store.saveCredentials(
        creds.app_id || "",
        creds.app_secret || "",
        creds.api_gateway_url || "",
        creds.passport_url || "",
        creds.encoding_key || "",
        creds.callback_token || "",
      );
      outputResult({ success: true, message: `Set ${key} = ${value}`, profile: p });
    });

  cmd
    .command("show")
    .description("Show current configuration")
    .option("-P, --profile <profile>", "Profile name (overrides global --profile)")
    .action((opts) => {
      const p = opts.profile || activeProfile;
      const store = getStore();
      const creds = store.loadCredentials();
      const masked = {
        app_id: creds.app_id,
        app_secret: creds.app_secret ? creds.app_secret.substring(0, 8) + "..." : "",
        api_gateway_url: creds.api_gateway_url,
        passport_url: creds.passport_url,
        encoding_key: creds.encoding_key ? "(set)" : "(not set)",
        callback_token: creds.callback_token ? "(set)" : "(not set)",
        profile: p,
        has_full_config: store.hasFullConfig(),
      };
      outputResult(masked);
    });

  cmd
    .command("clear")
    .description("Clear stored credentials for current profile")
    .option("-P, --profile <profile>", "Profile name (overrides global --profile)")
    .option("--all", "Delete entire state file (all profiles)", false)
    .action((opts) => {
      if (opts.all) {
        const store = getStore();
        store.clear();
        outputResult({ success: true, message: "Cleared entire state file (all profiles)." });
        return;
      }
      const p = opts.profile || activeProfile;
      const store = getStore();
      store.clearProfile();
      outputResult({ success: true, message: `Cleared profile '${p}'.` });
    });

  cmd
    .command("list-profiles")
    .description("List all stored credential profiles")
    .action(() => {
      const store = getStore();
      const profiles = store.listProfiles();
      const active = store.getActiveProfile();
      outputResult({ profiles, active_profile: active });
    });
}