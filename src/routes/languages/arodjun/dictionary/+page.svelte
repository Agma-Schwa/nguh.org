<script lang="ts">
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import type {PageProps} from './$types';
    import Dictionary from '$lib/components/dictionary/Dictionary.svelte';
    import {SearchMode} from '$lib/js/dictionary';

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
</script>

<Page name="Arodjun Dictionary" />
<Stripe>Dictionary</Stripe>
<section>
    <p class='text-center italic mb-6 -mt-4'>
        (Note: IPA transcriptions for Arodjun words are currently WIP)
    </p>
</section>
<Dictionary {NormaliseForSearch} {dict} lang_code={'ar'} />