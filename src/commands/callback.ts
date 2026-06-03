import { Command } from "commander";
import { outputResult, parseJsonOption, activeProfile, getStore } from "../utils";
import { LansengerClient, parseCallbackPayload, verifyCallbackSignature, decryptCallbackPayload } from "lansenger-sdk-ts";

function resolveEncodingKey(cliValue: string, profile: string): string {
  if (cliValue) return cliValue;
  const store = getStore();
  const creds = store.loadCredentials();
  const val = creds.encoding_key || "";
  if (val) console.log(`Using encoding_key from credential store (profile: ${profile})`);
  return val;
}

function resolveCallbackToken(cliValue: string, encodingKey: string, profile: string): string {
  if (cliValue) return cliValue;
  const store = getStore();
  const creds = store.loadCredentials();
  const val = creds.callback_token || "";
  if (val) console.log(`Using callback_token from credential store (profile: ${profile})`);
  return val;
}

export function registerCallbackCommands(program: Command) {
  const cmd = program.command("callback").description("Parse and verify callback events");

  cmd
    .command("parse-payload")
    .description("Parse an encrypted callback payload")
    .argument("<encryptedData>", "Callback data (plain JSON or encrypted dataEncrypt value)")
    .option("--encoding-key <key>", "Base64-encoded AES key for decryption (reads from credential store if empty)", "")
    .option("--callback-token <token>", "Token for signature verification (reads from credential store if empty; falls back to encoding_key)", "")
    .option("--known-app-id <appId>", "Known appId to help split orgId/appId during decryption", "")
    .option("--verify-sig", "Verify signature before parsing", false)
    .option("--timestamp <ts>", "Timestamp for signature verification", "")
    .option("--nonce <nonce>", "Nonce for signature verification", "")
    .option("--signature <sig>", "Signature to verify", "")
    .option("-P, --profile <profile>", "Credential profile (overrides global --profile)", "")
    .action(async (encryptedData, opts) => {
      const p = opts.profile || activeProfile;
      const resolvedKey = resolveEncodingKey(opts.encodingKey, p);
      const resolvedToken = resolveCallbackToken(opts.callbackToken, resolvedKey, p);
      const events = LansengerClient.parseCallbackPayload(encryptedData, {
        encoding_key: resolvedKey,
        verify_signature: opts.verifySig,
        timestamp: opts.timestamp || "",
        nonce: opts.nonce || "",
        signature: opts.signature || "",
        callback_token: resolvedToken,
        known_app_id: opts.knownAppId || "",
      });
      outputResult(events);
    });

  cmd
    .command("decrypt-payload")
    .description("Decrypt only (without parsing) a callback dataEncrypt value")
    .argument("<encryptedData>", "Encrypted dataEncrypt value")
    .option("--encoding-key <key>", "Base64-encoded AES key for decryption (reads from credential store if empty)", "")
    .option("--known-app-id <appId>", "Known appId to help split orgId/appId in decrypted result", "")
    .option("-P, --profile <profile>", "Credential profile (overrides global --profile)", "")
    .action(async (encryptedData, opts) => {
      const p = opts.profile || activeProfile;
      const resolvedKey = resolveEncodingKey(opts.encodingKey, p);
      if (!resolvedKey) {
        console.error("Error: encoding_key is required for decryption. Pass --encoding-key or set it via lansenger config set encoding_key.");
        process.exit(1);
      }
      const result = decryptCallbackPayload(encryptedData, resolvedKey, opts.knownAppId || undefined);
      outputResult(result);
    });

  cmd
    .command("verify-signature")
    .description("Verify callback signature")
    .argument("<timestamp>", "Timestamp")
    .argument("<nonce>", "Nonce")
    .argument("<signature>", "Signature")
    .option("--encoding-key <key>", "Encoding key, used as token if callback-token not provided (reads from credential store if empty)", "")
    .option("--data-encrypt <data>", "The encrypted dataEncrypt value (required for correct signature verification)", "")
    .option("--callback-token <token>", "Token from developer center callback config (reads from credential store if empty; falls back to encoding_key)", "")
    .option("-P, --profile <profile>", "Credential profile (overrides global --profile)", "")
    .action(async (timestamp, nonce, signature, opts) => {
      const p = opts.profile || activeProfile;
      const resolvedKey = resolveEncodingKey(opts.encodingKey, p);
      if (!resolvedKey) {
        console.error("Error: encoding_key is required for signature verification. Pass --encoding-key or set it via lansenger config set encoding_key.");
        process.exit(1);
      }
      const resolvedToken = resolveCallbackToken(opts.callbackToken, resolvedKey, p);
      const valid = LansengerClient.verifyCallbackSignature(timestamp, nonce, signature, resolvedKey, {
        data_encrypt: opts.dataEncrypt || "",
        callback_token: resolvedToken,
      });
      outputResult({ valid });
    });

  cmd
    .command("event-types")
    .description("List all callback event types")
    .action(async () => {
      const types = LansengerClient.getCallbackEventTypes();
      outputResult(types);
    });
}