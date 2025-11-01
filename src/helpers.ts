import { resolve } from 'path';
import { promisify } from 'util';
import fs from 'fs';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export async function getFiles(dir: string): Promise<string[]> {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir: string) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : [res];
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

export function sampleN(els: any[], n: number) {
    const sampled = [];
    for(let i = 0; i < n; i++)
        sampled.push(els[Math.floor(Math.random() * els.length)]);
    return sampled;
}