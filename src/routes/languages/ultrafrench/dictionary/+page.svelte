<script lang="ts">
    import {page} from "$app/stores";
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import {onMount} from "svelte";
    import WordList from "$lib/components/dictionary/WordList.svelte";
    import Fuse from "fuse.js";
    import type {FullEntry} from "$lib/js/dictionary";

    const enum SearchMode {
        Headword = "Headword",
        Definition = "Definition",
    }

    // This MUST mirror NormaliseForSearch() as defined in the ULTRAFRENCHER.
    function NormaliseForSearch(value: string): string {
        let needle = value
            .toLowerCase()
            .normalize("NFKD")
            .replaceAll(/[^a-zA-ZłŁ’\- ]/g, "")

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

    function MakeFuse(key: string): Fuse {
        return new Fuse(
            $page.data.dict.entries, {
                keys: [key]
            }
        )
    }

    // Search input.
    let search_value: string = ''
    let search_mode: string = SearchMode.Headword

    // Create the fuses.
    let fuses = new Map<string, Fuse<FullEntry>>()
    onMount(() => {
        fuses.set(SearchMode.Headword, MakeFuse('hw-search'))
        fuses.set(SearchMode.Definition, MakeFuse('def-search'))
    })

    // Headword search.
    $: entries = search_value.length === 0 ?
        $page.data.dict.entries :
        fuses.get(search_mode).search(NormaliseForSearch(search_value)).map(r => r.item)
</script>

<Page name="ULTRAFRENCH Dictionary" />
<Stripe>Dictionary</Stripe>

<section id="search-section">
    <div id="search">
        <label for="search-input">Search: </label>
        <input id="search-input" type="text" placeholder="e.g. ad’hór" bind:value={search_value}>
        <label for="search-mode">By: </label>
        <select id="search-mode" bind:value={search_mode}>
            {#each Object.keys(SearchMode) as mode}
                <option value="{mode}" selected>{mode}</option>
            {/each}
        </select>
    </div>
    <WordList entries={entries} />
    <div id="last"></div>
</section>

<style lang="scss">
    $border: 1px solid black;

    @mixin word-font {
        font-family: "Minion 3 Semibold", "Charis SIL", serif;
        font-weight: bold;
        font-size: 1.4rem;
        line-height: 1.4rem;
        font-style: normal;
        color: var(--accentdarker);
    }

    :global(uf-w) {
        @include word-font;
    }

    :global(uf-s) {
        font-variant: small-caps;
        color: var(--accentcolour);
    }

    :global(uf-pf) {
        font-style: italic;
        &::before {
            content: "pf ";
            font-variant: small-caps;
            font-style: normal;
            color: var(--accentcolour);
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
            @include word-font;
            height: 100%;
            border: $border;
        }

        select {
            font-size: 1.4rem;
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
