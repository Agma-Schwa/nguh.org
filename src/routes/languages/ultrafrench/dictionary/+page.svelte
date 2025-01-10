<script lang="ts">
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";

    interface Sense {
        def: string,
        examples?: string[]
    }

    interface FullEntry {
        word: string,
        pos: string,
        etym?: string,
        def?: string,
        forms?: string,
        senses?: Sense[],
    }

    interface RefEntry {
        from: string,
        to: string,
    }

    interface Dictionary {
        entries: FullEntry[],
        refs: RefEntry[]
    }

    function Truncate(s: string): string {
        return s.length > 100 ? s.slice(0, 75) + "…" : s;
    }

    let dict_promise = fetch("/DICTIONARY.json").then((r) => r.json()) as Promise<Dictionary>;
</script>

<style lang="scss">
    $border: 1px solid black;

    :global(uf-w) {
        font-family: "Minion 3 Semibold", "Charis SIL", serif;
        font-weight: bold;
        font-size: 1.4rem;
        line-height: 1.4rem;
        font-style: normal;
        color: var(--accentdarker);
    }

    :global(uf-s) {
        font-variant: small-caps;
        color: var(--accentcolour);
    }

    :global(uf-pf) {
        &::before {
            content: "pf ";
            font-variant: small-caps;
            color: var(--accentcolour);
        }
    }

    :global(uf-sense) {
        &::before {
            content: "sense&nbsp;";
        }
    }

    :global(uf-mut) {
        color: var(--accentcolour);
    }

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

    #last {
        border-top: $border;
    }
</style>

<Page name="ULTRAFRENCH Dictionary" />
<Stripe>Dictionary</Stripe>
<section>
    {#await dict_promise}
    {:then data}
        {#each data.entries as entry}
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
        <div id="last"></div>
    {:catch error}
        <p>Error loading dictionary: {error}. Are you connected to the internet?</p>
    {/await}
</section>
