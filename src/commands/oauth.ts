import { Command } from "commander";
import { LansengerClient } from "lansenger-sdk-ts";
import { getClient, outputResult, checkError, getStore } from "../utils";

export function registerOauthCommands(program: Command) {
  const cmd = program.command("oauth").description("OAuth2 user authorization operations");

  cmd
    .command("authorize-url")
    .description("Build an OAuth2 authorize URL")
    .argument("<redirectUri>", "Redirect URI after auth")
    .option("-s, --scope <scope>", "OAuth2 scope", "basic_userinfor")
    .option("--state <state>", "State parameter for CSRF protection", "")
    .action(async (redirectUri, opts) => {
      const client = getClient();
      const url = client.buildAuthorizeUrl(redirectUri, {
        scope: opts.scope || undefined,
        state: opts.state || undefined,
      });
      outputResult({ authorize_url: url });
    });

  cmd
    .command("exchange-code")
    .description("Exchange an authorization code for a user token")
    .argument("<code>", "Authorization code from callback")
    .option("--redirect-uri <uri>", "Redirect URI used in authorize", "")
    .action(async (code, opts) => {
      const client = getClient();
      const result = await client.exchangeCode(code, {
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
    .argument("<refreshToken>", "Refresh token")
    .option("-s, --scope <scope>", "Scope", "")
    .action(async (refreshToken, opts) => {
      const client = getClient();
      const result = await client.refreshUserToken(refreshToken, {
        scope: opts.scope || undefined,
      });
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
    .argument("<userToken>", "User token")
    .action(async (userToken) => {
      const client = getClient();
      const result = await client.fetchUserInfoByToken(userToken);
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("parse-callback")
    .description("Parse the query string from an OAuth2 callback URL")
    .argument("<queryString>", "Query string from callback URL")
    .action(async (queryString) => {
      const params = LansengerClient.parseAuthorizeCallback(queryString);
      outputResult(params);
    });

  cmd
    .command("validate-state")
    .description("Validate the state parameter from an OAuth2 callback")
    .argument("<callbackState>", "State from callback")
    .argument("<expectedState>", "Expected state you set")
    .action(async (callbackState, expectedState) => {
      const valid = LansengerClient.validateCallbackState(callbackState, expectedState);
      outputResult({ valid });
    });
}