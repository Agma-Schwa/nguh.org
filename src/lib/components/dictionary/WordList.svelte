<script lang="ts">
    import type {FullEntry} from "$lib/js/dictionary";

    export let entries: FullEntry[]

    function Truncate(s: string): string {
        return s.length > 100 ? s.slice(0, 75) + "…" : s;
    }
</script>

{#each entries as entry}
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
            {#if entry.def}
                <p>{@html entry.def.def}</p>
                {#if entry.def.comment}
                    <p><em class="comment">{@html entry.def.comment}</em></p>
                {/if}
                {#if entry.def.examples}
                    <ul class="uf-dict-examples">
                        {#each entry.def.examples as example}
                            <li>{@html example}</li>
                        {/each}
                    </ul>
                {/if}
            {/if}
            {#if entry?.senses?.length}
                <ol>
                {#each entry.senses as sense}
                    <li>
                        <p>{@html sense.def}</p>
                        {#if sense.comment}
                            <p><em class="comment">{@html sense.comment}</em></p>
                        {/if}
                    </li>
                    {#if sense.examples?.length}
                        <ul class="uf-dict-examples">
                        {#each sense.examples as example}
                            <li>{@html example}</li>
                        {/each}
                        </ul>
                    {/if}
                {/each}
                </ol>
            {/if}
        </div>
    </details>
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
        padding-inline-start: 1.5rem;
        margin-bottom: 0;
    }

    ul {
        margin-bottom: 3pt;
    }

    li {
        margin-top: 0;
    }

    details {
        border: $border;
        border-bottom-style: none;
        @include sans-font;
        line-height: 1.75rem;

        &[open] {
            .short-def { display: none; }
        }

        &:not([open]) {
            cursor: pointer;
        }
    }

    summary {
        padding: 3pt;
        &::marker { content: '' }
    }

    .entry-content {
        padding: 3pt;
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
</style>