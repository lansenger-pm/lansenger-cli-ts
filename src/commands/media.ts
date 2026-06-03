import { Command } from "commander";
import { getClient, outputResult, checkError } from "../utils";

export function registerMediaCommands(program: Command) {
  const cmd = program.command("media").description("Upload, download, and manage media files");

  cmd
    .command("upload")
    .description("Upload a media file")
    .requiredOption("--file-path <path>", "File path to upload")
    .option("--media-type <type>", "Media type (1=video,2=image,3=file)")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.uploadMediaFile(opts.filePath, {
        media_type: opts.mediaType ? parseInt(opts.mediaType) : undefined,
      });
      checkError(result);
      outputResult(result);
    });

  cmd
    .command("download")
    .description("Download a media file (to stdout as binary)")
    .requiredOption("--media-id <mediaId>", "Media ID")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.downloadMediaFile(opts.mediaId);
      checkError(result);
      if (result.success && result.data) {
        process.stdout.write(result.data);
      } else {
        outputResult(result);
      }
    });

  cmd
    .command("download-to-file")
    .description("Download a media file to a local file")
    .requiredOption("--media-id <mediaId>", "Media ID")
    .option("--target-path <path>", "Target file path")
    .action(async (opts) => {
      const client = getClient();
      const savedPath = await client.downloadMediaToFile(opts.mediaId, {
        target_path: opts.targetPath || undefined,
      });
      outputResult({ success: true, path: savedPath });
    });

  cmd
    .command("path")
    .description("Fetch media path info")
    .requiredOption("--media-id <mediaId>", "Media ID")
    .option("--user-token <token>", "User token")
    .action(async (opts) => {
      const client = getClient();
      const result = await client.fetchMediaPathInfo(opts.mediaId, { user_token: opts.userToken || undefined });
      checkError(result);
      outputResult(result);
    });
}