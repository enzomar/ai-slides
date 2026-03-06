#!/usr/bin/env node
/**
 * Strip inline speaker note text from index.html.
 * Replaces <aside class="notes">...text...</aside>
 * with empty <aside class="notes"></aside>
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

const before = html.length;
const count = (html.match(/<aside class="notes">/g) || []).length;

// Replace multi-line note blocks with empty aside tags
html = html.replace(
  /(<aside class="notes">)\s*[\s\S]*?\s*(<\/aside>)/g,
  '$1$2'
);

const after = html.length;
fs.writeFileSync(filePath, html, 'utf8');

console.log(`Stripped ${count} inline notes`);
console.log(`File size: ${before} → ${after} (saved ${before - after} chars)`);
