declare module "bun" {
    interface Env {
        USERNAME: string;
        PASSWORD: string;
        DOWNLOADLOCATION: string;
        SAVEEXTRAINFO: string;
    }
}
import type pixiv from "./types/pixiv";
export declare const pixivRes = pixiv
