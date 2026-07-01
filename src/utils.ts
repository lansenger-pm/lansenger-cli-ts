import { Command } from "commander";
import { LansengerClient, CredentialStore, LansengerConfig } from "lansenger-sdk-ts";
import Table from "cli-table3";

export let jsonOutput = false;
export let activeProfile = "default";
export let activeStaffId = "";
export let activeAppToken = "";
export let activeUserToken = "";

export function setJsonOutput(val: boolean) { jsonOutput = val; }
export function setActiveProfile(val: string) { activeProfile = val; }
export function setActiveStaffId(val: string) { activeStaffId = val; }
export function setAppToken(val: string) { activeAppToken = val; }
export function setUserToken(val: string) { activeUserToken = val; }

export function getStore(): CredentialStore {
  return new CredentialStore(undefined, activeProfile);
}

function wrapWithAutoUserToken(client: LansengerClient, store: CredentialStore, staffId: string): LansengerClient {
  const resolveUserToken = async (): Promise<string> => {
    const cached = store.loadUserToken(staffId);
    const userToken = cached.user_token || "";
    const refreshToken = cached.refresh_token || "";
    const expiry = cached.user_token_expiry || 0;

    if (userToken && expiry > Math.floor(Date.now() / 1000)) {
      return userToken;
    }

    if (!refreshToken) {
      throw new Error(
        `No userToken available for staff_id=${staffId} and no refreshToken for auto-refresh. ` +
        "Run OAuth2 authorize flow: build_authorize_url → exchange_code."
      );
    }

    const result = await client.refreshUserToken(refreshToken);
    if (!result.success || !result.user_token) {
      throw new Error(`Failed to refresh user token for staff_id=${staffId}: ${result.error || "Unknown error"}`);
    }

    store.saveUserToken(
      result.user_token,
      result.refresh_token || "",
      result.expires_in,
      300,
      result.refresh_expires_in || 0,
      staffId
    );

    return result.user_token;
  };

  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (typeof value !== "function") {
        return value;
      }

      return function (this: any, ...args: any[]) {
        const lastIdx = args.length - 1;
        if (
          lastIdx >= 0 &&
          typeof args[lastIdx] === "object" &&
          args[lastIdx] !== null &&
          "user_token" in args[lastIdx]
        ) {
          const opts = args[lastIdx] as Record<string, any>;
          if (!opts.user_token) {
            return (async () => {
              const token = await resolveUserToken();
              args[lastIdx] = { ...opts, user_token: token };
              return value.apply(this, args);
            })();
          }
        }
        return value.apply(this, args);
      };
    },
  }) as LansengerClient;
}

export function getClient(): LansengerClient {
  // External mode: when --app-token is provided, skip credential file entirely.
  // The caller manages token lifecycle; no auto-refresh.
  if (activeAppToken) {
    const config = LansengerConfig.create(
      "", "",  // app_id, app_secret — not needed in external mode
      undefined, undefined, undefined, undefined, undefined, undefined,
      activeAppToken,
      activeUserToken,
    );
    return LansengerClient.fromConfig(config);
  }

  const store = getStore();
  let client: LansengerClient;
  if (store.hasFullConfig()) {
    client = LansengerClient.fromStore(activeProfile);
  } else {
    client = LansengerClient.fromEnv();
  }
  // Inject app_token if provided via CLI flag or env var
  if (activeAppToken) {
    // Access private _config to set app_token — the cleanest way without
    // duplicating the full client construction logic.
    (client as any)._config = LansengerConfig.create(
      (client as any)._config.app_id,
      (client as any)._config.app_secret,
      (client as any)._config.api_gateway_url,
      (client as any)._config.passport_url,
      (client as any)._config.http_timeout,
      (client as any)._config.encoding_key,
      (client as any)._config.callback_token,
      (client as any)._config.redirect_uri,
      activeAppToken,
    );
  }
  if (activeStaffId) {
    return wrapWithAutoUserToken(client, store, activeStaffId);
  }
  return client;
}

export function outputResult(data: any, fields?: string[], title?: string) {
  if (jsonOutput) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if (typeof data !== "object" || data === null) {
    console.log(data);
    return;
  }
  if (data.toDict) {
    const d = data.toDict();
    const entries = fields
      ? fields.filter(f => d[f] !== undefined && d[f] !== null).map(f => [f, d[f]] as [string, any])
      : Object.entries(d).filter(([_, v]) => v !== null && v !== undefined);
    const table = new Table({
      head: ["Key", "Value"],
      chars: { top: "", bottom: "", left: "", right: "", middle: "", "top-mid": "", "bottom-mid": "", "left-mid": "", "right-mid": "" },
      style: { head: ["cyan"] },
    });
    for (const [k, v] of entries) {
      table.push([k, typeof v === "object" ? JSON.stringify(v) : String(v)]);
    }
    if (title) console.log(title);
    console.log(table.toString());
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

export function outputList(items: any[], head: string[], rowFn: (item: any) => string[]) {
  if (jsonOutput) {
    const data = items.map(i => (i.toDict ? i.toDict() : i));
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  const table = new Table({
    head,
    chars: { top: "", bottom: "", left: "", right: "", middle: "", "top-mid": "", "bottom-mid": "", "left-mid": "", "right-mid": "" },
    style: { head: ["cyan"] },
  });
  for (const item of items) {
    table.push(rowFn(item));
  }
  console.log(table.toString());
}

export function checkError(result: any) {
  if (result && result.success === false) {
    const msg = result.error || "Unknown error";
    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error("Error: " + msg);
    }
    process.exit(1);
  }
}

export function parseJsonOption(val: string): any {
  try { return JSON.parse(val); }
  catch { console.error("Invalid JSON: " + val); process.exit(1); }
}

export function commaList(val: string): string[] {
  return val.split(",").map(s => s.trim()).filter(s => s.length > 0);
}