// Generates static index.html for every page in pages.js.
// Run from project root:  node scripts/generate.js [--force]
//
// Skips slugs that already have public/<slug>/index.html unless --force is passed.
// That keeps the hand-authored piloto pages safe by default.

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdir, writeFile, access } from "node:fs/promises";
import { pages } from "./pages.js";
import { render } from "./template.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const force = process.argv.includes("--force");

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

let written = 0;
let skipped = 0;
const errors = [];

for (const page of pages) {
  if (!page.slug) { errors.push(`Page without slug: ${JSON.stringify(page).slice(0, 80)}`); continue; }
  const outDir = resolve(publicDir, page.slug);
  const outFile = resolve(outDir, "index.html");

  if (!force && (await exists(outFile))) {
    skipped++;
    console.log(`  skip  ${page.slug} (already exists, use --force to overwrite)`);
    continue;
  }

  try {
    const html = render(page);
    await mkdir(outDir, { recursive: true });
    await writeFile(outFile, html, "utf8");
    written++;
    console.log(`  ok    ${page.slug}`);
  } catch (err) {
    errors.push(`${page.slug}: ${err.message}`);
    console.log(`  FAIL  ${page.slug} — ${err.message}`);
  }
}

console.log(`\n${written} written · ${skipped} skipped · ${errors.length} errors`);
if (errors.length) {
  console.log("\nErrors:");
  errors.forEach((e) => console.log("  - " + e));
  process.exit(1);
}
