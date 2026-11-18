<script lang="ts">
    import VirtualList from '@humanspeak/svelte-virtual-list'
    import {type Dictionary, IsFullEntry, IsRefEntry, SearchMode} from '#lib/js/dictionary.js';
    import {Persist} from '#lib/js/persist.svelte.js';
    import {untrack, type Snippet} from 'svelte';

    interface Props {
        dict: Dictionary.Generator
        CustomSearchHandler(needle: string): Dictionary.Entry[] | null
        CustomMacroHandler?: Snippet<[Dictionary.CustomMacroNode, Snippet<[Dictionary.Node]>]>
        lang_code: string
        search_example: string
        capitalise?: boolean
    }

    let {
        dict,
        CustomSearchHandler,
        CustomMacroHandler,
        lang_code,
        search_example,
        capitalise = false
    }: Props = $props()
    const data = $derived(dict.dictionary);

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
            if (input.length === 0) return data.entries
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
    let search_mode = untrack(() => Persist(`${lang_code}-dict-search-mode`, SearchMode.Definition, true))
    const search = $derived({
        [SearchMode.Headword]: new Search(data.entries, 'hw_search', true),
        [SearchMode.Definition]: new Search(data.entries, 'def_search', false)
    })

    // Headword search.
    let entries = $derived.by(() => {
        let custom = CustomSearchHandler(search_value)
        if (custom) return custom
        return search[search_mode.value].search(NormaliseForSearch(search_value, search_mode.value))
    })

    function NormaliseForSearch(needle: string, mode: SearchMode): string {
        return dict.normalise_for_search(needle, mode)
    }

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
            <em class='dictionary-serif'>{@render Nodes(node.macro.args)}</em>
        {:else if node.macro.name === "lemma"}
            <span class='dictionary-lemma'>{@render Nodes(node.macro.args)}</span>
        {:else if node.macro.name === "normal"}
            <span style='font-weight: normal; font-style: normal;'>
                {@render Nodes(node.macro.args)}
            </span>
        {:else if node.macro.name === "paragraph_break"}
            <br>
        {:else if node.macro.name === "sense"}
            sense&nbsp;{@render Nodes(node.macro.args)}
        {:else if node.macro.name === "small_caps"}
            <span class='dictionary-small-caps'>{@render Nodes(node.macro.args)}</span>
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
        <details class='dictionary-sans
            open:[&_.short-def]:hidden not-open:cursor-pointer
            not-open:[&_.uf-lemma]:min-w-0
        '>
            <summary class='p-1 marker:content-none grid items-center max-md:gap-1 max-md:py-2 md:grid-cols-[1fr_2fr] md:whitespace-nowrap md:[&>*]:h-8'>
                <span class='dictionary-serif uf-lemma inline-block overflow-x-clip text-ellipsis max-w-full'>
                    <span class='dictionary-lemma'>{@render Node(entry.word)}</span>
                    <em class='dictionary-serif'>{@render Node(entry.pos)}</em>
                </span>
                <span class='
                    short-def min-w-0
                    [&_*]:overflow-x-clip [&_*]:text-ellipsis [&_*]:max-w-full
                '>
                    {#if entry.primary_definition}
                        <span class='block'>{@render NodeCapitalised(entry.primary_definition.def)}</span>
                    {:else if entry.senses?.[0]?.def}
                        <span class='grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-1'>
                            <span>1.</span>
                            <span class={capitalise ? 'first-letter:uppercase' : undefined}>
                                {@render Node(entry.senses[0].def)}
                            </span>
                        </span>
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
                        <em class='dictionary-serif'>{@render Node(entry.forms)}</em>
                    </p>
                {/if}
                {#if entry.ipa}
                    <p>
                        <strong>IPA:</strong>
                        <span class='dictionary-serif'>/{@render Node(entry.ipa)}/</span>
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
                        <li>
                            <p class={capitalise ? 'first-letter:uppercase' : undefined}>{@render Node(sense.def)}</p>
                            {#if sense.comment}
                                <em class='comment'>{@render NodeCapitalised(sense.comment)}</em>
                            {/if}
                            {#if sense.examples?.length}
                                {@render Examples(sense.examples)}
                            {/if}
                        </li>
                    {/each}
                    </ol>
                {/if}
            </div>
        </details>
    {:else if IsRefEntry(entry)}
        <button type='button' class='block bg-transparent! p-1! text-inherit! w-full text-left cursor-pointer' onclick={() => search_value = RenderPlainText(entry, entry.ref)}>
            <span class='dictionary-serif'>
                <span class='dictionary-lemma'>{@render Node(entry.word)}</span> →
                <span class='dictionary-lemma'>{@render Node(entry.ref)}</span>
            </span>
        </button>
    {/if}
{/snippet}

<section id="search-section" class='!mt-4 [--border:1px_solid_black] [&_p]:m-0! [&_strong]:text-(--accentdarker)'>
    <div id="search" class="mb-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 md:flex">
        <label for="dictionary-search">Search: </label>
        <input id='dictionary-search' class='dictionary-lemma min-h-11 w-full min-w-0 border border-black px-2 md:mr-6 md:w-auto' type="text" placeholder="e.g. {search_example}" bind:value={search_value}>
        <label for="search-mode">By: </label>
        <select id="search-mode" class="dictionary-sans min-h-11 w-full min-w-0 border border-black bg-none px-2 md:w-auto text-(length:--text-large)" bind:value={search_mode.value}>
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
        w-full h-[clamp(16rem,60dvh,36.9rem)] md:h-[36.9rem] [border:var(--border)]
        [&_[data-svl-item]:not([data-original-index="0"])]:[border-top:var(--border)]
        [&_[data-svl-item]:last-child]:[border-bottom:var(--border)]
    '>
        <VirtualList items={entries} {renderItem} />
    </div>
</section>
