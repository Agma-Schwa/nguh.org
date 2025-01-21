import Dexie, {type EntityTable} from 'dexie';
import {Configuration} from '$lib/js/hgs.svelte';

export const db = new Dexie('HungerGamesSimulator') as Dexie & {
    tributes: EntityTable<Configuration.V1.StoredTributeOptions>
}

// Note: V1 of the database corresponds to the Configuration.V1 namespace.
db.version(1).stores({
    tributes: '++'
})