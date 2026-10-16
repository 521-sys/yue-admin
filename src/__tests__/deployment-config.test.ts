import { afterEach, expect, it } from 'vitest';
import { build } from 'vite';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

let outputDirectory = '';

afterEach(async () => {
  if (outputDirectory) await rm(outputDirectory, { recursive: true, force: true });
  outputDirectory = '';
});

it('builds deployable asset URLs below the admin path', async () => {
  outputDirectory = await mkdtemp(path.join(tmpdir(), 'yue-admin-build-'));

  await build({
    root: path.resolve(__dirname, '../..'),
    logLevel: 'silent',
    build: { outDir: outputDirectory, emptyOutDir: true },
  });

  const html = await readFile(path.join(outputDirectory, 'index.html'), 'utf8');
  expect(html).toMatch(/(?:src|href)="\/admin\/assets\//);
});
