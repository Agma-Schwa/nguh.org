<script lang="ts">
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import type {PageProps} from './$types';
    import Dictionary from '$lib/components/dictionary/Dictionary.svelte';
    import {SearchMode} from '$lib/js/dictionary';

    // This MUST mirror NormaliseForSearch() as defined in the ULTRAFRENCHER.
    function NormaliseForSearch(value: string, mode: SearchMode): string {
        let needle = value
            .toLowerCase()
            .normalize("NFKD")
            .replaceAll(/[^a-zA-ZłŁ ]/g, "")

        // Additional transformations that only apply to the needle and
        // only if it is an UF word:
        //
        // Convert from Early Modern UF spelling to modern spelling.
        if (mode == SearchMode.Headword) {
            needle = needle.replaceAll('ph', 'bh');
            needle = needle.replaceAll('p', 'b');
            needle = needle.replaceAll(/t(?!’)/g, 'd');
        }
        return needle
    }

    let { data }: PageProps = $props();
</script>

<Page name="ULTRAFRENCH Dictionary" />
<Stripe>Dictionary</Stripe>
<Dictionary
    CustomSearchHandler={() => null}
    {NormaliseForSearch}
    dict={data.dict}
    lang_code={'uf'}
    search_example={'ad’hór'}
/>