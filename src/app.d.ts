// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type {Database} from "sqlite3";

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            db: Database;
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {};
