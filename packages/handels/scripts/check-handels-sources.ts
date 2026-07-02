import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { normalizePageContent } from "./handels-source-utils.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PACKAGE_ROOT = join(__dirname, "..")
const SNAPSHOTS_DIR = join(PACKAGE_ROOT, "snapshots")
const SOURCES_PATH = join(PACKAGE_ROOT, "sources.json")

type Source = {
  id: string
  url: string
  description: string
  codePaths: string[]
}

type SourcesConfig = {
  sources: Source[]
}

type CheckResult = {
  id: string
  url: string
  changed: boolean
  fetchFailed?: boolean
  previousHash?: string
  currentHash?: string
}

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex")
}

function snapshotPath(id: string): string {
  return join(SNAPSHOTS_DIR, `${id}.txt`)
}

function loadSources(): Source[] {
  const raw = readFileSync(SOURCES_PATH, "utf8")
  return (JSON.parse(raw) as SourcesConfig).sources
}

async function fetchSource(source: Source): Promise<string> {
  const response = await fetch(source.url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "sv-SE,sv;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.url}: HTTP ${response.status}`)
  }

  const html = await response.text()
  if (/just a moment/i.test(html)) {
    throw new Error(`Failed to fetch ${source.url}: blocked by bot protection`)
  }

  return html
}

async function checkSource(source: Source, update: boolean): Promise<CheckResult> {
  const path = snapshotPath(source.id)
  const hasSnapshot = existsSync(path)

  let normalized: string
  try {
    const html = await fetchSource(source)
    normalized = normalizePageContent(html)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`  fetch error: ${message}`)
    return {
      id: source.id,
      url: source.url,
      changed: false,
      fetchFailed: true,
    }
  }

  const currentHash = hashContent(normalized)
  const previousContent = hasSnapshot ? readFileSync(path, "utf8") : ""
  const previousHash = hasSnapshot ? hashContent(previousContent) : undefined
  const changed = !hasSnapshot || previousHash !== currentHash

  if (update || !hasSnapshot) {
    mkdirSync(SNAPSHOTS_DIR, { recursive: true })
    writeFileSync(path, normalized, "utf8")
  }

  return {
    id: source.id,
    url: source.url,
    changed,
    previousHash,
    currentHash,
  }
}

function printReport(results: CheckResult[], update: boolean): void {
  const fetchFailures = results.filter((result) => result.fetchFailed)
  const changed = results.filter((result) => result.changed && !result.fetchFailed)

  console.log(`Checked ${results.length} Handels source page(s).\n`)

  for (const result of results) {
    if (result.fetchFailed) {
      console.log(`- [FETCH FAILED] ${result.id}`)
      console.log(`  ${result.url}`)
      continue
    }

    const status = result.changed ? "CHANGED" : "unchanged"
    console.log(`- [${status}] ${result.id}`)
    console.log(`  ${result.url}`)
    if (result.changed && result.previousHash && result.currentHash) {
      console.log(`  hash: ${result.previousHash.slice(0, 12)}… → ${result.currentHash.slice(0, 12)}…`)
    } else if (!result.previousHash && result.currentHash) {
      console.log(`  hash: (new) ${result.currentHash.slice(0, 12)}…`)
    }
  }

  if (fetchFailures.length > 0) {
    console.log(
      `\n${fetchFailures.length} page(s) could not be fetched (often Cloudflare from servers).`,
    )
    console.log("Run `pnpm check:handels:update` locally or use a Cursor agent with web access.")
  }

  if (update) {
    console.log("\nSnapshots updated. Commit the files in packages/handels/snapshots/ after verifying code changes.")
    return
  }

  if (changed.length === 0 && fetchFailures.length === 0) {
    console.log("\nNo changes detected.")
    return
  }

  if (changed.length > 0) {
    console.log(`\n${changed.length} page(s) changed. See packages/handels/AGENTS.md for how to update the code.`)
  }
}

async function main(): Promise<void> {
  const update = process.argv.includes("--update")
  const sources = loadSources()
  const results: CheckResult[] = []

  for (const source of sources) {
    results.push(await checkSource(source, update))
  }

  printReport(results, update)

  const fetchFailures = results.filter((result) => result.fetchFailed)
  const changed = results.filter((result) => result.changed && !result.fetchFailed)

  if (!update && fetchFailures.length === results.length) {
    process.exitCode = 2
    return
  }

  if (!update && changed.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
