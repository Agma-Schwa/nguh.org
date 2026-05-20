<script lang="ts">
    import Page from '$lib/components/Page.svelte';
    import type {PageProps} from './$types';
    import Dictionary from '$lib/components/dictionary/Dictionary.svelte';
    import {type Dictionary as Dict, IsFullEntry, ParseDictionary} from '$lib/js/dictionary';
    import type {Snippet} from 'svelte';

    let { data }: PageProps = $props();
    const generator = $derived(await ParseDictionary(data.dict))
    const dict = $derived(generator.dictionary)

    function CustomSearchHandler(needle: string): Dict.Entry[] | null {
        needle = needle.trim()
        const id = Number(needle.slice(1))
        if (!needle.startsWith('#') || isNaN(id)) return null
        let entries: Dict.Entry[] = []

        // Check if this entry contains a PSC id macro node.
        function FindPSCId(node: Dict.Node): number | null {
            if ('group' in node) {
                for (const n of node.group) {
                    const id = FindPSCId(n)
                    if (id !== null) return id
                }
            } else if ('macro' in node) {
                for (const n of node.macro.args ?? []) {
                    const id = FindPSCId(n)
                    if (id !== null) return id
                }
            } else if ('custom_macro' in node) {
                if (node.custom_macro.name === 'psc') {
                    const num = node.custom_macro.args!![0]
                    if ('text' in num) return Number(num.text)
                }
            }
            return null
        }

        for (const entry of dict.entries) {
            if (!IsFullEntry(entry) || !entry.etym) continue
            const found = FindPSCId(entry.etym)
            if (found !== null && found == id) entries.push(entry)
        }

        return entries
    }
</script>

{#snippet CustomMacroHandler(node: Dict.CustomMacroNode, render_callback: Snippet<[Dict.Node]>)}
    {#if node.custom_macro.name === 'psc' && node.custom_macro.args}
        from
        <span class='smallcaps'>psc&nbsp;#{@render render_callback(node.custom_macro.args[0])}</span>
        <span class='lemma'>{@render render_callback(node.custom_macro.args[1])}</span>
    {:else}
        &lt;UNSUPPORTED CUSTOM MACRO: {node.custom_macro.name}&gt;
    {/if}
{/snippet}

<Page name="Arodjun Dictionary" banner={false} />
<Dictionary
    {CustomSearchHandler}
    {CustomMacroHandler}
    dict={generator}
    lang_code={'ar'}
    search_example={'pjecijau'}
    capitalise={true}
/>

<style lang='scss'>
    @use "$lib/css/dictionary" as *;
    .smallcaps { @include small-caps; }
    .lemma { @include word-format; }
</style>