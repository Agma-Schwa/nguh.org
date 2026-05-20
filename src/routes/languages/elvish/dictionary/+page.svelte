<script lang="ts">
    import Page from '$lib/components/Page.svelte';
    import type {PageProps} from './$types';
    import Dictionary from '$lib/components/dictionary/Dictionary.svelte';
    import {ParseDictionary} from '$lib/js/dictionary';

    let { data }: PageProps = $props();
    const generator = $derived(await ParseDictionary(data.dict))
</script>

<Page name="Elvish Dictionary" banner={false} />
<Dictionary
    CustomSearchHandler={() => null}
    dict={generator}
    lang_code={'el'}
    search_example={'sánshų́'}
/>