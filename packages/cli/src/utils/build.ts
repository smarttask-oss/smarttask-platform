import { ux } from '@oclif/core';
import archiver from 'archiver';
import { execSync } from 'child_process';
import * as esbuild from 'esbuild';
import { createWriteStream } from 'fs';
import { chmod, rm, writeFile } from 'fs/promises';
import { resolve } from 'path';

interface BuildOptions {
  directory: string;
  output: string;
}

export const build = async (options: BuildOptions) => {
  ux.action.start('Building');
  await bundle(options.directory);
  ux.action.stop('✅ done');
  ux.action.start('Dehydrating');
  await dehydrate(options.directory);
  ux.action.stop('✅ done');
  ux.action.start(`Compressing to ${resolve(options.directory, `${options.output}.zip`)}`);
  await compress(options.directory, `${options.output}.zip`);
  ux.action.stop('✅ done');
};

const bundle = async (dir: string) => {
  await esbuild.build({
    absWorkingDir: dir,
    entryPoints: ['index.ts'],
    bundle: true,
    outdir: 'dist',
    format: 'cjs',
    platform: 'node',
    minifySyntax: true,
    minifyWhitespace: true,
  });
};

const dehydrate = async (dir: string) => {
  const path = resolve(dir, 'dist', 'dehydrate.mjs');
  try {
    await writeFile(
      path,
      `import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { dehydrate } from '@smarttask-platform/core/dist/utils.js';
import pkg from './index.js';
    
const func = () => {
  writeFileSync('dist/schema.json', JSON.stringify(dehydrate(pkg.integration), undefined, 2));
};
    
func();`
    );
    execSync('node dist/dehydrate.mjs');
    await rm(path);
  } catch (e) {
    console.log(e);
  }
};

const compress = async (dir: string, target: string) => {
  const output = createWriteStream(resolve(dir, target));
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  archive.pipe(output);
  archive.directory(resolve(dir, 'dist/'), false);
  archive.finalize();
};
