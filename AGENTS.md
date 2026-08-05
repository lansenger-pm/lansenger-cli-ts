# AGENTS.md — lansenger-cli-ts

TypeScript CLI for the Lansenger platform. Published to npm as `lansenger-cli`.

## How to run

- Install dev: `npm install`
- Tests: `npx jest`
- Build: `npm run build` (tsc → `dist/`)
- Publish: `npm publish --access public`

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

`npx jest` MUST pass (0 failures) before `npm publish` / pushing a release tag.
Build alone is NOT a substitute for tests.

### Pass-through (external token) mode

The CLI's `getClient()` in `utils.ts` supports `--app-token` external mode: when
`--app-token` is provided it creates a client via `LansengerConfig.create("","",...,
appToken)`, bypassing the credential store. This is the LanMate/skill-suite usage
pattern. Keep this path working.

## Current status

v1.4.0. No CI incidents.
