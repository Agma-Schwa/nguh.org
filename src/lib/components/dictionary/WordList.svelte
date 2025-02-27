<script lang="ts">
    import type {Entry, Example} from '$lib/js/dictionary';

    interface Props {
        entries: Entry[];
        search_value: string;
    }

    let { entries, search_value = $bindable() }: Props = $props();
    function Truncate(s: string): string {
        return s.length > 100 ? s.slice(0, 75) + "…" : s;
    }
</script>

{#snippet example(ex: Example)}
<li>
    {@html ex.text}
    {#if ex.comment}
        <p>
            <em class="comment">{@html ex.comment}</em>
        </p>
    {/if}
</li>
{/snippet}

{#each entries as entry}
    {#if 'word' in entry}
        <details>
            <summary>
                <span class="headword"><uf-w>{@html entry.word}</uf-w> <em>{@html entry.pos}</em></span>
                <span class="short-def">{@html Truncate(entry?.def?.def ?? `1. ${entry?.senses?.[0].def}`)}</span>
            </summary>
            <div class="entry-content">
                {#if entry.etym}
                    <p class="etym"><strong class="strong-small">Etymology: </strong> {@html entry.etym}</p>
                {/if}
                {#if entry.forms}
                    <p class="forms"><strong class="strong-small">Forms: </strong> <em class="uf-font">{@html entry.forms}</em></p>
                {/if}
                {#if entry.ipa}
                    <p class='ipa'><strong class='strong-small'>IPA:</strong> <span class='uf-font'>/{entry.ipa}/</span></p>
                {/if}
                {#if entry.def}
                    <p>{@html entry.def.def}</p>
                    {#if entry.def.comment}
                        <em class="comment">{@html entry.def.comment}</em>
                    {/if}
                    {#if entry.def.examples}
                        <ul class="uf-dict-examples">
                            {#each entry.def.examples as ex}
                                {@render example(ex)}
                            {/each}
                        </ul>
                    {/if}
                {/if}
                {#if entry?.senses?.length}
                    <ol class='list-decimal'>
                    {#each entry.senses as sense}
                        <li>
                            <p>{@html sense.def}</p>
                            {#if sense.comment}
                                <em class="comment">{@html sense.comment}</em>
                            {/if}
                        </li>
                        {#if sense.examples?.length}
                            <ul class="uf-dict-examples">
                            {#each sense.examples as ex}
                                {@render example(ex)}
                            {/each}
                            </ul>
                        {/if}
                    {/each}
                    </ol>
                {/if}
            </div>
        </details>
    {:else if 'from' in entry}
        <div class='refentry cursor-pointer' onclick={() => search_value = entry.to}>
            <span class="headword"><uf-w>{@html entry.from}</uf-w> → <uf-w>{@html entry.to}</uf-w></span>
        </div>
    {/if}
{/each}

<style lang="scss">
    @use "$lib/css/dictionary" as *;
    @use "$lib/css/_vars" as vars;

    strong {
        color: var(--accentdarker);
    }

    em:not(.comment) {
        @include serif-font;
    }

    p {
        margin: 0;
    }

    ol {
        padding-inline-start: 1.25rem;
        margin-bottom: 0;
    }

    ul {
        margin-bottom: 3pt;
    }

    li {
        margin-top: 0;
    }

    details, .refentry {
        border: $border;
        border-bottom-style: none;
        @include sans-font;
        line-height: 1.75rem;
    }

    .entry-content, .refentry {
        padding: 3pt;
    }

    details {
        &[open] { .short-def { display: none; } }
        &:not([open]) { cursor: pointer; }
    }

    summary {
        padding: 3pt;
        &::marker { content: '' }
    }

    .entry-content {
        border-top: $border;
    }

    .headword {
        display: inline-block;
        min-width: 33%;
    }

    .etym, .forms {
        font-size: var(--text-small); // Make this smaller since it’s less important information.
    }

    .strong-small {
        font-weight: 600;
    }

    .uf-dict-examples {
        padding-left: 2.5rem;
    }
</style>