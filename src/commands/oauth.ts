import { Command } from "commander";
import { getClient, outputResult, checkError, getStore } from "../utils";

export function registerOauthCommands(program: Command) {
  const cmd = program.command("oauth").description("OAuth2 user authorization operations");

  cmd
    .command("authorize-url")
    .description("Build an OAuth2 authorize URL")
    .requiredOption("--redirect-uri <uri>", "Redirect URI")
    .option("--scope <scope>", "OAuth2 scope")
    .option("--state <state>", "State parameter for CSRF protection")
    .action(async (opts) => {
      const client = getClient();
      const url = client.buildAuthorizeUrl(opts.redirectUri, {
        scope: opts.scope || undefined,
        state: opts.state || undefined,
      });
      outputResult({ authorize_url: url });
    });

  cmd
    .command("exchange-code")
    .description("Exchange an authorization code for a user token")
    .requiredOption("--code <code>", "Authorization code")
    .option("--redirect-uri <uri>", "Redirect URI (must match authorize call)")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.exchangeCode(opts.code, {
        redirect_uri: opts.redirectUri || undefined,
      });
      checkError(result);
      if (result.success && result.user_token) {
        const store = getStore();
        store.saveUserToken(result.user_token, result.refresh_token || "", result.expires_in || 0);
      }
      outputResult(result);
    });

  cmd
    .command("refresh-token")
    .description("Refresh a user token")
    .requiredOption("--refresh-token <token>", "Refresh token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.refreshUserToken(opts.refreshToken);
      checkError(result);
      if (result.success && result.user_token) {
        const store = getStore();
        store.saveUserToken(result.user_token, result.refresh_token || "", result.expires_in || 0);
      }
      outputResult(result);
    });

  cmd
    .command("user-info")
    .description("Fetch user info using a user token")
    .requiredOption("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchUserInfoByToken(opts.userToken);
      checkError(result);
      outputResult(result);
    });
}