// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type {Database} from "sqlite3";
import type {LanguagePage} from "$lib/js/types";

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            db: Database;
            langs: LanguagePage[];
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {};
