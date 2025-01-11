<script lang="ts">
    import {page} from "$app/stores";
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import {onMount} from "svelte";
    import WordList from "$lib/components/dictionary/WordList.svelte";
    import Fuse from "fuse.js";
    import type {FullEntry} from "$lib/js/dictionary";

    enum SearchMode {
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
