#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const TEMPLATE_FILE = 'index.template.html';
export const OUTPUT_FILE = 'index.html';
export const PARTIAL_FILES = [
  'slides/preface.html',
  'slides/chapter1.html',
  'slides/chapter2.html',
  'slides/chapter3.html',
  'slides/chapter4.html',
  'slides/chapter5.html',
  'slides/chapter6.html',
  'slides/annex.html',
];

const BOOTSTRAP_SEGMENTS = [
  { file: 'slides/preface.html', endMarker: '<!-- chapter1.html -->' },
  { file: 'slides/chapter1.html', startMarker: '<!-- chapter1.html -->', endMarker: '<!-- chapter2.html -->' },
  { file: 'slides/chapter2.html', startMarker: '<!-- chapter2.html -->', endMarker: '<!-- chapter3.html -->' },
  { file: 'slides/chapter3.html', startMarker: '<!-- chapter3.html -->', endMarker: '<!-- chapter4.html -->' },
  { file: 'slides/chapter4.html', startMarker: '<!-- chapter4.html -->', endMarker: '<!-- chapter5.html -->' },
  { file: 'slides/chapter5.html', startMarker: '<!-- chapter5.html -->', endMarker: '<!-- chapter6.html -->' },
  { file: 'slides/chapter6.html', startMarker: '<!-- chapter6.html -->', endMarker: '<!-- annex.html -->' },
  { file: 'slides/annex.html', startMarker: '<!-- annex.html -->' },
];

function resolveRoot(rootDir = process.cwd()) {
  return path.resolve(rootDir);
}

function resolvePath(rootDir, relativePath) {
  return path.join(resolveRoot(rootDir), relativePath);
}

async function readUtf8(filePath) {
  return fs.readFile(filePath, 'utf8');
}

async function writeUtf8(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

export async function renderSlidesBundle(rootDir = process.cwd()) {
  const chunks = [];

  for (const relativePath of PARTIAL_FILES) {
    const absolutePath = resolvePath(rootDir, relativePath);
    chunks.push(await readUtf8(absolutePath));
  }

  return chunks.join('');
}

export async function renderTemplate(rootDir = process.cwd()) {
  const templatePath = resolvePath(rootDir, TEMPLATE_FILE);
  const template = await readUtf8(templatePath);

  if (!template.includes('<!-- @slides -->')) {
    throw new Error(`${TEMPLATE_FILE} does not contain the <!-- @slides --> placeholder.`);
  }

  const slides = await renderSlidesBundle(rootDir);
  return template.replace('<!-- @slides -->', slides);
}

export function createSlidesHtmlPlugin(rootDir = process.cwd()) {
  return {
    name: 'ai-slides-html-partials',
    enforce: 'pre',
    async transformIndexHtml(html) {
      if (!html.includes('<!-- @slides -->')) {
        return html;
      }

      const slides = await renderSlidesBundle(rootDir);
      return html.replace('<!-- @slides -->', slides);
    },
  };
}

export async function compileSlides(rootDir = process.cwd()) {
  const { createServer } = await import('vite');

  const server = await createServer({
    configFile: false,
    root: resolveRoot(rootDir),
    appType: 'custom',
    logLevel: 'error',
    plugins: [createSlidesHtmlPlugin(rootDir)],
  });

  try {
    const template = await readUtf8(resolvePath(rootDir, TEMPLATE_FILE));
    const html = await server.transformIndexHtml('/index.html', template);
    const compiledHtml = html
      .replace(/^\s*<script type="module" src="\/\@vite\/client"><\/script>\n?/m, '')
      .replace('<head>\n\n', '<head>\n');
    await writeUtf8(resolvePath(rootDir, OUTPUT_FILE), compiledHtml);
    return compiledHtml;
  } finally {
    await server.close();
  }
}

function findRequiredMarker(haystack, marker, fromIndex = 0) {
  const index = haystack.indexOf(marker, fromIndex);
  if (index === -1) {
    throw new Error(`Could not find marker: ${marker}`);
  }
  return index;
}

export async function bootstrapSlides(rootDir = process.cwd(), { force = false } = {}) {
  const indexPath = resolvePath(rootDir, OUTPUT_FILE);
  const html = await readUtf8(indexPath);

  const slidesOpen = '<div class="slides">';
  const slidesClose = '</div><!-- /slides -->';
  const slidesOpenIndex = findRequiredMarker(html, slidesOpen);
  const slidesInnerStart = slidesOpenIndex + slidesOpen.length;
  const slidesCloseIndex = findRequiredMarker(html, slidesClose, slidesInnerStart);
  const slidesInner = html.slice(slidesInnerStart, slidesCloseIndex);

  let previousEnd = 0;

  for (const segment of BOOTSTRAP_SEGMENTS) {
    const startIndex = segment.startMarker
      ? findRequiredMarker(slidesInner, segment.startMarker, previousEnd)
      : previousEnd;

    const endIndex = segment.endMarker
      ? findRequiredMarker(slidesInner, segment.endMarker, startIndex + (segment.startMarker ? segment.startMarker.length : 0))
      : slidesInner.length;

    const outputPath = resolvePath(rootDir, segment.file);

    if (!force) {
      try {
        await fs.access(outputPath);
        throw new Error(`${segment.file} already exists. Re-run with --force to overwrite existing slide partials.`);
      } catch (error) {
        if (error && error.code !== 'ENOENT') {
          throw error;
        }
      }
    }

    await writeUtf8(outputPath, slidesInner.slice(startIndex, endIndex));
    previousEnd = endIndex;
  }

  const template = `${html.slice(0, slidesInnerStart)}<!-- @slides -->${html.slice(slidesCloseIndex)}`;
  const templatePath = resolvePath(rootDir, TEMPLATE_FILE);

  if (!force) {
    try {
      await fs.access(templatePath);
      throw new Error(`${TEMPLATE_FILE} already exists. Re-run with --force to overwrite the template.`);
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  await writeUtf8(templatePath, template);
}

async function main() {
  const [, , command, ...args] = process.argv;
  const force = args.includes('--force');

  if (command === 'bootstrap') {
    await bootstrapSlides(process.cwd(), { force });
    return;
  }

  if (command === 'compile') {
    await compileSlides(process.cwd());
    return;
  }

  if (command === 'check') {
    const rendered = await renderTemplate(process.cwd());
    const current = await readUtf8(resolvePath(process.cwd(), OUTPUT_FILE));

    if (rendered === current) {
      console.log('match');
      return;
    }

    console.log('diff');
    process.exitCode = 1;
    return;
  }

  console.error('Usage: node scripts/build-slides.mjs <bootstrap|compile|check> [--force]');
  process.exitCode = 1;
}

const isDirectRun = process.argv[1]
  && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
