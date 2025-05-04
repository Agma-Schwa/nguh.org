<script lang="ts">
    import {type Dictionary, type Entry, type FullEntry, type RefEntry, SearchMode} from '$lib/js/dictionary';
    import {Persist} from '$lib/js/persist.svelte';
    import WordList from '$lib/components/dictionary/WordList.svelte';


    interface Props {
        dict: Dictionary
        CustomSearchHandler(needle: string): Entry[] | null
        NormaliseForSearch(value: string, mode: SearchMode): string
        lang_code: string
        search_example: string
    }

    let {
        dict,
        CustomSearchHandler,
        NormaliseForSearch,
        lang_code,
        search_example
    }: Props = $props()

    type SearchPair = [string, Entry[]]
    class Search {
        readonly #entry_list: SearchPair[] = []
        constructor(entries: FullEntry[], key: 'def-search' | 'hw-search', refs: RefEntry[] = []) {
            const map = new Map<string, Set<Entry>>()

            // Add entries.
            for (const entry of entries) {
                for (const def of entry[key].split(' ')) {
                    if (map.has(def)) map.get(def)!!.add(entry)
                    else map.set(def, new Set<Entry>().add(entry))
                }
            }

            // Add reference entries.
            for (const ref of refs) {
                if (map.has(ref['from-search'])) map.get(ref['from-search'])!!.add(ref)
                else map.set(ref['from-search'], new Set<Entry>().add(ref))
            }

            // Flatten to arrays and sort since the operation we need is finding
            // words that start with the search term.
            const flattened = Array.from(map.entries().map(([k, v]) => [k, Array.from(v)])) as SearchPair[]
            flattened.sort((a, b) => a[0].localeCompare(b[0]))
            this.#entry_list = flattened
        }

        search(input: string): Entry[] {
            if (input.length === 0) return dict.entries
            const matches = new Set<Entry>()
            for (const entry of this.#entry_list)
                if (entry[0].startsWith(input))
                    for (const e of entry[1])
                        matches.add(e)
            return [...matches]
        }
    }

    // Search input.
    let search_value: string = $state('')
    let search_mode = Persist(`${lang_code}-dict-search-mode`, SearchMode.Definition, true)
    const search = {
        [SearchMode.Headword]: new Search(dict.entries, 'hw-search', dict.refs),
        [SearchMode.Definition]: new Search(dict.entries, 'def-search')
    }

    // Headword search.
    let entries = $derived.by(() => {
        let custom = CustomSearchHandler(search_value)
        if (custom) return custom
        return search[search_mode.value].search(NormaliseForSearch(search_value, search_mode.value))
    })
</script>

<section id="search-section">
    <div id="search">
        <label>Search: </label>
        <input id="search-input" type="text" placeholder="e.g. {search_example}" bind:value={search_value}>
        <label>By: </label>
        <select id="search-mode" bind:value={search_mode.value}>
            {#each Object.keys(SearchMode) as mode}
                <option value="{mode}" selected>{mode}</option>
            {/each}
        </select>
    </div>
    <p>
        Click on the first line of an entry to expand or collapse it, and click on a reference entry
        to view the referenced word.
    </p>
    <WordList entries={entries} bind:search_value />
    <div id="last"></div>
</section>

<style lang="scss">
    @use '$lib/css/dictionary' as *;

    :global(.uf-font) {
        font-family: CharisSIL, serif;
    }

    :global(f-w) {
        @include word-format;
    }

    :global(f-s) {
        @include small-caps;
    }

    :global(f-pf) {
        @include serif-font;
        font-style: italic;
        &::before {
            content: "pf ";
            @include small-caps
        }
    }

    :global(f-sense) {
        &::before {
            content: "sense ";
        }
    }

    :global(f-mut) {
        color: var(--accentcolour);
    }

    #last {
        border-top: $border;
    }

    #search {
        margin-bottom: 1rem;
        height: 2.5rem;

        #search-input { margin-right: 2rem; }

        input {
            @include word-format;
            height: 100%;
            border: $border;
        }

        select {
            @include sans-font;
            font-size: var(--text-large);
            height: 100%;
            border: $border;
            background: none;
        }

        input, select {
            box-sizing: border-box;
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
        }
    }

    #search-section {
        min-height: 100vh;
    }
</style>
