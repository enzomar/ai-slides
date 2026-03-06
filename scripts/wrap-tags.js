/**
 * Wraps adjacent .chapter-tag + .slide-tag pairs into a <div class="tag-bar"> container.
 * Standalone tags (without a sibling) are left unchanged.
 */
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Match: <span class="chapter-tag" ...>...</span> followed by whitespace/newline then <span class="slide-tag" ...>...</span>
const pairRe = /^([ \t]*)(<span class="chapter-tag"[^>]*>[^<]*<\/span>)\s*\n\s*(<span class="slide-tag"[^>]*>[^<]*<\/span>)/gm;

let count = 0;
html = html.replace(pairRe, (match, indent, chapterTag, slideTag) => {
  count++;
  return `${indent}<div class="tag-bar">${chapterTag} ${slideTag}</div>`;
});

fs.writeFileSync('index.html', html);
console.log(`Wrapped ${count} tag pairs in .tag-bar containers.`);
