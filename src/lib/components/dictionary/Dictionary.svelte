<script lang="ts">
    import VirtualList from '@humanspeak/svelte-virtual-list'
    import {type Dictionary, IsFullEntry, IsRefEntry, SearchMode} from '$lib/js/dictionary';
    import {Persist} from '$lib/js/persist.svelte';
    import type {Snippet} from 'svelte';

    interface Props {
        dict: Dictionary.Data
        CustomSearchHandler(needle: string): Dictionary.Entry[] | null
        NormaliseForSearch(value: string, mode: SearchMode): string
        CustomMacroHandler?: Snippet<[Dictionary.CustomMacroNode, Snippet<[Dictionary.Node]>]>
        lang_code: string
        search_example: string
        capitalise?: boolean
    }

    let {
        dict,
        CustomSearchHandler,
        NormaliseForSearch,
        CustomMacroHandler,
        lang_code,
        search_example,
        capitalise = false
    }: Props = $props()

    type SearchPair = [string, Dictionary.Entry[]]
    class Search {
        readonly #entry_list: SearchPair[] = []
        constructor(
            entries: Dictionary.Entry[],
            key: 'def_search' | 'hw_search',
            include_refs: boolean,
        ) {
            const map = new Map<string, Set<Dictionary.Entry>>()

            // Add entries.
            for (const entry of entries.filter(IsFullEntry)) {
                for (const def of entry[key]!.split(' ')) {
                    if (map.has(def)) map.get(def)!!.add(entry)
                    else map.set(def, new Set<Dictionary.Entry>().add(entry))
                }
            }

            // Add reference entries.
            if (include_refs) {
                for (const ref of entries.filter(IsRefEntry)) {
                    if (map.has(ref.search)) map.get(ref.search)!!.add(ref)
                    else map.set(ref.search, new Set<Dictionary.Entry>().add(ref))
                }
            }

            // Flatten to arrays and sort since the operation we need is finding
            // words that start with the search term.
            const flattened = Array.from(map.entries().map(([k, v]) => [k, Array.from(v)])) as SearchPair[]
            flattened.sort((a, b) => a[0].localeCompare(b[0]))
            this.#entry_list = flattened
        }

        search(input: string): Dictionary.Entry[] {
            if (input.length === 0) return dict.entries
            const matches = new Set<Dictionary.Entry>()
            for (const entry of this.#entry_list)
                if (entry[0].startsWith(input))
                    for (const e of entry[1])
                        matches.add(e)
            return [...matches]
        }
    }

    // Search input.
    let search_value: string = $state('')
    let search_mode = Persist(`${lang_code}-dict-search-mode`, SearchMode.Definition, true)
    const search = {
        [SearchMode.Headword]: new Search(dict.entries, 'hw_search', true),
        [SearchMode.Definition]: new Search(dict.entries, 'def_search', false)
    }

    // Headword search.
    let entries = $derived.by(() => {
        let custom = CustomSearchHandler(search_value)
        if (custom) return custom
        return search[search_mode.value].search(NormaliseForSearch(search_value, search_mode.value))
    })

    function RenderPlainText(entry: Dictionary.Entry, n: Dictionary.Node): string {
        function RenderAll(nodes: Dictionary.Node[] | undefined) {
            return nodes?.map(child => RenderPlainText(entry, child)).join('') ?? ''
        }

        if ('text' in n) return n.text
        if ('math' in n) return n.math
        if ('group' in n) return RenderAll(n.group)
        if ('macro' in n) switch (n.macro.name) {
            case 'ellipsis':  return '…'
            case 'paragraph_break': return '';
            case 'sense': return `sense&nbsp;${RenderAll(n.macro.args)}`
            case 'soft_hyphen': return '&shy;';
            case 'this': return RenderPlainText(entry, entry.word)
            default: return RenderAll(n.macro.args)
        }

        return '<INVALID NODE>'
    }
</script>


{#snippet Nodes(nodes: Dictionary.Node[] | undefined)}
    {#if nodes}
        {#each nodes as node}
            {@render Node(node)}
        {/each}
    {/if}
{/snippet}

{#snippet Node(node: Dictionary.Node)}
    {#if 'text' in node}
        {node.text}
    {:else if 'math' in node}
        {node.math}
    {:else if 'group' in node}
        {@render Nodes(node.group)}
    {:else if 'macro' in node}
        {#if node.macro.name === 'bold'}
            <strong>{@render Nodes(node.macro.args)}</strong>
        {:else if node.macro.name === "ellipsis"}
            &hellip;
        {:else if node.macro.name === "italic"}
            <em class='uf-font'>{@render Nodes(node.macro.args)}</em>
        {:else if node.macro.name === "lemma"}
            <span class='lemma'>{@render Nodes(node.macro.args)}</span>
        {:else if node.macro.name === "normal"}
            <span style='font-weight: normal; font-style: normal;'>
                {@render Nodes(node.macro.args)}
            </span>
        {:else if node.macro.name === "paragraph_break"}
            <br>
        {:else if node.macro.name === "sense"}
            sense&nbsp;{@render Nodes(node.macro.args)}
        {:else if node.macro.name === "small_caps"}
            <span class='smallcaps'>{@render Nodes(node.macro.args)}</span>
        {:else if node.macro.name === "subscript"}
            <sub>{@render Nodes(node.macro.args)}</sub>
        {:else if node.macro.name === "superscript"}
            <sup>{@render Nodes(node.macro.args)}</sup>
        {:else if node.macro.name === "soft_hyphen"}
            &shy;
        {:else if node.macro.name === "this"}
            <strong>~</strong>
        {:else if node.macro.name === "reference"}
            grammar
        {:else}
            &lt;UNSUPPORTED MACRO: {node.macro}&gt;
        {/if}
    {:else if 'custom_macro' in node}
        {#if CustomMacroHandler}
            {@render CustomMacroHandler(node, Node)}
        {:else}
            &lt;CUSTOM MACROS ARE NOT SUPPORTED; ADD A CUSTOM MACRO HANDLER&gt;
        {/if}
    {:else}
            &lt;UNSUPPORTED NODE: {JSON.stringify(node)}&gt;
    {/if}
{/snippet}

{#snippet NodeCapitalised(node: Dictionary.Node)}
    <span class={`${capitalise ? 'first-letter:uppercase' : ''} inline-block`}>{@render Node(node)}</span>
{/snippet}

{#snippet Examples(examples: Dictionary.Example[])}
    <ul class='pl-10'>
        {#each examples as ex}
            <li>
                {@render Node(ex.text)}
                {#if ex.comment}
                    <p>
                        <em class='comment'>{@render NodeCapitalised(ex.comment)}</em>
                    </p>
                {/if}
            </li>
        {/each}
    </ul>
{/snippet}

{#snippet renderItem(entry: Dictionary.Entry)}
    {#if IsFullEntry(entry)}
        <details class='
            open:[&_.short-def]:hidden not-open:cursor-pointer
            not-open:[&_.uf-lemma]:min-w-0
            [border-top:var(--border)]
        '>
            <summary class='p-1 marker:content-none grid grid-cols-[1fr_2fr] [&>*]:h-8 items-center whitespace-nowrap'>
                <span class='uf-font uf-lemma inline-block overflow-x-clip text-ellipsis max-w-full'>
                    <span class='lemma'>{@render Node(entry.word)}</span>
                    <em class='uf-font'>{@render Node(entry.pos)}</em>
                </span>
                <span class='
                    short-def min-w-0
                    [&_*]:overflow-x-clip [&_*]:text-ellipsis [&_*]:max-w-full
                '>
                    {#if entry.primary_definition}
                        <div>{@render NodeCapitalised(entry.primary_definition.def)}</div>
                    {:else if entry.senses?.[0].def}
                        <div class='short-def'>
                            <span>1.</span>
                            <span>{@render NodeCapitalised(entry.senses?.[0].def)}</span>
                        </div>
                    {:else}
                        MALFORMED ENTRY
                    {/if}
                </span>
            </summary>
            <div class='[border-top:var(--border)] p-1 [&>p]:!text-(size:--text-small) [&>p>strong]:font-semibold'>
                {#if entry.etym}
                    <p>
                        <strong>Etymology: </strong>
                        {@render Node(entry.etym)}
                    </p>
                {/if}
                {#if entry.forms}
                    <p>
                        <strong>Forms: </strong>
                        <em class='uf-font'>{@render Node(entry.forms)}</em>
                    </p>
                {/if}
                {#if entry.ipa}
                    <p>
                        <strong>IPA:</strong>
                        <span class='uf-font'>/{@render Node(entry.ipa)}/</span>
                    </p>
                {/if}
                {#if entry.primary_definition}
                    <p>{@render NodeCapitalised(entry.primary_definition.def)}</p>
                    {#if entry.primary_definition.comment}
                        <em class='comment'>{@render NodeCapitalised(entry.primary_definition.comment)}</em>
                    {/if}
                    {#if entry.primary_definition.examples}
                        {@render Examples(entry.primary_definition.examples)}
                    {/if}
                {/if}
                {#if entry?.senses?.length}
                    <ol class='list-decimal pl-5'>
                    {#each entry.senses as sense}
                        <li class=''>
                            <p>{@render NodeCapitalised(sense.def)}</p>
                            {#if sense.comment}
                                <em class='comment'>{@render NodeCapitalised(sense.comment)}</em>
                            {/if}
                        </li>
                        {#if sense.examples?.length}
                            {@render Examples(sense.examples)}
                        {/if}
                    {/each}
                    </ol>
                {/if}
            </div>
        </details>
    {:else if IsRefEntry(entry)}
        <div class='[border-top:var(--border)] p-1 cursor-pointer' onclick={() => search_value = RenderPlainText(entry, entry.ref)}>
            <span class='uf-font'>
                <span class='lemma'>{@render Node(entry.word)}</span> →
                <span class='lemma'>{@render Node(entry.ref)}</span>
            </span>
        </div>
    {/if}
{/snippet}

<section id="search-section" class='!mt-4 [--border:1px_solid_black]'>
    <div id="search" class='h-10 mb-2'>
        <label>Search: </label>
        <input class='mr-8' type="text" placeholder="e.g. {search_example}" bind:value={search_value}>
        <label>By: </label>
        <select id="search-mode" bind:value={search_mode.value}>
            {#each Object.keys(SearchMode) as mode}
                <option value="{mode}" selected>{mode}</option>
            {/each}
        </select>
    </div>
    <p>
        Click on the first line of an entry to expand or collapse it, and click on a reference entry
        to view the referenced word.
    </p>
    <div class='
        w-full h-[36.9rem] [border:var(--border)]
        [&_*:first-child>details]:border-t-0
        [&_*:last-child>details]:[border-bottom:var(--border)]
    '>
        <VirtualList items={entries} {renderItem} />
    </div>
</section>

<style lang="scss">
    @use '$lib/css/dictionary' as *;
    @use "$lib/css/_vars" as vars;
    details { @include sans-font; }
    .uf-font { @include serif-font; }
    .lemma { @include word-format; }
    .smallcaps { @include small-caps; }
    strong { color: var(--accentdarker); }
    p { margin: 0; }

    #search {
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
</style>
