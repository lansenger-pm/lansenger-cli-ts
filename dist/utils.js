"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeProfile = exports.jsonOutput = void 0;
exports.setJsonOutput = setJsonOutput;
exports.setActiveProfile = setActiveProfile;
exports.getStore = getStore;
exports.getClient = getClient;
exports.outputResult = outputResult;
exports.outputList = outputList;
exports.checkError = checkError;
exports.parseJsonOption = parseJsonOption;
exports.commaList = commaList;
const lansenger_sdk_ts_1 = require("lansenger-sdk-ts");
const cli_table3_1 = __importDefault(require("cli-table3"));
exports.jsonOutput = false;
exports.activeProfile = "default";
function setJsonOutput(val) { exports.jsonOutput = val; }
function setActiveProfile(val) { exports.activeProfile = val; }
function getStore() {
    return new lansenger_sdk_ts_1.CredentialStore(undefined, exports.activeProfile);
}
function getClient() {
    const store = getStore();
    if (store.hasCredentials()) {
        return lansenger_sdk_ts_1.LansengerClient.fromStore(exports.activeProfile);
    }
    return lansenger_sdk_ts_1.LansengerClient.fromEnv();
}
function outputResult(data) {
    if (exports.jsonOutput) {
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
        const table = new cli_table3_1.default({
            head: ["Key", "Value"],
            chars: { top: "", bottom: "", left: "", right: "", middle: "", "top-mid": "", "bottom-mid": "", "left-mid": "", "right-mid": "" },
            style: { head: ["cyan"] },
        });
        for (const [k, v] of entries) {
            table.push([k, typeof v === "object" ? JSON.stringify(v) : String(v)]);
        }
        console.log(table.toString());
    }
    else {
        console.log(JSON.stringify(data, null, 2));
    }
}
function outputList(items, head, rowFn) {
    if (exports.jsonOutput) {
        const data = items.map(i => (i.toDict ? i.toDict() : i));
        console.log(JSON.stringify(data, null, 2));
        return;
    }
    const table = new cli_table3_1.default({
        head,
        chars: { top: "", bottom: "", left: "", right: "", middle: "", "top-mid": "", "bottom-mid": "", "left-mid": "", "right-mid": "" },
        style: { head: ["cyan"] },
    });
    for (const item of items) {
        table.push(rowFn(item));
    }
    console.log(table.toString());
}
function checkError(result) {
    if (result && result.success === false) {
        const msg = result.error || "Unknown error";
        if (exports.jsonOutput) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.error("Error: " + msg);
        }
        process.exit(1);
    }
}
function parseJsonOption(val) {
    try {
        return JSON.parse(val);
    }
    catch {
        console.error("Invalid JSON: " + val);
        process.exit(1);
    }
}
function commaList(val) {
    return val.split(",").map(s => s.trim()).filter(s => s.length > 0);
}
