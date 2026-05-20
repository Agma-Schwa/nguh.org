<script lang="ts">
    import Page from '$lib/components/Page.svelte';
    import type {PageProps} from './$types';
    import Dictionary from '$lib/components/dictionary/Dictionary.svelte';
    import {type Dictionary as Dict, ParseDictionary} from '$lib/js/dictionary';
    import type {Snippet} from 'svelte';

    let { data }: PageProps = $props();
    const generator = $derived(await ParseDictionary(data.dict))
</script>

<Page name="ULTRAFRENCH Dictionary" banner={false} />

{#snippet CustomMacroHandler(node: Dict.CustomMacroNode, render_callback: Snippet<[Dict.Node]>)}
    {#if node.custom_macro.name === 'pf' && node.custom_macro.args}
        <span class='smallcaps'>pf&nbsp;</span>
        <span class='lemma'>{@render render_callback(node.custom_macro.args[0])}</span>
    {:else if node.custom_macro.name === 'L' || node.custom_macro.name === 'N'}
        <sup class='smallcaps'>{node.custom_macro.name}</sup>
    {:else}
        &lt;UNSUPPORTED CUSTOM MACRO: {node.custom_macro.name}&gt;
    {/if}
{/snippet}

<Dictionary
    CustomSearchHandler={() => null}
    {CustomMacroHandler}
    dict={generator}
    lang_code={'uf'}
    search_example={'ad’hór'}
/>

<style lang='scss'>
    @use "$lib/css/dictionary" as *;
    .smallcaps { @include small-caps; }
    .lemma { @include word-format; }
</style>