import { getFiles } from "./helpers";

const ENCRYPTION_DIR: string = './to_encrypt';

async function listIncentives(): Promise<string[]> {
    const files = await getFiles(ENCRYPTION_DIR);
    return files;
}

export default { listIncentives }