<script lang="ts">
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import type {PageProps} from './$types';
    import Dictionary from '$lib/components/dictionary/Dictionary.svelte';
    import {ParseDictionary, SearchMode} from '$lib/js/dictionary';

    // This MUST mirror NormaliseForSearch() as defined in the ULTRAFRENCHER.
    function NormaliseForSearch(value: string, mode: SearchMode): string {
        let needle = value
            .toLowerCase()
            .normalize("NFKD")
            .replaceAll(/[^a-zA-Z ]/g, "")
        return needle
    }

    let { data }: PageProps = $props();
    const generator = $derived(await ParseDictionary(data.dict))
    const dict = $derived(generator.dictionary)
</script>

<Page name="Elvish Dictionary" banner={false} />
<Dictionary
    CustomSearchHandler={() => null}
    {NormaliseForSearch}
    dict={dict}
    lang_code={'el'}
    search_example={'sánshų́'}
/>