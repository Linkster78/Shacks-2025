import path from 'path';
import util from 'util';
import fs from 'fs';
import { get } from 'http';


const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

export async function getFiles(dir: string): Promise<string[]> {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir: string) => {
        const res = path.resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : [res];
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

export async function getFilesNotEncr(dir: string): Promise<string[]> {
    const files = await getFiles(dir);
    return files.filter(f => !f.endsWith('.enc'));
}

export function sampleN(els: any[], n: number) {
    if (els.length == 0) return [];

    const sampled = [];
    for (let i = 0; i < n; i++)
        sampled.push(els[Math.floor(Math.random() * els.length)]);
    return sampled;
}