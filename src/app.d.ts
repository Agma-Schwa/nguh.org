// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type {Database} from "sqlite3";
import type {LanguagePage} from "$lib/js/types";

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            db: Database;
            shared_db: Database,
            language_pages: LanguagePage[];
            ccc_submissions: string[];
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {};
