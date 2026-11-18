// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type {Database} from "bun:sqlite";
import type {LanguagePage} from "$lib/js/types";

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            db: Database;
            user: typeof import('./auth').auth.$Infer.Session.user | null;
            language_pages: readonly LanguagePage[];
            ccc_submissions: readonly string[];
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {};
