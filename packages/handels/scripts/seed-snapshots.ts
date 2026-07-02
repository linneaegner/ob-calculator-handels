import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { normalizeAgreementText } from "./handels-source-utils.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SNAPSHOTS_DIR = join(__dirname, "..", "snapshots")

/** Bootstrap snapshots when server-side fetch is blocked. Re-run after a successful `check:sources:update`. */
const SEED_CONTENT: Record<string, string> = {
  "avtal-butik-lager-e-handel": `
Så höjs lönen för dig inom butik, lager och e-handel
Från och med 1 april 2026 får du 5,75 kronor mer i timmen
Från och med 1 april 2025 fick du 6,31 kronor mer i timmen
Från och med 1 april 2026 får du 925 kronor mer i månaden (5,32 kronor mer i timmen)
Från och med 1 april 2025 fick du 1 000 kronor mer i månaden (5,75 kronor mer i timmen)
löneökningen 12,06 kronor/timme och för lageranställda 11,07 kronor/timme
Ob-ersättning ges ut som ett procentuellt påslag
`,
  "roda-dagar": `
2026:
Torsdag 1 januari: Nyårsdagen
Tisdag 6 januari: Trettondedag jul
Fredag 3 april: Långfredagen
Söndag 5 april: Påskdagen
Måndag 6 april: Annandag påsk
Fredag 1 maj: Första maj
Torsdag 14 maj: Kristi himmelsfärdsdag
Lördag 6 juni: Sveriges nationaldag
Lördag 20 juni: Midsommardagen
Lördag 31 oktober: Alla helgons dag
Fredag 25 december: Juldagen
Lördag 26 december: Annandag jul
Lördag 4 april: Påskafton
Fredag 19 juni: Midsommarafton
Torsdag 24 december: Julafton
Torsdag 31 december: Nyårsafton
påskafton ingen speciell dag, utan räknas som en vanlig lördag
Julafton, nyårsafton och midsommarafton så innebär det att du har 100% ob-ersättning hela dagen
`,
  "ob-tillagg": `
Ob-tillägg i butik
Måndag-fredag 18.15-20.00 50 %
Måndag–fredag efter 20.00 70 %
Lördagar efter 12.00 100 %
Söndagar och helgdagar 100 %
Ob-tillägg för lager
Måndag 00.00–06.00 70 %
Måndag–fredag 06.00–07.00 40 %
Måndag–fredag 18.00–23.00 40 %
Måndag–fredag 23.00–06.00 70 %
Lördag 00.00–06.00 70 %
Lördag 06.00–23.00 40 %
Lördag 23.00–24.00 70 %
Söndag och helgdag 100 %
`,
  "laegstaloener-faq": `
Vilka lägstalöner gäller i min bransch?
Detaljhandelsavtalet
Lager och e-handelsavtalet
Hur mycket ska min lön höjas 2026?
`,
}

mkdirSync(SNAPSHOTS_DIR, { recursive: true })

for (const [id, content] of Object.entries(SEED_CONTENT)) {
  const normalized = normalizeAgreementText(content)
  writeFileSync(join(SNAPSHOTS_DIR, `${id}.txt`), normalized, "utf8")
  console.log(`Seeded snapshot: ${id}`)
}
