#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

async function resolveGitDir(rootDir) {
  const dotGitPath = path.join(rootDir, '.git');

  try {
    const stat = await fs.stat(dotGitPath);

    if (stat.isDirectory()) {
      return dotGitPath;
    }

    if (stat.isFile()) {
      const pointer = await fs.readFile(dotGitPath, 'utf8');
      const match = pointer.match(/^gitdir:\s*(.+)\s*$/m);
      if (match) {
        return path.resolve(rootDir, match[1]);
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function main() {
  const rootDir = process.cwd();
  const gitDir = await resolveGitDir(rootDir);

  if (!gitDir) {
    console.log('prepare: no Git repository detected, skipping hook installation');
    return;
  }

  const hookTarget = path.join(rootDir, '.githooks', 'pre-commit');
  const hookPath = path.join(gitDir, 'hooks', 'pre-commit');
  const hookShim = `#!/bin/sh
exec "${hookTarget}" "$@"
`;

  await fs.mkdir(path.dirname(hookPath), { recursive: true });
  await fs.chmod(hookTarget, 0o755).catch(() => {});
  await fs.writeFile(hookPath, hookShim, 'utf8');
  await fs.chmod(hookPath, 0o755);

  console.log('prepare: installed pre-commit hook');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
