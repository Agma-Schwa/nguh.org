<script lang="ts">
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import type {PageProps} from './$types';
    import Dictionary from '$lib/components/dictionary/Dictionary.svelte';
    import {type Entry, SearchMode} from '$lib/js/dictionary';

    function NormaliseForSearch(value: string, _: SearchMode): string {
        return value.toLowerCase()
    }

    let { data }: PageProps = $props();

    // Capitalise the first letter of the definition of each word because
    // Agma doesn’t do that in the actual dictionary.
    let dict = $derived.by(() => {
        let copy = structuredClone(data.dict)
        for (const entry of copy.entries)
            if (entry.def && entry.def.def && entry.def.def.length > 1)
                entry.def.def = entry.def.def.charAt(0).toUpperCase() + entry.def.def.slice(1)
        return copy
    })

    function CustomSearchHandler(needle: string): Entry[] | null {
        needle = needle.trim()
        if (!needle.startsWith('#') || isNaN(Number(needle.slice(1)))) return null
        let entries: Entry[] = []
        for (const entry of dict.entries)
            if (entry.etym && entry.etym.includes(`<f-s>psc ${needle}</f-s>`))
                entries.push(entry)
        return entries
    }
</script>

<Page name="Arodjun Dictionary" />
<Stripe>Dictionary</Stripe>
<Dictionary
    {CustomSearchHandler}
    {NormaliseForSearch}
    {dict}
    lang_code={'ar'}
    search_example={'pjecijau'}
/>