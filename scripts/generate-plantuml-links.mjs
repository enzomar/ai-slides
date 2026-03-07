#!/usr/bin/env node
/**
 * generate-plantuml-links.mjs
 *
 * For every *.puml file in the diagrams/ folder (or a custom directory),
 * encodes the PlantUML source using the official encoding algorithm
 * (raw deflate + PlantUML base-64 alphabet) and writes two shareable
 * URLs to a sibling *.link file:
 *
 *   uml: https://www.plantuml.com/plantuml/uml/<encoded>   ← opens online editor
 *   svg: https://www.plantuml.com/plantuml/svg/<encoded>   ← direct SVG render
 *
 * Usage (standalone):
 *   node scripts/generate-plantuml-links.mjs              # processes diagrams/
 *   node scripts/generate-plantuml-links.mjs path/to/dir  # custom directory
 *
 * Also called automatically by build-slides.mjs during `compile`.
 */

import { createDeflateRaw } from 'node:zlib'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, basename, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// ── PlantUML encoding ─────────────────────────────────────────────────────────

const PLANTUML_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'

const STD_B64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/** Translate a standard base-64 string to PlantUML's custom alphabet. */
function toPlantUMLBase64 (b64) {
  let out = ''
  for (const ch of b64) {
    const idx = STD_B64_ALPHABET.indexOf(ch)
    out += idx === -1 ? PLANTUML_ALPHABET[0] : PLANTUML_ALPHABET[idx]
  }
  return out
}

/** Compress PlantUML source text and return the URL-safe encoded string. */
async function encodePuml (text) {
  const input = Buffer.from(text, 'utf8')
  const compressed = await new Promise((resolve, reject) => {
    const chunks = []
    const stream = createDeflateRaw({ level: 9 })
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
    stream.end(input)
  })
  return toPlantUMLBase64(compressed.toString('base64'))
}

// ── Exported API (used by build-slides.mjs) ───────────────────────────────────

const PLANTUML_BASE = 'https://www.plantuml.com/plantuml'

/**
 * Generate .link files for every .puml file in `dir`.
 * @param {string} dir  Path to the diagrams directory (absolute or relative to cwd).
 */
export async function generatePlantUMLLinks (dir = 'diagrams') {
  let pumlFiles
  try {
    pumlFiles = readdirSync(dir).filter(f => extname(f) === '.puml').sort()
  } catch {
    console.warn(`[plantuml-links] Directory "${dir}" not found – skipping.`)
    return
  }

  if (pumlFiles.length === 0) {
    console.warn(`[plantuml-links] No .puml files found in "${dir}" – skipping.`)
    return
  }

  console.log(`[plantuml-links] Encoding ${pumlFiles.length} diagram(s) in "${dir}/"…`)

  for (const fname of pumlFiles) {
    const pumlPath = join(dir, fname)
    const linkPath = join(dir, basename(fname, '.puml') + '.link')

    const source = readFileSync(pumlPath, 'utf8')
    const encoded = await encodePuml(source)

    const content = [
      `# PlantUML links for ${fname}`,
      `# Generated: ${new Date().toISOString()}`,
      '',
      `uml: ${PLANTUML_BASE}/uml/${encoded}`,
      `svg: ${PLANTUML_BASE}/svg/${encoded}`,
      '',
    ].join('\n')

    writeFileSync(linkPath, content, 'utf8')
    console.log(`[plantuml-links]   ✓ ${fname}  →  ${basename(linkPath)}`)
  }
}

// ── CLI entry-point ───────────────────────────────────────────────────────────

const isDirectRun = process.argv[1]
  && fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isDirectRun) {
  const dir = process.argv[2] ?? 'diagrams'
  generatePlantUMLLinks(dir).catch(err => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
