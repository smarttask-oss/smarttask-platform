import { ux } from '@oclif/core';
import * as esbuild from 'esbuild';
import { wait } from './common';

interface BuildOptions {}

interface CompressOptions {}

interface UploadOptions {}

const bundle = async (dir: string) => {
  await esbuild.build({
    absWorkingDir: dir,
    entryPoints: ['src/wrapper.ts'],
    bundle: true,
    outdir: 'dist',
    format: 'cjs',
    minifySyntax: true,
    minifyWhitespace: true,
  });
};

export const build = async (dir: string, options: BuildOptions = {}) => {
  ux.action.start('Building');
  await bundle(dir);
  ux.action.stop('✅ done');
};

export const compress = async () => {};

export const upload = async () => {};
