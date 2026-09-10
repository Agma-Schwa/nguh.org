<script lang="ts">
    import {page} from "$app/state";
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import SvelteMarkdown, { type MarkedExtension } from "@humanspeak/svelte-markdown";
    import {
        markedFootnote,
        markedAlert,
        FootnoteRef,
        FootnoteSection,
        AlertRenderer,
    } from '@humanspeak/svelte-markdown/extensions'

    const renderers : any = {
        alert: AlertRenderer,
        footnoteRef: FootnoteRef,
        footnoteSection: FootnoteSection
    }

    // Extension for simplifying <details>
    const detailsExtension: MarkedExtension = {
        extensions: [{
            name: 'details',
            level: 'block',
            start(src: string) {
                return src.indexOf(':::details')
            },
            tokenizer(src: string) {
                const match = /^:::details\s+([^\n]+)\n([\s\S]*?)\n:::\s*(?:\n|$)/.exec(src)
                if (!match) return
                return {
                    type: 'details',
                    raw: match[0],
                    title: match[1].trim(),
                    text: match[2].trim()
                }
            }
        }]
    }

    const toc = $derived(page.data.rules
        .split('\n')
        .filter(line => /^#{3}\s+/.test(line))
        .map(line => {
            const text = line.replace(/^#{3}\s+/, '')
            const id = text
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
            return { text, id }
        })
    )

    const CIRCUS_NUMBER = "5";
    const text = $derived(
        page.data.rules
            .replaceAll("&nbsp;", "\u00a0")
            .replaceAll("%N", CIRCUS_NUMBER)
    )
</script>


<Page name="CCC Rules"/>
<Stripe>Cursed Conlang Circus Rules</Stripe>

<section>
    <h3> Contents </h3>
    <ol>
        {#each toc as item}
            <li>
                <a href={`#${item.id}`}>{item.text}</a><br />
            </li>
        {/each}
    </ol>
</section>

<section id="container">
    <SvelteMarkdown
        source={text}
        options={{headerIds: true}}
        extensions={[markedFootnote(), markedAlert(), detailsExtension]} {renderers}
    >
    {#snippet alert(props)}
        <div class="border-2 border-(--accentcolour) bg-(--accentlighter) mb-2">
            {#if props.alertType == "important"}
                <p class="bg-(--accentlight)  p-2">
                    <strong>
                        ⚠️ I M P O R T A N T ⚠️
                    </strong>
                </p>
            {/if}
            <p class="p-2 pt-0">
                <SvelteMarkdown source={props.text}/>
            </p>
        </div>
    {/snippet}
    {#snippet details(props)}
        <details>
            <summary>
                {props.title}
            </summary>
            <p>
                <SvelteMarkdown source={props.text} />
            </p>
        </details>
    {/snippet}
    </SvelteMarkdown>
</section>

<style lang="scss">
    :global(h3) {
        counter-set: h4 0;
        scroll-margin-top: var(--header-height);
        font-size: 24pt !important;
        margin-top: 1rem !important;
        text-align: left;
    }

    :global(h4) {
        font-size: 18pt !important;
        margin-top: 1rem !important;
        text-align: left !important;
    }

    :global(ol) {
        list-style: number;
        padding-left: 3rem;
        margin-block: 1rem;
    }

    :global(a:hover) {
        text-decoration: underline;
    }

    #container {
        counter-reset: h3 h4;

        :global(ul) {
            padding-left: 3rem;
            margin-block: 1rem;
        }

        :global(h3::before) {
            counter-increment: h3;
            content: counter(h3) ". ";
        }

        :global(h4::before) {
            counter-increment: h4;
            content: counter(h3) "." counter(h4) ". ";
        }

        :global(blockquote) {
            font-style: italic;
            padding-inline: 2rem;
            margin-bottom: 1rem;
        }

        :global(details) {
            padding: .25rem;

            :global(summary) {
                font-size: 16pt;
                color: var(--accentcolour);
                font-weight: bold;
                cursor: pointer;
            }

            &::details-content {
                interpolate-size: allow-keywords;
                block-size: 0;
                overflow: clip;
                transition:
                    block-size 200ms ease,
                    content-visibility 200ms ease allow-discrete;
            }
        }

        :global(details[open]) {
            &::details-content {
                border-top: 1px solid var(--accentcolour);
                block-size: auto;
            }
        }
    }

    :global(.footnotes) {
        margin-top: 2rem;
        padding-inline: 0;
        padding-top: .25rem;
        border-top: 1px solid var(--accentcolour);

        :global(ol) {
            list-style: number;
            padding-left: 0 !important;
            margin-block: 0 !important;
        }
    }
</style>
