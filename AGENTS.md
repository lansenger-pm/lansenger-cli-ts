# AGENTS.md — lansenger-cli-ts

TypeScript CLI for the Lansenger platform. Published to npm as `lansenger-cli`.

## How to run

- Install dev: `npm install`
- Tests: `npx jest`
- Build: `npm run build` (tsc → `dist/`)
- Publish: push a git tag `vx.y.z` — CI (`.github/workflows/release.yml`) builds and publishes to npm automatically. Do NOT run `npm publish` manually; it conflicts with the CI publish step.

## Tech stack

TypeScript, commander (CLI framework), ts-jest, node-fetch. Depends on `lansenger-sdk-ts`.

## Layout

- `src/` — CLI source (commands, utils, main.ts)
- `tests/` — jest suite
- `package.json` — version + packaging
- `dist/` — build output (gitignored, published to npm)

## Release rules — CRITICAL

### Version number

Lives in ONE place: `package.json` (`"version": "x.y.z"`). The tag name must match
(`vx.y.z`). npm does not allow re-uploading a version — bump to the next patch if
a release was published with a mistake.

### NEVER publish without a full green test run

`npx jest` MUST pass (0 failures) before pushing a release tag. The CI
Release workflow runs tests again and will block the upload on failure.
Build alone is NOT a substitute for tests.

### CI-driven publishing (do NOT publish manually)

Releases are published exclusively by the `Release` GitHub Actions workflow
on tag push (`v*`). The workflow verifies `package.json` matches the tag,
runs `npx jest`, builds, and publishes to npm via `NPM_TOKEN`.

**Do NOT run `npm publish` manually** — the package will already exist on
npm once the tag is pushed, so a manual upload will fail with
`403 cannot publish over` and leave a red CI run. To release: bump the
version in `package.json`, commit, then `git tag -a vx.y.z -m '...'` and
`git push origin vx.y.z`. If the CI publish fails for a non-duplicate reason,
fix the issue and re-run the failed workflow (do not re-push the same tag).

### Pass-through (external token) mode

The CLI's `getClient()` in `utils.ts` supports `--app-token` external mode: when
`--app-token` is provided it creates a client via `LansengerConfig.create("","",...,
appToken)`, bypassing the credential store. This is the LanMate/skill-suite usage
pattern. Keep this path working.

## Current status

v1.5.0.
