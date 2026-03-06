#!/usr/bin/env node
/**
 * Strip inline speaker note text from the slide source partials.
 * Replaces <aside class="notes">...text...</aside>
 * with empty <aside class="notes"></aside>, then rebuilds index.html.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

(async () => {
  const { PARTIAL_FILES, compileSlides } = await import('./build-slides.mjs');
  let totalCount = 0;
  let totalSaved = 0;

  for (const relativePath of PARTIAL_FILES) {
    const filePath = path.join(rootDir, relativePath);
    let html = fs.readFileSync(filePath, 'utf8');
    const before = html.length;
    const count = (html.match(/<aside class="notes">/g) || []).length;

    html = html.replace(
      /(<aside class="notes">)\s*[\s\S]*?\s*(<\/aside>)/g,
      '$1$2'
    );

    const after = html.length;
    totalCount += count;
    totalSaved += before - after;

    if (before !== after) {
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`Stripped notes in ${relativePath}`);
    }
  }

  await compileSlides(rootDir);
  console.log(`Stripped ${totalCount} inline note block(s)`);
  console.log(`Saved ${totalSaved} characters across slide partials`);
})().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
