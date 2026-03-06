#!/usr/bin/env node
/**
 * Extract all speaker notes from index.html and generate the EN notes file.
 * Also produces a summary of which slides have notes.
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Split into sections
const sections = html.split(/<section\b/g).slice(1); // skip the part before first <section>

const notes = {};
let slideIndex = 0;

sections.forEach((sec, i) => {
  // Extract section attributes
  const closeTag = sec.indexOf('>');
  const attrs = sec.substring(0, closeTag);

  // Extract id
  const idMatch = attrs.match(/id="([^"]+)"/);
  const id = idMatch ? idMatch[1] : null;

  // Extract notes
  const noteMatch = sec.match(/<aside class="notes">\s*([\s\S]*?)\s*<\/aside>/);
  if (noteMatch) {
    const noteText = noteMatch[1].replace(/\s+/g, ' ').trim();
    // Generate a key: use id if available, otherwise slide-{index}
    const key = id || ('slide-' + slideIndex);
    notes[key] = noteText;
    console.log(`[${slideIndex}] ${key} (${noteText.length} chars): ${noteText.substring(0, 70)}...`);
  }
  slideIndex++;
});

console.log('\nTotal slides with notes:', Object.keys(notes).length);

// Write the EN notes file
const output = `/* ═══════════════════════════════════════════════════════════
   SPEAKER NOTES — English
   Key = slide id or "slide-{index}" for slides without id
   ═══════════════════════════════════════════════════════════ */
window.NOTES_EN = ${JSON.stringify(notes, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'js', 'notes', 'en.js'), output, 'utf8');
console.log('\nWrote js/notes/en.js');
