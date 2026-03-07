#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { generatePlantUMLLinks } from './generate-plantuml-links.mjs';

export const TEMPLATE_FILE = 'index.template.html';
export const OUTPUT_FILE = 'index.html';
export const SLIDE_SOURCE_GROUPS = [
  { id: 'preface', folder: 'slides/preface', legacyFile: 'slides/preface.html', endMarker: '<!-- chapter1.html -->' },
  { id: 'chapter1', folder: 'slides/chapter1', legacyFile: 'slides/chapter1.html', startMarker: '<!-- chapter1.html -->', endMarker: '<!-- chapter2.html -->' },
  { id: 'chapter2', folder: 'slides/chapter2', legacyFile: 'slides/chapter2.html', startMarker: '<!-- chapter2.html -->', endMarker: '<!-- chapter3.html -->' },
  { id: 'chapter3', folder: 'slides/chapter3', legacyFile: 'slides/chapter3.html', startMarker: '<!-- chapter3.html -->', endMarker: '<!-- chapter4.html -->' },
  { id: 'chapter4', folder: 'slides/chapter4', legacyFile: 'slides/chapter4.html', startMarker: '<!-- chapter4.html -->', endMarker: '<!-- chapter5.html -->' },
  { id: 'chapter5', folder: 'slides/chapter5', legacyFile: 'slides/chapter5.html', startMarker: '<!-- chapter5.html -->', endMarker: '<!-- chapter6.html -->' },
  { id: 'chapter6', folder: 'slides/chapter6', legacyFile: 'slides/chapter6.html', startMarker: '<!-- chapter6.html -->', endMarker: '<!-- backmatter.html -->' },
  { id: 'backmatter', folder: 'slides/backmatter', legacyFile: 'slides/backmatter.html', startMarker: '<!-- backmatter.html -->', endMarker: '<!-- annex.html -->' },
  { id: 'annex', folder: 'slides/annex', legacyFile: 'slides/annex.html', startMarker: '<!-- annex.html -->' },
];

export const LEGACY_PARTIAL_FILES = SLIDE_SOURCE_GROUPS.map(({ legacyFile }) => legacyFile);
export const PARTIAL_FILES = LEGACY_PARTIAL_FILES;

const FILENAME_COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const SLIDE_BOUNDARY_RE = /^<!-- [^\n]*═[^\n]* -->$/gm;

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

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

function normalizeRelativePath(relativePath) {
  return relativePath.split(path.sep).join('/');
}

async function listFolderSlideFiles(rootDir, relativeDir) {
  const dirPath = resolvePath(rootDir, relativeDir);

  if (!(await pathExists(dirPath))) {
    return [];
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .sort((a, b) => FILENAME_COLLATOR.compare(a.name, b.name))
    .map((entry) => normalizeRelativePath(path.join(relativeDir, entry.name)));
}

export async function getSlideSourceFiles(rootDir = process.cwd()) {
  const files = [];

  for (const group of SLIDE_SOURCE_GROUPS) {
    const folderFiles = await listFolderSlideFiles(rootDir, group.folder);

    if (folderFiles.length > 0) {
      files.push(...folderFiles);
      continue;
    }

    const legacyPath = resolvePath(rootDir, group.legacyFile);

    if (await pathExists(legacyPath)) {
      files.push(group.legacyFile);
      continue;
    }

    throw new Error(
      `Could not find slide sources for ${group.id}. Expected slide files in ${group.folder}/ or legacy file ${group.legacyFile}.`
    );
  }

  return files;
}

export async function renderSlidesBundle(rootDir = process.cwd()) {
  const chunks = [];

  for (const relativePath of await getSlideSourceFiles(rootDir)) {
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

function extractSlideLabel(boundaryComment = '') {
  return boundaryComment
    .replace(/^<!--\s*/, '')
    .replace(/\s*-->$/, '')
    .replace(/═/g, '')
    .trim();
}

function slugify(value) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'slide';
}

function buildSlideFileName(index, boundaryComment) {
  const label = extractSlideLabel(boundaryComment);
  return `${String(index).padStart(2, '0')}-${slugify(label)}.html`;
}

function splitSegmentIntoSlides(segmentHtml) {
  const matches = [...segmentHtml.matchAll(SLIDE_BOUNDARY_RE)];

  if (matches.length === 0) {
    return [{ boundaryComment: '', content: segmentHtml.trim() ? `${segmentHtml.trimEnd()}\n` : '' }];
  }

  return matches
    .map((match, index) => {
      const start = index === 0 ? 0 : match.index;
      const end = index + 1 < matches.length ? matches[index + 1].index : segmentHtml.length;
      const content = segmentHtml.slice(start, end).replace(/^\s+/, '');

      return {
        boundaryComment: match[0],
        content: content.trim() ? `${content.trimEnd()}\n` : '',
      };
    })
    .filter(({ content }) => content.trim().length > 0);
}

async function writeBootstrapSlides(rootDir, group, segmentHtml, { force = false } = {}) {
  const folderPath = resolvePath(rootDir, group.folder);
  const folderExists = await pathExists(folderPath);

  if (folderExists && !force) {
    throw new Error(`${group.folder} already exists. Re-run with --force to overwrite existing slide files.`);
  }

  if (folderExists && force) {
    await fs.rm(folderPath, { recursive: true, force: true });
  }

  const slides = splitSegmentIntoSlides(segmentHtml);

  if (slides.length === 0) {
    throw new Error(`Could not split ${group.id} into slide files.`);
  }

  for (const [index, slide] of slides.entries()) {
    const fileName = buildSlideFileName(index + 1, slide.boundaryComment);
    const outputPath = resolvePath(rootDir, path.join(group.folder, fileName));
    await writeUtf8(outputPath, slide.content);
  }
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

  for (const group of SLIDE_SOURCE_GROUPS) {
    const startIndex = group.startMarker
      ? findRequiredMarker(slidesInner, group.startMarker, previousEnd)
      : previousEnd;

    const endIndex = group.endMarker
      ? findRequiredMarker(slidesInner, group.endMarker, startIndex + (group.startMarker ? group.startMarker.length : 0))
      : slidesInner.length;

    await writeBootstrapSlides(rootDir, group, slidesInner.slice(startIndex, endIndex), { force });
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
    await generatePlantUMLLinks(path.join(process.cwd(), 'diagrams'));
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
