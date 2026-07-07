# AGENTS.md

## Cursor Cloud specific instructions

This is a pnpm workspace monorepo (Node 22, pnpm 10). Dependencies are installed at the
repo root with `pnpm install --frozen-lockfile` (the startup update script already does this).

Workspaces:
- `apps/web` (`@passbyte/web`) — Next.js 15 web app. This is the primary, deployed product (a Swedish "Passbyte" shift-swap salary calculator).
- `apps/mobile` (`@passbyte/mobile`) — Expo / React Native app sharing the same calculation logic.
- `packages/handels` (`@passbyte/handels`) — salary/OB calculation logic, covered by Vitest tests.
- `packages/shared` (`@passbyte/shared`) — shared formatting/i18n helpers.

Run everything from the repo root using the scripts in the root `package.json`:
- Dev (web): `pnpm dev` — starts Next.js on `http://127.0.0.1:3000` (bound to 127.0.0.1, not 0.0.0.0).
- Tests: `pnpm test` — runs the `@passbyte/handels` Vitest suite.
- Build (web): `pnpm build`. CI (`.github/workflows/ci.yml`) runs only `pnpm test` then `pnpm build` — it does not run lint.

Non-obvious caveats:
- `pnpm lint` is NOT usable non-interactively. There is no ESLint config in `apps/web`, so `next lint` opens an interactive "How would you like to configure ESLint?" prompt and hangs. Lint is not part of CI; do not rely on it.
- Mobile: run it via the workspace script `pnpm dev:mobile` (which is `pnpm --filter @passbyte/mobile start`), or for a browser-testable build use `pnpm --filter @passbyte/mobile exec expo start --web`. Do NOT run bare `npx expo ...` — it ignores the pinned local Expo (~56) and tries to fetch a newer global Expo, and resolves the wrong working directory. The first Expo web bundle takes ~30-90s to compile before the page renders.
- The `pnpm install` "Ignored build scripts: esbuild, msgpackr-extract, sharp" warning is benign; tests, web dev/build, and Expo web all work without approving those build scripts.
