/**
 * Verify that every published bundle matches its source.
 *
 * `lib/` is what npm publishes and what a profile loads; `src/` is what the
 * tests exercise. Nothing derives one from the other at install time, so a
 * forgotten `cp` would ship stale code behind a green test run. This turns that
 * silent failure into a non-zero exit.
 */

import { readFileSync } from 'node:fs'

/** Source-to-artifact pairs that must stay byte-identical. */
const PAIRS = [
  ['src/index.js', 'lib/index.js'],
  ['src/client.js', 'lib/client.js'],
]

const failures = []

for (const [src, lib] of PAIRS) {
  let source
  let artifact
  try {
    source = readFileSync(src)
  } catch {
    failures.push(`${src} is missing`)
    continue
  }
  try {
    artifact = readFileSync(lib)
  } catch {
    failures.push(`${lib} is missing — run \`npm run build\``)
    continue
  }
  if (!source.equals(artifact)) {
    failures.push(`${lib} differs from ${src} — run \`npm run build\``)
  }
}

if (failures.length > 0) {
  process.stderr.write(`check-sync: ${String(failures.length)} problem(s)\n`)
  for (const line of failures) process.stderr.write(`  ${line}\n`)
  process.exit(1)
}

process.stdout.write(`check-sync: ${String(PAIRS.length)} bundles match their sources\n`)
