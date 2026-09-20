# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.10.0] - 2026-09-20

### Added

- **personal-todo**: 个人待办命令组（6 个子命令）— `save` / `update` / `list` / `upload-resource` / `download-url` / `upload-url`。
- **personal-todo**: `upload-resource` 读取本地文件并自动 base64 编码。
- **deps**: `lansenger-sdk-ts@^1.9.0`（personal_todos 域所在版本）。

### Notes

- 与应用身份 `todo` 命令组完全分离；`orgId` 必须显式传入，服务端当前不提供个人待办完成/删除能力。

---

## [1.9.0] - 2026-09-18

### Added

- **boardroom**: 会议室预定 V2 命令组（11 个子命令）— `rooms` / `room-detail` / `schedule` / `reserve-detail` / `reserve` / `edit-reserve` / `cancel`（门禁）/ `confirm-sign` / `my-reserves` / `gradings` / `area-offices`。多数命令需 `--grading-id`（先 `boardroom gradings` 查询）。
- **deps**: `lansenger-sdk-ts@^1.8.0`（boardrooms 域所在版本）。

### Fixed

- **version**: 补上问卷轮漏改的 `tests/constants.test.ts` VERSION 断言（SDK 1.7.0 时未同步）。

---

## [1.7.0] - 2026-09-18

### Added

- **questionnaire**: 问卷系统命令组（22 个子命令）— `save` / `save-questions` / `delete-question`（门禁）/ `publish` / `withdraw` / `finish` / `delete`（门禁）/ `detail` / `brief` / `answer-url` / `copy` / `query-codes` / `accounts` / `created-list` / `my-created` / `participated` / `answers` / `answer-detail` / `last-answer-detail` / `answer-data` / `last-answer-record` / `upload-url`。
- **deps**: `lansenger-sdk-ts@^1.6.0`（questionnaires 域所在版本）。

---

## [1.6.0] - 2026-09-17

### Added

- **notice**: `notice send` / `notice accounts` 子命令 — 通知系统（官方账号通知），命令语法与 Python/Go 版一致。`--release-range` / `--resources` 走 `parseJsonOption`，投放列表走 `commaList`。
- **deps**: `lansenger-sdk-ts@^1.5.0`（notices 域所在版本）。

### Note

- CHANGELOG 缺 1.5.0 条目（该版本发布时未补记），自 1.6.0 起恢复随版本记录。

---

## [1.4.0] - 2026-07-29

### Added

- **media**: `upload-app-v2` command — 4.5.5 V2 app media upload with required `--user-token`.
- **media**: `download-share` command — 4.5.6 download media by share ID with optional `--output` and `--user-token`.

## [1.3.17] - 2026-07-29

### Added

- **cli**: `parseFieldOrJson()` utility — parses `--field`/`--link` values as JSON with automatic `name=value` fallback, fixing PowerShell quoting issues.

### Fixed

- **cli**: `send-app-card`, `update-dynamic-card` now accept `name=value` format for field/link parameters in addition to JSON.

## [1.3.16] - 2026-07-17

### Added

- **cli**: `wrapWithExternalUserToken()` proxy function — auto-injects global `--user-token` into method calls where `user_token` is empty.
- **cli**: External mode support in `getClient()` — when `--app-token` + `--user-token` are provided, wraps client with external token proxy.

## [1.3.15] - 2026-07-16

### Added

- **cli**: `--as` mode now auto-injects `user_id` from staff_id. Wire `--verbose` flag to SDK `setSDKDebug()`.

## [1.3.14] - 2026-07-16

### Added

- **cli**: `--verbose` flag to enable SDK debug logging.

### Changed

- **docs**: All READMEs: real URLs replaced, `passport_url` marked required across all languages.

## [1.3.12] - 2026-07-01

### Added

- **bot-command**: New command group (create/query/delete) for managing bot slash commands (4.37).
- **personal-app**: New command group (create/update/info/delete/list) for managing personal apps/bots (4.38).
- **calendar**: `update-attendees` command for batch add/delete schedule attendees (4.23.19).

## [1.3.11] - 2026-06-17

### Added

- **message**: `send-text`, `send-markdown`, `send-group-message` commands now support `--mention-bot` and `--ref-msg-id` options.

### Fixed

- **message**: `query-groups` command default page offset changed from 1 to 0 to match V2 API specification.

## [1.3.10] - 2026-06-17

### Fixed

- **config**: `list-users --show-tokens` showed 0 for both expiry times due to wrong key names (`expires_in` → `user_token_expiry`, `refresh_expires_in` → `refresh_token_expiry`).

## [1.3.9] - 2026-06-16

### Added

- **config**: `list-users` command to list all users with stored user tokens in the current profile.
- **config**: `list-users --show-tokens` flag to display complete token information (user_token, refresh_token, expires_in, refresh_expires_in) for each stored user.
- **cli**: `--as <staff_id>` global flag (short for "act as") that auto-loads and auto-refreshes user tokens from the CredentialStore. Works transparently via proxy — no command files were modified.

## [1.3.8] - 2026-06-16

### Fixed

- **calendar**: `list-schedules` now correctly accesses `scheduleId` (camelCase) from dict items instead of `schedule_id`.
- **department**: `children` — fix `Parent ID` column (`ancestorDepartments[0].id` not `parentId`), `Has Children` uses `hasChildren`.
- **department**: `staffs` — fix `Staff ID` column (`id` not `staffId`), replace nonexistent `Gender` with `Org Name` (`orgName`).

## [1.3.7] - 2026-06-15

### Added

- **config**: `delete-profile` command to permanently remove a credential profile and all its data. If the deleted profile is the active one, automatically switches to `"default"`.

## [1.3.6] - 2026-06-12

### Changed

- **help docs**: Improved search command descriptions for clarity.
- **staff search**: `--user-token` and `--user-id` options now clearly state "one of the two is required".

---

## [1.3.5] - 2026-06-10

### Changed

- **send-text / send-file**: `--media-type` option now accepts string values (`file`/`video`/`image`/`audio`) instead of integers (1/2/3), matching SDK v1.3.3 upload changes.

## [1.3.4] - 2026-06-10

### Added
- `redirect_uri` config key support — `config set redirect_uri` / `config show` / passed to `saveCredentials`
- `staff_id` persistence — `refresh-token` and `local-callback` pass `staff_id` to `saveUserToken`

### Fixed
- Fix `staff_id ?? undefined` to resolve `string | null` → `string | undefined` TS strict error

## [1.3.3] — Skipped (had TS strict null error)

## [1.3.2] — Skipped (wrong SDK types)

## [1.3.1] — Skipped (published with old SDK types)

## [1.3.0] - 2026-06-10

### Fixed

- `oauth local-callback` command: server starts before printing authorize URL, matching Python CLI behavior

## [1.2.9] - 2026-06-10

### Fixed

- `media upload` command help text: `3=audio` not `3=file`

## [1.2.8] - 2026-06-09

### Added

- Added `fields`/`title` to all `outputResult` calls
- Restored short options (short opts)
- Added `outputList` for list commands

## [1.2.6] - 2026-06-08

### Fixed

- Sync CLI with Python CLI: fixed `--version` flag
- Fixed `oauth exchange-code` command
- Fixed `group update` boolean params
- Fixed `media download` command
- Added `fields`, `masks`, additional short options

## [1.2.5] - 2026-06-07

### Changed

- Bump version

## [1.2.4] - 2026-06-06

### Changed

- Update SDK dependency to 1.2.4

## [1.2.3] - 2026-06-05

### Changed

- Upgrade `lansenger-sdk-ts` dependency to 1.2.3

## [1.2.2] - 2026-06-04

### Changed

- Upgrade SDK to 1.2.2
- Align CLI with Python CLI

## [1.2.1] - 2026-06-03

### Added

- `oauth local-callback` added `--redirect-uri` option

## [1.2.0] - 2026-06-02

### Fixed

- Preserve `refreshToken` on refresh
- Pass `refreshExpiresIn` to `saveUserToken`

### Added

- `oauth local-callback` + `UserTokenManager` integration

## [1.0.1] - 2026-06-01

### Added

- Initial release
- Core commands: message sending, group management, department management, staff search, calendar, todos
- Media upload/download support
- OAuth2 authorization flow

[1.2.9]: https://github.com/your-org/lansenger-cli-ts/compare/v1.2.8...v1.2.9
[1.2.8]: https://github.com/your-org/lansenger-cli-ts/compare/v1.2.6...v1.2.8
[1.2.6]: https://github.com/your-org/lansenger-cli-ts/compare/v1.2.5...v1.2.6
[1.2.5]: https://github.com/your-org/lansenger-cli-ts/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/your-org/lansenger-cli-ts/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/your-org/lansenger-cli-ts/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/your-org/lansenger-cli-ts/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/your-org/lansenger-cli-ts/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/your-org/lansenger-cli-ts/compare/v1.0.1...v1.2.0
[1.0.1]: https://github.com/your-org/lansenger-cli-ts/releases/tag/v1.0.1
