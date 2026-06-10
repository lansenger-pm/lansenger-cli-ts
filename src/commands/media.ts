import { Command } from "commander";
import { getClient, outputResult, checkError } from "../utils";

export function registerMediaCommands(program: Command) {
  const cmd = program.command("media").description("Upload and download media files");

  cmd
    .command("upload")
    .description("Upload a media file")
    .argument("<filePath>", "Local file path to upload")
    .option("-t, --media-type <type>", "1=video, 2=image, 3=audio (4.5.1 core service)", "2")
    .option("--user-token <token>", "User token (optional for 4.5.1)", "")
    .action(async (filePath, opts) => {
      const client = getClient();
      const result = await client.uploadMediaFile(filePath, {
        media_type: parseInt(opts.mediaType),
        user_token: opts.userToken || undefined,
      });
      checkError(result);
      outputResult(result, ["message_id", "created_time"], "Upload Media Result (4.5.1)");
    });

  cmd
    .command("upload-app")
    .description("Upload media for app/bot usage (4.5.4 API)")
    .argument("<filePath>", "Local file path to upload")
    .option("-t, --media-type <type>", "file, video, image, audio (4.5.4 app/bot)", "file")
    .option("--width <width>", "Width for video/image")
    .option("--height <height>", "Height for video/image")
    .option("--duration <duration>", "Duration in seconds for video/audio")
    .action(async (filePath, opts) => {
      const client = getClient();
      const result = await client.uploadAppMediaFile(filePath, {
        media_type: opts.mediaType,
        width: opts.width ? parseInt(opts.width) : undefined,
        height: opts.height ? parseInt(opts.height) : undefined,
        duration: opts.duration ? parseInt(opts.duration) : undefined,
      });
      checkError(result);
      outputResult(result, ["message_id"], "Upload App Media Result (4.5.4)");
    });

  cmd
    .command("download")
    .description("Download a media file (success status only; use download-to-file to save)")
    .argument("<mediaId>", "Media ID to download")
    .action(async (mediaId) => {
      const client = getClient();
      const result = await client.downloadMediaFile(mediaId);
      checkError(result);
      outputResult({ success: result.success, size: result.data ? result.data.length : 0, error: result.error || "" });
    });

  cmd
    .command("download-to-file")
    .description("Download a media file to a local file")
    .argument("<mediaId>", "Media ID to download")
    .option("-o, --output <path>", "Target file path", "")
    .option("--media-type <type>", "file, image, or video", "file")
    .action(async (mediaId, opts) => {
      const client = getClient();
      const savedPath = await client.downloadMediaToFile(mediaId, {
        target_path: opts.output || undefined,
        media_type: opts.mediaType,
      });
      outputResult({ success: true, path: savedPath });
    });

  cmd
    .command("path")
    .description("Fetch media path info")
    .argument("<mediaId>", "Media ID to get path for")
    .option("--user-token <token>", "User token", "")
    .action(async (mediaId, opts) => {
      const client = getClient();
      const result = await client.fetchMediaPathInfo(mediaId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result, ["media_path", "name", "type", "size"], "Media Path Result");
    });
}
