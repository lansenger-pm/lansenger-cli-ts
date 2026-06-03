"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerConfigCommands = registerConfigCommands;
const utils_1 = require("../utils");
function registerConfigCommands(program) {
    const cmd = program.command("config").description("Manage CLI configuration and credentials");
    cmd
        .command("set")
        .description("Set credentials (app_id, app_secret, api_gateway_url, passport_url, encoding_key, callback_token)")
        .requiredOption("--app-id <appId>", "App ID")
        .requiredOption("--app-secret <appSecret>", "App Secret")
        .option("--api-gateway-url <url>", "API Gateway URL")
        .option("--passport-url <url>", "Passport URL")
        .option("--encoding-key <key>", "Encoding AES key")
        .option("--callback-token <token>", "Callback verification token")
        .action(async (opts) => {
        const store = (0, utils_1.getStore)();
        store.saveCredentials(opts.appId, opts.appSecret, opts.apiGatewayUrl || "", opts.passportUrl || "", opts.encodingKey || "", opts.callbackToken || "");
        (0, utils_1.outputResult)({ success: true, message: "Credentials saved", profile: store.currentProfile });
    });
    cmd
        .command("show")
        .description("Show current configuration")
        .action(async () => {
        const store = (0, utils_1.getStore)();
        const creds = store.loadCredentials();
        const masked = {
            app_id: creds.app_id,
            app_secret: creds.app_secret ? creds.app_secret.substring(0, 8) + "..." : "",
            api_gateway_url: creds.api_gateway_url,
            passport_url: creds.passport_url,
            encoding_key: creds.encoding_key ? "(set)" : "(not set)",
            callback_token: creds.callback_token ? "(set)" : "(not set)",
            profile: store.currentProfile,
            has_full_config: store.hasFullConfig(),
        };
        (0, utils_1.outputResult)(masked);
    });
    cmd
        .command("clear")
        .description("Clear stored credentials for current profile")
        .action(async () => {
        const store = (0, utils_1.getStore)();
        store.clearProfile();
        (0, utils_1.outputResult)({ success: true, message: "Credentials cleared for profile: " + store.currentProfile });
    });
    cmd
        .command("list-profiles")
        .description("List all stored credential profiles")
        .action(async () => {
        const store = (0, utils_1.getStore)();
        const profiles = store.listProfiles();
        const active = store.getActiveProfile();
        (0, utils_1.outputResult)({ profiles, active_profile: active });
    });
}
