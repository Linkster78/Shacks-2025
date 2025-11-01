import { resolve, basename } from 'path';
import { promisify } from 'util';
import fs from 'fs';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export type FileEntry = {
  path: string;
  name: string;
};

export async function getFiles(dir: string): Promise<FileEntry[]> {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir: string) => {
      const res = resolve(dir, subdir);
      const fileStat = await stat(res);
      if (fileStat.isDirectory()) {
        return getFiles(res);
      } else if (!res.endsWith('.enc')) {
        return [{ path: res, name: basename(res) }];
      } else {
        return [];
      }
    })
  );
  return files.flat();
}

export function sampleN(els: any[], n: number) {
    if(els.length == 0) return [];

    const sampled = [];
    for(let i = 0; i < n; i++)
        sampled.push(els[Math.floor(Math.random() * els.length)]);
    return sampled;
}