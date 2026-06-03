"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCallbackCommands = registerCallbackCommands;
const utils_1 = require("../utils");
const lansenger_sdk_ts_1 = require("lansenger-sdk-ts");
function registerCallbackCommands(program) {
    const cmd = program.command("callback").description("Parse and verify callback/webhook payloads");
    cmd
        .command("parse-payload")
        .description("Parse an encrypted callback payload")
        .requiredOption("--data <data>", "Encrypted callback data")
        .option("--encoding-key <key>", "Encoding AES key")
        .option("--verify-signature", "Verify signature before parsing", false)
        .option("--timestamp <ts>", "Timestamp for signature verification")
        .option("--nonce <nonce>", "Nonce for signature verification")
        .option("--signature <sig>", "Signature for verification")
        .option("--callback-token <token>", "Callback token for verification")
        .action(async (opts) => {
        const events = lansenger_sdk_ts_1.LansengerClient.parseCallbackPayload(opts.data, {
            encoding_key: opts.encodingKey || "",
            verify_signature: opts.verifySignature,
            timestamp: opts.timestamp || "",
            nonce: opts.nonce || "",
            signature: opts.signature || "",
            callback_token: opts.callbackToken || "",
        });
        (0, utils_1.outputResult)(events);
    });
    cmd
        .command("verify-signature")
        .description("Verify callback signature")
        .requiredOption("--timestamp <ts>", "Timestamp")
        .requiredOption("--nonce <nonce>", "Nonce")
        .requiredOption("--signature <sig>", "Signature")
        .requiredOption("--encoding-key <key>", "Encoding AES key")
        .option("--data-encrypt <data>", "Encrypted data for verification")
        .option("--callback-token <token>", "Callback token")
        .action(async (opts) => {
        const valid = lansenger_sdk_ts_1.LansengerClient.verifyCallbackSignature(opts.timestamp, opts.nonce, opts.signature, opts.encodingKey, {
            data_encrypt: opts.dataEncrypt || "",
            callback_token: opts.callbackToken || "",
        });
        (0, utils_1.outputResult)({ valid });
    });
    cmd
        .command("event-types")
        .description("List all callback event types")
        .action(async () => {
        const types = lansenger_sdk_ts_1.LansengerClient.getCallbackEventTypes();
        (0, utils_1.outputResult)(types);
    });
}
