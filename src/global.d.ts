import type { Rats } from "./rats";

declare global {
    interface Window
    {
        rats: Rats;
    }
}

export {}