<script lang="ts">
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import WordList from "$lib/components/dictionary/WordList.svelte";
    import type {FullEntry} from "$lib/js/dictionary";
    import type {PageProps} from './$types';
    import {browser} from '$app/environment';
    import {Persist} from '$lib/js/utils';

    enum SearchMode {
        Headword = "Headword",
        Definition = "Definition",
    }

    // This MUST mirror NormaliseForSearch() as defined in the ULTRAFRENCHER.
    function NormaliseForSearch(value: string): string {
        let needle = value
            .toLowerCase()
            .normalize("NFKD")
            .replaceAll(/[^a-zA-ZłŁ ]/g, "")

        // Additional transformations that only apply to the needle and
        // only if it is an UF word:
        //
        // Convert from Early Modern UF spelling to modern spelling.
        if (search_mode == SearchMode.Headword) {
            needle = needle.replaceAll('ph', 'bh');
            needle = needle.replaceAll('p', 'b');
            needle = needle.replaceAll(/t(?!’)/g, 'd');
        }
        return needle
    }

    type SearchPair = [string, FullEntry[]]
    class Search {
        readonly #entry_list: SearchPair[] = []
        constructor(entries: FullEntry[], key: 'def-search' | 'hw-search') {
            const map = new Map<string, Set<FullEntry>>()
            for (const entry of entries) {
                for (const def of entry[key].split(' ')) {
                    if (map.has(def)) map.get(def)!!.add(entry)
                    else map.set(def, new Set<FullEntry>().add(entry))
                }
            }

            // Flatten to arrays and sort since the operation we need is finding
            // words that start with the search term.
            const flattened = Array.from(map.entries().map(([k, v]) => [k, Array.from(v)])) as SearchPair[]
            flattened.sort((a, b) => a[0].localeCompare(b[0]))
            this.#entry_list = flattened
        }

        search(input: string): FullEntry[] {
            if (input.length === 0) return data.dict.entries
            const matches = new Set<FullEntry>()
            for (const entry of this.#entry_list)
                if (entry[0].startsWith(input))
                    for (const e of entry[1])
                        matches.add(e)
            return [...matches]
        }
    }

    const SearchModeKey = 'uf-dict-search-mode'

    // Search input.
    let search_value: string = $state('')
    let search_mode: SearchMode = $state(Persist(SearchModeKey, SearchMode.Definition))
    let { data }: PageProps = $props()
    let search = {
        [SearchMode.Headword]: new Search(data.dict.entries, 'hw-search'),
        [SearchMode.Definition]: new Search(data.dict.entries, 'def-search')
    }

    $effect(() => localStorage.setItem(SearchModeKey, search_mode))

    // Headword search.
    let entries = $derived(search[search_mode].search(NormaliseForSearch(search_value)))
</script>

<Page name="ULTRAFRENCH Dictionary" />
<Stripe>Dictionary</Stripe>

<section id="search-section">
    <div id="search">
        <label>Search: </label>
        <input id="search-input" type="text" placeholder="e.g. ad’hór" bind:value={search_value}>
        <label>By: </label>
        <select id="search-mode" bind:value={search_mode}>
            {#each Object.keys(SearchMode) as mode}
                <option value="{mode}" selected>{mode}</option>
            {/each}
        </select>
    </div>
    <p>Click on the first line of an entry to expand or collapse it.</p>
    <WordList entries={entries} />
    <div id="last"></div>
</section>

<!--
TODO:
    - Improve search.
    - ~~'+\s{' -> '\s{+'; generally, include surrounding punctuation in \s{}.~~ Actually, scratch that,
      it’s more readable if the + is black.
    - Decrease font size for small caps by 1 at the default zoom level (i.e. no media query)?
    - 'archaic' -> '(archaic)' everywhere in the definition field only. ‘archaic’ is not a part of speech
      so it should never be in the POS field.

    - Ignore '’' entirely in search.

    - Actually address all the warnings and depenency bot issues.
-->

<style lang="scss">
    @use '$lib/css/dictionary' as *;

    :global(.uf-font) {
        font-family: CharisSIL, serif;
    }

    :global(uf-w) {
        @include word-format;
    }

    :global(uf-s) {
        @include small-caps;
    }

    :global(uf-pf) {
        @include serif-font;
        font-style: italic;
        &::before {
            content: "pf ";
            @include small-caps
        }
    }

    :global(uf-sense) {
        &::before {
            content: "sense ";
        }
    }

    :global(uf-mut) {
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
