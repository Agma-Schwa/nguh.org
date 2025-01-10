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
            <span class="short-def">{@html Truncate(entry.def ?? `1. ${entry?.senses[0].def}`)}</span>
        </summary>
        <div class="entry-content">
            {#if entry.etym}
                <p class="etym"><strong>Etymology: </strong> {@html entry.etym}</p>
            {/if}
            {#if entry.def}
                <p>{@html entry.def}</p>
            {/if}
            {#if entry?.senses?.length}
                <ol>
                {#each entry.senses as sense}
                    <li>{@html sense.def}</li>
                {/each}
                </ol>
            {/if}
        </div>
    </details>
{/each}

<style lang="scss">
    $border: 1px solid black;

    strong {
        color: var(--accentdarker);
    }

    p {
        margin: 0;
    }

    details {
        border: $border;
        border-bottom-style: none;

        &[open] {
            .short-def { display: none; }
        }

        &:not([open]) {
            cursor: pointer;
        }

        /*& + details {
            margin-top: 1rem;
        }*/
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

    .etym {
        margin-bottom: .5rem;
    }
</style>