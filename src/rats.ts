import { getFiles } from "./helpers";

const ENCRYPTION_DIR: string = './to_encrypt';

let isQuestionning: boolean = false;

async function listIncentives(): Promise<string[]> {
    const files = await getFiles(ENCRYPTION_DIR);
    return files;
}

export default { listIncentives, isQuestionning };
