<script lang="ts">
    import Page from '#lib/components/Page.svelte';
    import type {PageProps} from './$types';
    import Dictionary from '#lib/components/dictionary/Dictionary.svelte';
    import {type Dictionary as Dict, ParseDictionary} from '#lib/js/dictionary.js';
    import type {Snippet} from 'svelte';

    let { data }: PageProps = $props();
    const generator = $derived(await ParseDictionary(data.dict))
</script>

<Page name="Elvish Dictionary" banner={false} />

{#snippet CustomMacroHandler(node: Dict.CustomMacroNode, render_callback: Snippet<[Dict.Node]>)}
    {#if node.custom_macro.name === 'santaa' && node.custom_macro.args}
        Santaa
        <span class='text-(--accentdarker) text-(length:--text-size) [font-family:Santaa,serif]'>{@render render_callback(node.custom_macro.args[0])}</span>
    {:else}
        &lt;UNSUPPORTED CUSTOM MACRO: {node.custom_macro.name}&gt;
    {/if}
{/snippet}

<Dictionary
    CustomSearchHandler={() => null}
    {CustomMacroHandler}
    dict={generator}
    lang_code={'el'}
    search_example={'sánshų́'}
/>
