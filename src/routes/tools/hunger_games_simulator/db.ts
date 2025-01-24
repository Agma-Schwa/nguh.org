import Dexie, {type EntityTable} from 'dexie';
import {Configuration, type GameOptions} from '$lib/js/hgs.svelte';

export const db = new Dexie('HungerGamesSimulator') as Dexie & {
    tributes: EntityTable<Configuration.V1.StoredTributeOptions>,
}

db.version(1).stores({ tributes: '++' })