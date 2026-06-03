"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOauthCommands = registerOauthCommands;
const utils_1 = require("../utils");
function registerOauthCommands(program) {
    const cmd = program.command("oauth").description("OAuth2 user authorization operations");
    cmd
        .command("authorize-url")
        .description("Build an OAuth2 authorize URL")
        .requiredOption("--redirect-uri <uri>", "Redirect URI")
        .option("--scope <scope>", "OAuth2 scope")
        .option("--state <state>", "State parameter for CSRF protection")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const url = client.buildAuthorizeUrl(opts.redirectUri, {
            scope: opts.scope || undefined,
            state: opts.state || undefined,
        });
        (0, utils_1.outputResult)({ authorize_url: url });
    });
    cmd
        .command("exchange-code")
        .description("Exchange an authorization code for a user token")
        .requiredOption("--code <code>", "Authorization code")
        .option("--redirect-uri <uri>", "Redirect URI (must match authorize call)")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.exchangeCode(opts.code, {
            redirect_uri: opts.redirectUri || undefined,
        });
        (0, utils_1.checkError)(result);
        if (result.success && result.user_token) {
            const store = (0, utils_1.getStore)();
            store.saveUserToken(result.user_token, result.refresh_token || "", result.expires_in || 0);
        }
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("refresh-token")
        .description("Refresh a user token")
        .requiredOption("--refresh-token <token>", "Refresh token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.refreshUserToken(opts.refreshToken);
        (0, utils_1.checkError)(result);
        if (result.success && result.user_token) {
            const store = (0, utils_1.getStore)();
            store.saveUserToken(result.user_token, result.refresh_token || "", result.expires_in || 0);
        }
        (0, utils_1.outputResult)(result);
    });
    cmd
        .command("user-info")
        .description("Fetch user info using a user token")
        .requiredOption("--user-token <token>", "User token")
        .action(async (opts) => {
        const client = (0, utils_1.getClient)();
        const result = await client.fetchUserInfoByToken(opts.userToken);
        (0, utils_1.checkError)(result);
        (0, utils_1.outputResult)(result);
    });
}
