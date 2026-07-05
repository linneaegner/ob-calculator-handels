# Passbyte — agent instructions

Monorepo: `apps/web` (Next.js), `apps/mobile` (Expo), `packages/handels` (salary/OB logic).

## Commands

| Task | Command |
| --- | --- |
| Install | `pnpm install` |
| Dev (web) | `pnpm dev` |
| Test | `pnpm test` |
| Build | `pnpm build` |
| Handels source check | `pnpm check:handels` |

## Pull requests (all agents)

**Never auto-merge.** A human must review and merge every PR.

When opening a PR:

1. Target `main` unless the task says otherwise.
2. Open as a **draft** PR.
3. Push your branch and stop — do not merge, approve, enable GitHub auto-merge, or mark the PR ready for review unless the user explicitly asks.
4. Do not use `merge_pull_request` or equivalent GitHub/GitLab APIs to merge your own work.

This repo calculates wages from collective agreements. Incorrect merges can affect real users — always leave the final merge to a human.

### Per-area playbooks

- Handels agreement updates: `packages/handels/AGENTS.md`
- Expo mobile app: `apps/mobile/AGENTS.md`

## Cursor Cloud specific

Cloud agents run in an isolated VM. Use the commands above; no extra secrets are required for tests and builds.

If you need to override the no-merge policy for a one-off task, the user must say so explicitly in the prompt (e.g. "merge when CI passes"). Default is always human review.

## Account-wide setup (all GitHub repos)

To apply the same GitHub settings and agent policy files across every personal repository, run once:

```bash
./scripts/configure-github-no-automerge-all-repos.sh
```

Or use the **Configure account — no auto-merge** GitHub Action (requires `GH_ADMIN_TOKEN` secret). See `.github/workflows/configure-account-no-automerge.yml`.
