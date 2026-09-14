# dsh Plugin Authoring Conventions

> Repository counterpart of the system-prompt section injected by
> dsh-plugin-guard. Once the plugin is mounted, these conventions enter every
> agent's system prompt automatically via `ctx.sysprompt.section` — nothing to
> copy. This file is kept in sync with `CONVENTIONS_TEXT` in `src/index.ts`.

## 1. Styling rules

1. **Your own component styles**: write your own prefixed plain class names (e.g. `.pg_*`). Never use CSS Modules.
2. **Styling DSH product internals**: stable selectors only — `[data-*]` attributes > `id` > `role`/`aria` > theme CSS variables (`--dsw-*`).
3. **Never hard-code hashed class names** (e.g. `._8lIALq_userRow`): they derive from the build machine path and break on any local rebuild; the official skill likewise forbids hard-coded product DOM selectors.

## 2. Requirements

1. `package.json`: `name` matches `/^[a-z][a-z0-9-]{0,63}$/`; `exports` includes `"."` and `"./client"` (when the plugin has a client half).
2. `dsh.client` manifest: `platform` is `"web"`; `inject` lists only the `@deepseek-ai` packages actually used.
3. Client half: register settings pages via `ctx.slots.inject('settings.section', ...)`; bilingual copy via `ctx.locale.register`; styles via a `<style data-plugin="plugin-id">` tag with plain class names.
4. `lib/client.js` must be `window.__ModuleLoader__.load({id: <cordis row id>, factory: require => {...}})` with the `id` matching the cordis row id.
5. Build with esbuild; before any local rebuild set `DSH_CSS_HASH_ROOT=/home/runner/work/deepseek-harness/deepseek-harness` to keep class names identical to the official bundles.

## 3. Red lines

1. Never `session.append` an event type outside the build's known set: it poisons the log and replay on other builds; mark it `ignorable: true` or use a standard event.
2. Never persist business data in localStorage/IndexedDB: origin-bound, lost on port/host changes; use `ctx.settings.register` / `settingsScope` or the storage domain service.
3. Never restyle `document.body` / `window` globally or mount a `position:fixed` overlay on body: it fights the app shell.

## 4. Mounting and updates

1. Put the package under `~/.dsh/profiles/web/node_modules/` (a junction to your source directory).
2. Append to `~/.dsh/profiles/web/cordis.patch.yml` — it **must** be wrapped in `insert:`:

   ```yaml
   - insert:
       - id: <plugin-name>
         name: '<plugin-name>'
   ```

   A top-level `- id: <plugin-name>` / `name:` row is read as an override of an existing
   entry; since that id exists in no bundle layer, DSH only prints
   `patch: entry "..." not found` and drops it — the plugin never loads.

3. After editing `lib/client.js`: restart the backend and refresh the page (the rev query changes).

## 5. Self-check with dsh-plugin-guard

- "Plugin Health → Author Lint": static lint of a plugin directory you are authoring.
- "Plugin Health → Scaffold": one-click generation of a convention-compliant skeleton.
- "Plugin Health → Conventions": one-click copy of these conventions for your AI.
