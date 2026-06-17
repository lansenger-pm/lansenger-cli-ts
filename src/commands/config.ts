import { Command } from "commander";
import { CredentialStore } from "lansenger-sdk-ts";
import { outputResult, activeProfile } from "../utils";

const VALID_KEYS = ["app_id", "app_secret", "api_gateway_url", "passport_url", "encoding_key", "callback_token", "redirect_uri"];

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
      const store = new CredentialStore(undefined, p);
      const creds = store.loadCredentials();
      creds[key] = value;
      store.saveCredentials(
        creds.app_id || "",
        creds.app_secret || "",
        creds.api_gateway_url || "",
        creds.passport_url || "",
        creds.encoding_key || "",
        creds.callback_token || "",
        creds.redirect_uri || "",
      );
      outputResult({ success: true, message: `Set ${key} = ${value}`, profile: p });
    });

  cmd
    .command("show")
    .description("Show current configuration")
    .option("-P, --profile <profile>", "Profile name (overrides global --profile)")
    .action((opts) => {
      const p = opts.profile || activeProfile;
      const store = new CredentialStore(undefined, p);
      const creds = store.loadCredentials();
      const masked = {
        app_id: creds.app_id ? "***" : "(empty)",
        app_secret: creds.app_secret ? "***" : "(empty)",
        api_gateway_url: creds.api_gateway_url,
        passport_url: creds.passport_url,
        encoding_key: creds.encoding_key ? "***" : "(empty)",
        callback_token: creds.callback_token ? "***" : "(empty)",
        redirect_uri: creds.redirect_uri,
        profile: p,
        has_credentials: store.hasFullConfig(),
        store_path: store.path,
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
        const store = new CredentialStore();
        store.clear();
        outputResult({ success: true, message: "Cleared entire state file (all profiles)." });
        return;
      }
      const p = opts.profile || activeProfile;
      const store = new CredentialStore(undefined, p);
      store.clearProfile();
      outputResult({ success: true, message: `Cleared profile '${p}'.` });
    });

  cmd
    .command("list-profiles")
    .description("List all stored credential profiles")
    .action(() => {
      const store = new CredentialStore();
      const profiles = store.listProfiles();
      const active = store.getActiveProfile();
      outputResult({ profiles, active_profile: active });
    });

  cmd
    .command("delete-profile")
    .description("Delete a credential profile by name")
    .argument("<profile>", "Profile name to delete")
    .action((profile) => {
      const store = new CredentialStore();
      if (!store.deleteProfileByName(profile)) {
        console.error(`Error: Profile '${profile}' does not exist.`);
        process.exit(1);
      }
      const active = store.getActiveProfile();
      outputResult({ profile, status: "deleted", active_profile: active });
    });

  cmd
    .command("list-users")
    .description("List all users with stored user tokens in the current profile")
    .option("-P, --profile <profile>", "Profile name (overrides global --profile)")
    .option("-T, --show-tokens", "Show user tokens (security warning)", false)
    .action((opts) => {
      const p = opts.profile || activeProfile;
      const store = new CredentialStore(undefined, p);
      const users = store.listUserTokens();
      if (opts.showTokens) {
        const tokens: Record<string, Record<string, string | number>> = {};
        for (const staffId of users) {
          const tokenData = store.loadUserToken(staffId);
          tokens[staffId] = {
            user_token: tokenData.user_token || "",
            refresh_token: tokenData.refresh_token || "",
            expires_in: tokenData.user_token_expiry || 0,
            refresh_expires_in: tokenData.refresh_token_expiry || 0,
          };
        }
        outputResult({ profile: p, users, tokens });
      } else {
        outputResult({ profile: p, users });
      }
    });
}