# dsh-plugin-guard

插件创作公约 / Plugin Authoring Conventions — a minimal **host-only** plugin for
[DeepSeek Harness](https://github.com/deepseek-ai/DeepSeek-Harness) (dsh).

**It does one thing:** when mounted, it registers one global system-prompt
section (`ctx.sysprompt.section`) that injects the dsh plugin-authoring
conventions into **every agent's** system prompt. Any AI running on DSH —
normal sessions, 创造模式 (Craft mode), subagents — automatically follows the
conventions when authoring or modifying plugins. No settings page, no copying,
no checks.

## What the injected conventions cover

1. Styling rules (plain prefixed class names; stable selectors; never hashed
   class names).
2. Package/manifest requirements (`dsh.client` manifest, exports, loader
   wrapper identity, esbuild build, `DSH_CSS_HASH_ROOT`).
3. Red lines (no custom session event types; no localStorage persistence; no
   global body/window restyles).
4. Mounting and update workflow (profile junction + patch row + restart).

The authoritative text lives in `src/index.ts` (it is exactly what enters the
model prompt). `CONVENTIONS.md` / `CONVENTIONS.en.md` / `SKILL.md` are the
readable repository forms; keep them in sync when editing the source text.

## Layout

```
src/index.ts          host half: sysprompt.section registration (the whole plugin)
scripts/build.mjs     esbuild host build
CONVENTIONS.md        conventions, Chinese
CONVENTIONS.en.md     conventions, English
SKILL.md              conventions as a skill file for AI agents
lib/                  built output (gitignored)
```

## Install

1. Link the folder into the profile:

   ```powershell
   New-Item -ItemType Junction -Path "$env:USERPROFILE\.dsh\profiles\web\node_modules\dsh-plugin-guard" -Target (Get-Location).Path
   ```

2. In `~/.dsh/profiles/web/cordis.patch.yml`, add the row:

   ```yaml
   - id: dsh-plugin-guard
     name: 'dsh-plugin-guard'
   ```

3. Restart the backend. From then on, every agent's system prompt carries the
   conventions (host-only: no client half, nothing to refresh).

## Build

```sh
node scripts/build.mjs
```

Produces `lib/index.js` (host, esm, external `@deepseek-ai/*` + `node:*`).

## Notes

- Section order 400 keeps the convention after the persona and core sections.
- The section is registered for the plugin's fiber lifetime; unloading the
  plugin removes it automatically.
- License: MIT.