import { Command } from "commander";
import * as http from "http";
import { LansengerClient } from "lansenger-sdk-ts";
import { getClient, outputResult, checkError, getStore, jsonOutput } from "../utils";

interface CallbackResult {
  code?: string;
  state?: string;
  error?: string;
}

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
      outputResult(result, ["user_token", "expires_in", "refresh_token", "refresh_expires_in", "staff_id", "scope"], "Exchange Code Result");
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
        const existing = store.loadUserToken();
        const rt = result.refresh_token || existing.refresh_token || "";
        store.saveUserToken(result.user_token, rt, result.expires_in || 0, undefined, result.refresh_expires_in || 0, result.staff_id ?? undefined);
      }
      outputResult(result, ["user_token", "expires_in", "refresh_token", "staff_id"], "Refresh Token Result");
    });

  cmd
    .command("user-info")
    .description("Fetch user info using a user token")
    .argument("<userToken>", "User token")
    .action(async (userToken) => {
      const client = getClient();
      const result = await client.fetchUserInfoByToken(userToken);
      checkError(result);
      outputResult(result, ["staff_id", "name", "org_id", "org_name", "mobile_phone", "email", "employee_number"], "User Info");
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

  cmd
    .command("local-callback")
    .description("Start a local HTTP server to capture OAuth2 callback and optionally exchange the code")
    .option("-p, --port <port>", "Local HTTP server port", "8765")
    .option("-s, --scope <scope>", "OAuth2 scope", "basic_userinfor")
    .option("--state <state>", "CSRF state (auto-generated if empty)", "")
    .option("-E, --exchange", "Auto-exchange code for userToken", true)
    .option("--no-exchange", "Do not auto-exchange code")
    .option("-t, --timeout <timeout>", "Max wait seconds for callback", "120")
    .option("--redirect-uri <uri>", "Override redirect_uri (default: http://localhost:<port>)", "")
    .action(async (opts) => {
      const port = parseInt(opts.port);
      const scope = opts.scope;
      const state = opts.state || undefined;
      const autoExchange = opts.exchange !== false;
      const timeout = parseInt(opts.timeout);
      const redirectUri = opts.redirectUri || `http://localhost:${port}`;

      const client = getClient();
      const authUrl = client.buildAuthorizeUrl(redirectUri, { scope, state });

      const callbackResult: { value: CallbackResult | null } = { value: null };

      const server = http.createServer((req, res) => {
        const url = new URL(req.url || "/", `http://localhost:${port}`);
        const code = url.searchParams.get("code") || "";
        const receivedState = url.searchParams.get("state") || "";
        const error = url.searchParams.get("error") || "";

        if (error) {
          res.writeHead(400);
          res.end(`OAuth2 error: ${error}`);
          callbackResult.value = { error };
        } else if (code) {
          res.writeHead(200);
          res.end("Authorization successful. You can close this tab.");
          callbackResult.value = { code, state: receivedState };
        } else {
          res.writeHead(400);
          res.end("Missing code parameter.");
          callbackResult.value = { error: "missing_code" };
        }
      });

      // Start listening — Node.js http.createServer does not bind until listen() is called.
      // IMPORTANT: Server must be started BEFORE printing the authorize URL.
      // If server fails to start (e.g., port in use), user should NOT see the URL.
      await new Promise<void>((resolve, reject) => {
        server.on("error", (err: NodeJS.ErrnoException) => {
          if (err.code === "EADDRINUSE") {
            reject(new Error(`Port ${port} is already in use. Try a different port or wait a moment.`));
          } else {
            reject(err);
          }
        });
        server.listen(port, "localhost", () => resolve());
      });

      // Print authorize URL AFTER server is successfully started
      if (jsonOutput) {
        console.log(JSON.stringify({ authorize_url: authUrl, redirect_uri: redirectUri, port }, null, 2));
      } else {
        console.log(`Authorize URL:\n${authUrl}`);
        console.log(`\nWaiting for callback on port ${port}... (timeout: ${timeout}s)`);
        console.log("Open the URL above in a browser, authorize, then wait.");
      }

      const startTime = Date.now();
      while (callbackResult.value === null && (Date.now() - startTime) < timeout * 1000) {
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 1000);
          timer.unref();
        });
      }

      server.close();

      if (callbackResult.value === null) {
        console.error(`Timeout: no callback received within ${timeout}s`);
        process.exit(1);
      }

      const result = callbackResult.value;
      if (result.error) {
        console.error(`OAuth2 error: ${result.error}`);
        process.exit(1);
      }

      const code = result.code || "";
      const receivedState = result.state || "";

      if (!jsonOutput) {
        console.log(`Received code: ${code}`);
        console.log(`Received state: ${receivedState}`);
      }

      if (autoExchange) {
        const exchangeResult = await client.exchangeCode(code, { redirect_uri: redirectUri });
        checkError(exchangeResult);
        if (exchangeResult.success && exchangeResult.user_token) {
          const store = getStore();
          const existing = store.loadUserToken();
          const rt = exchangeResult.refresh_token || existing.refresh_token || "";
          store.saveUserToken(exchangeResult.user_token, rt, exchangeResult.expires_in || 0, undefined, exchangeResult.refresh_expires_in || 0, exchangeResult.staff_id ?? undefined);
        }
        outputResult(exchangeResult);
      } else {
        if (jsonOutput) {
          console.log(JSON.stringify({ code, state: receivedState }, null, 2));
        } else {
          console.log(`\nUse this code to exchange manually:`);
          console.log(`  lansenger oauth exchange-code ${code} --redirect-uri ${redirectUri}`);
        }
      }
    });
}