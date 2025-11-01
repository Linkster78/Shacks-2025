import { resolve, basename } from 'path';
import fs from 'fs/promises';

export type FileEntry = {
  path: string;
  name: string;
};

export async function getFiles(dir: string): Promise<FileEntry[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        return getFiles(res);
      } else {
        return [{ path: res, name: basename(res) }];
      }
    })
  );

  return files.flat();
}

export async function getFilesNotEncr(dir: string): Promise<FileEntry[]> {
    const files = await getFiles(dir);
    return files.filter(f => !f.name.endsWith('.enc'));
}

export function sampleN(els: any[], n: number) {
    if (els.length == 0) return [];

    const sampled = [];
    for (let i = 0; i < n; i++)
        sampled.push(els[Math.floor(Math.random() * els.length)]);
    return sampled;
}