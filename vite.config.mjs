import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { defineConfig } from 'vite';
import { TEMPLATE_FILE, createSlidesHtmlPlugin } from './scripts/build-slides.mjs';

function createSlidesDevEntryPlugin(rootDir = process.cwd()) {
  const templatePath = path.resolve(rootDir, TEMPLATE_FILE);

  return {
    name: 'ai-slides-dev-entry',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];

        if (url !== '/' && url !== '/index.html' && url !== `/${TEMPLATE_FILE}`) {
          return next();
        }

        try {
          const template = await fs.readFile(templatePath, 'utf8');
          const html = await server.transformIndexHtml('/index.html', template, req.originalUrl);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig(() => {
  const rootDir = process.cwd();

  return {
    plugins: [createSlidesHtmlPlugin(rootDir), createSlidesDevEntryPlugin(rootDir)],
    server: {
      open: '/',
    },
  };
});
