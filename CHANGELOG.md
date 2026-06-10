# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
