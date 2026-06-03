import { Command } from "commander";
import { LansengerClient, CredentialStore, LansengerConfig } from "lansenger-sdk-ts";
import Table from "cli-table3";

export let jsonOutput = false;
export let activeProfile = "default";

export function setJsonOutput(val: boolean) { jsonOutput = val; }
export function setActiveProfile(val: string) { activeProfile = val; }

export function getStore(): CredentialStore {
  return new CredentialStore(undefined, activeProfile);
}

export function getClient(): LansengerClient {
  const store = getStore();
  if (store.hasCredentials()) {
    return LansengerClient.fromStore(activeProfile);
  }
  return LansengerClient.fromEnv();
}

export function outputResult(data: any) {
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
    const entries = Object.entries(d).filter(([_, v]) => v !== null && v !== undefined);
    const table = new Table({
      head: ["Key", "Value"],
      chars: { top: "", bottom: "", left: "", right: "", middle: "", "top-mid": "", "bottom-mid": "", "left-mid": "", "right-mid": "" },
      style: { head: ["cyan"] },
    });
    for (const [k, v] of entries) {
      table.push([k, typeof v === "object" ? JSON.stringify(v) : String(v)]);
    }
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