# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.2] - 2026-06-10

### Added
- `redirect_uri` config key support — `config set redirect_uri` / `config show` / passed to `saveCredentials`
- `staff_id` persistence — `refresh-token` and `local-callback` pass `staff_id` to `saveUserToken`

### Changed
- SDK dependency updated to `lansenger-sdk-ts@^1.3.1` for new `redirect_uri` + `staff_id` types

## [1.3.1] — Skipped (published with old SDK types)

## [1.3.0] - 2026-06-10

### Fixed

- 修复 `oauth local-callback` 命令：服务器成功启动后才输出授权链接，与 Python CLI 保持一致

## [1.2.9] - 2026-06-10

### Fixed

- 修复 `media upload` 命令帮助文本：`3=audio` 不是 `3=file`

## [1.2.8] - 2026-06-09

### Added

- 添加 `fields`/`title` 到所有 `outputResult` 调用
- 恢复短选项（short opts）
- 添加 `outputList` 用于列表命令

## [1.2.6] - 2026-06-08

### Fixed

- 同步 CLI 与 Python CLI：修复 `--version` 标志
- 修复 `oauth exchange-code` 命令
- 修复 `group update` 布尔参数
- 修复 `media download` 命令
- 添加 `fields`、`masks`、额外短选项

## [1.2.5] - 2026-06-07

### Changed

- 更新版本号

## [1.2.4] - 2026-06-06

### Changed

- 更新 SDK 依赖到 1.2.4

## [1.2.3] - 2026-06-05

### Changed

- 升级 `lansenger-sdk-ts` 依赖到 1.2.3

## [1.2.2] - 2026-06-04

### Changed

- 升级 SDK 到 1.2.2
- 对齐 CLI 与 Python CLI

## [1.2.1] - 2026-06-03

### Added

- `oauth local-callback` 添加 `--redirect-uri` 选项

## [1.2.0] - 2026-06-02

### Fixed

- 刷新时保留 `refreshToken`
- 将 `refreshExpiresIn` 传递给 `saveUserToken`

### Added

- `oauth local-callback` + `UserTokenManager` 集成

## [1.0.1] - 2026-06-01

### Added

- 初始版本发布
- 支持核心命令：消息发送、群组管理、部门管理、员工查询、日历管理、待办管理
- 支持媒体文件上传下载
- 支持 OAuth2 授权流程

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
