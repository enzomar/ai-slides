/**
 * Wraps adjacent .chapter-tag + .slide-tag pairs into a <div class="tag-bar"> container.
 * Source partials are updated in-place and the compiled index is rebuilt afterwards.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Match: <span class="chapter-tag" ...>...</span> followed by whitespace/newline then <span class="slide-tag" ...>...</span>
const pairRe = /^([ \t]*)(<span class="chapter-tag"[^>]*>[^<]*<\/span>)\s*\n\s*(<span class="slide-tag"[^>]*>[^<]*<\/span>)/gm;

(async () => {
  const { PARTIAL_FILES, compileSlides } = await import('./build-slides.mjs');
  let totalCount = 0;

  for (const relativePath of PARTIAL_FILES) {
    const filePath = path.join(rootDir, relativePath);
    let html = fs.readFileSync(filePath, 'utf8');
    let fileCount = 0;

    html = html.replace(pairRe, (match, indent, chapterTag, slideTag) => {
      fileCount++;
      totalCount++;
      return `${indent}<div class="tag-bar">${chapterTag} ${slideTag}</div>`;
    });

    if (fileCount > 0) {
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`Wrapped ${fileCount} tag pair(s) in ${relativePath}`);
    }
  }

  await compileSlides(rootDir);
  console.log(`Rebuilt index.html from partials (${totalCount} wrap(s) total).`);
})().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
