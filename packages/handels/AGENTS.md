# Handels agreement update agent

Use this playbook when Handels public web pages change and `packages/handels/` needs updating.

## When to run

- Twice-yearly source check failed (GitHub Action **Handels sources** or `pnpm check:handels`)
- Manual request to sync with [handels.se](https://www.handels.se)
- New agreement period (next major one: from April 2027)

## Source pages

Configured in `sources.json`. Each page maps to code paths:

| Source ID | URL | Code to review |
| --- | --- | --- |
| `avtal-butik-lager-e-handel` | [Avtal butik, lager, e-handel](https://www.handels.se/avtalsrorelse/avtal-butik-lager-e-handel/) | `config.ts`, `minimum-wage.ts` |
| `roda-dagar` | [Röda dagar](https://www.handels.se/fakta-och-rad/lon-ob/roda-dagar/) | `holidays/`, `config.ts` |
| `ob-tillagg` | [OB-tillägg](https://www.handels.se/fakta-och-rad/lon-ob/ob-tillagg/) | `ob/segments-butik.ts`, `ob/segments-lager.ts` |
| `laegstaloener-faq` | [Lägstalöner FAQ](https://www.handels.se/fakta-och-rad/faq/g652-vilka-laegstaloener-gaeller-i-min-bransch) | `minimum-wage.ts` |

Snapshots of normalized page text live in `snapshots/`. Run `pnpm check:handels` to compare live pages with committed snapshots.

## Update workflow

1. **Identify what changed** — read the live Handels page and diff against the matching snapshot in `snapshots/`.
2. **Update code** in `packages/handels/`:
   - `config.ts` — `AGREEMENT_YEAR`, `SUPPORTED_HOLIDAY_YEARS`, wage increase constants
   - `minimum-wage.ts` — tier tables and effective dates
   - `holidays/YYYY.ts` — add a new file per year; wire it in `holidays/index.ts`
   - `ob/segments-*.ts` — OB percentages and time windows
3. **Run tests** — from repo root: `pnpm test`
4. **Update snapshots** — after code matches the new Handels content: `pnpm check:handels:update`
5. **Open a draft PR** with:
   - Summary of what changed on handels.se
   - Links to the exact source pages
   - List of files updated
   - Test output

Do **not** auto-merge. A human should review before release.

## Code conventions

- Keep comments referencing Handels and effective dates (see existing files).
- Butik and lager/e-handel have different OB rules — update both when OB changes.
- Eve days (`eveDaysYYYY`): butik uses 100 % OB after 12:00; lager uses full-day OB only on julafton, nyårsafton, midsommarafton; påskafton is a normal Saturday for lager.
- When adding a holiday year, update `SUPPORTED_HOLIDAY_YEARS` in `config.ts`.

## Limitations

- Full kollektivavtal and detailed lägstalön tables are on **Mina sidor** (login). Public pages confirm headline numbers; tier tables may need manual verification.
- The checker compares normalized page text, not legal PDFs.
- Marketing banners on handels.se (e.g. BankID notices) are stripped where possible; confirm changes are agreement-related before updating code.
- **Cloudflare:** handels.se often blocks server-side fetches (GitHub Actions, CI). Exit code `2` means all fetches failed — use a Cursor agent with web access or run `pnpm check:handels` locally. After a successful local fetch, run `pnpm check:handels:update` to refresh snapshots.

Bootstrap snapshots (agreement excerpts only): `pnpm --filter @passbyte/handels seed:snapshots`

## Cursor Automation (twice a year)

Create at [cursor.com/automations/new](https://cursor.com/automations/new):

| Setting | Value |
| --- | --- |
| **Name** | Handels agreement check |
| **Trigger** | Scheduled |
| **Cron** | `0 9 1 1,4 *` |
| **When** | January 1 and April 1 at 09:00 UTC |
| **Repository** | `linneaegner/passbyte-kalkylator` (branch `main`) |

**Prompt:**

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
   - Do NOT merge the PR — a human must review first (see AGENTS.md)
```

Use a monthly schedule from late 2026 during the 2027 agreement negotiation.

Full copy-paste config: `.cursor/automations/handels-agreement-check.md`
