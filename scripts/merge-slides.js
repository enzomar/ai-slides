const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const chapters = [
  "chapter1.html",
  "chapter2.html",
  "chapter3.html",
  "chapter4.html",
  "chapter5.html",
  "chapter6.html",
  "annex.html"
];

// Menu label shown for each chapter in the sidebar
const chapterTitles = {
  "chapter1.html": "Ch.1 · Introduction",
  "chapter2.html": "Ch.2 · Prompt Engineering",
  "chapter3.html": "Ch.3 · AI-Assisted Coding",
  "chapter4.html": "Ch.4 · RAG Architecture",
  "chapter5.html": "Ch.5 · AI Agents + MCP",
  "chapter6.html": "Ch.6 · Ethics & Future",
  "annex.html":    "Annex",
};

function extractSlides(html) {
  // Match everything up to the last </section> before the closing </div><!-- /slides -->
  let match = html.match(/<div class="slides">([\s\S]*<\/section>)\s*\n*\s*<\/div>\s*<!--\s*\/slides\s*-->/i);
  if (match) return match[1].trimEnd();

  // Fallback: cover </div></div> pattern (no comment marker)
  match = html.match(/<div class="slides">([\s\S]*<\/section>)\s*\n?\s*<\/div>\s*<\/div>/i);
  if (match) return match[1].trimEnd();

  return "";
}

function extractInlineScripts(html) {
  // Extract inline <script> blocks that are NOT src-based and not just initSlides()
  const results = [];
  const re = /<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    // Skip external scripts
    if (/\bsrc\s*=/.test(tag)) continue;
    // Skip trivial initSlides-only blocks
    const body = tag.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "").trim();
    if (/^initSlides\(\);\s*$/.test(body)) continue;
    // Strip initSlides() call if it appears alongside other code
    const cleaned = body.replace(/^\s*initSlides\(\);\s*/m, "").trim();
    if (cleaned) results.push(`<script>\n${cleaned}\n</script>`);
  }
  return results.join("\n");
}

function removeNav(html) {
  return html
    .replace(/<div class="nav-bar">[\s\S]*?<\/div>/g, "")
    .replace(/<script\s[^>]*src=[^>]*><\/script>/g, "")
    .replace(/<script>\s*initSlides\(\);\s*<\/script>/g, "");
}

function merge() {

  const index = fs.readFileSync(
    path.join(root, "index.html"),
    "utf8"
  );

  let mergedSlides = "";
  let mergedScripts = "";

  chapters.forEach(file => {

    const fullPath = path.join(root, file);

    if (!fs.existsSync(fullPath)) {
      console.warn("Missing:", file);
      return;
    }

    const html = fs.readFileSync(fullPath, "utf8");

    let slides = extractSlides(html);

    slides = removeNav(slides);

    // Inject id on the first chapter/annex divider section
    const sectionId = file === 'annex.html' ? 'annex'
      : 'chapter-' + (file.match(/chapter(\d+)/) || [])[1];
    slides = slides.replace(
      '<section class="chapter-divider">',
      `<section class="chapter-divider" id="${sectionId}">`
    );

    mergedSlides += `\n<!-- ${file} -->\n`;
    mergedSlides += slides;

    const inlineScripts = extractInlineScripts(html);
    if (inlineScripts) {
      mergedScripts += `\n<!-- inline scripts: ${file} -->\n${inlineScripts}\n`;
    }

  });

  // Add animations.css to <head> if not already present
  let final = index.replace(
    /<\/head>/,
    `<link rel="stylesheet" href="css/animations.css"/>\n</head>`
  );

  // Replace slides div — anchor to last </section> so we don't carry the stray </div>.
  // Use a replacer function to prevent $ in slide content being treated as backreferences.
  final = final.replace(
    /(<div class="slides">[\s\S]*<\/section>)\s*\n*\s*<\/div>\s*<!--\s*\/slides\s*-->/,
    (_, indexSlides) => `${indexSlides}\n\n${mergedSlides}\n</div><!-- /slides -->`
  );

  // Convert agenda links to in-page hash navigation
  final = final.replace(/href="chapter(\d+)\.html"/g, 'href="#/chapter-$1"');
  final = final.replace(/href="annex\.html"/g, 'href="#/annex"');
  // Add id to agenda section
  final = final.replace(
    /<!-- ═+ AGENDA ═+ -->\n<section>/,
    '<!-- ══════════════════════ AGENDA ══════════════════════ -->\n<section id="agenda">'
  );
  // Fix "Back to Agenda" links that point to index.html
  final = final.replace(/href="index\.html"/g, 'href="#/agenda"');

  // Add animations.js before closing </body>
  final = final.replace(
    /<script src="js\/slides\.js"><\/script>/,
    `<script src="js/animations.js"></script>\n<script src="js/slides.js"></script>`
  );

  // Inject chapter inline scripts before </body>
  // Use replacer function to prevent $ in JS code being treated as backreferences.
  if (mergedScripts) {
    final = final.replace("</body>", () => `${mergedScripts}\n</body>`);
  }

  fs.writeFileSync(
    path.join(root, "index.full.html"),
    final
  );

  console.log("Slides merged into index.full.html");
}

merge();