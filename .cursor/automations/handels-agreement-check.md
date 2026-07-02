# Cursor Automation: Handels agreement check

Create this automation at [cursor.com/automations/new](https://cursor.com/automations/new).

## Settings

| Field | Value |
| --- | --- |
| Name | Handels agreement check |
| Trigger | Scheduled |
| Cron expression | `0 9 1 1,4 *` |
| Schedule | **Twice a year** — January 1 and April 1 at 09:00 UTC |
| Repository | `linneaegner/passbyte-kalkylator` |
| Branch | `main` |

January catches new holiday calendars; April catches the annual wage revision.

## Prompt (copy below)

```
Check whether Handels public pages for butik/lager/e-handel have changed.

1. Run: pnpm check:handels
2. If exit code 0, stop — no PR needed.
3. If exit code 2 (handels.se blocked), fetch the source URLs from packages/handels/sources.json via web access, compare against packages/handels/snapshots/, and continue only if agreement content changed.
4. If changed, follow packages/handels/AGENTS.md:
   - Read changed sources from sources.json and snapshots/
   - Update packages/handels/ code and tests
   - Run pnpm test
   - Run pnpm check:handels:update and commit snapshot updates with code
   - Open a draft PR describing changes with links to handels.se
```

## What the agent does

1. Runs `pnpm check:handels` to compare live Handels pages with committed snapshots.
2. Stops if nothing changed (exit code 0).
3. If handels.se blocks server fetch (exit code 2), uses web access to read the pages instead.
4. Updates `packages/handels/`, runs tests, refreshes snapshots, and opens a **draft PR** for human review.

## Related

- Playbook: `packages/handels/AGENTS.md`
- GitHub Action backup: `.github/workflows/handels-sources.yml` (same schedule)
