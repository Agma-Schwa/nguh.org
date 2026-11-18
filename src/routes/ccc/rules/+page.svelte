<script lang="ts">
    import {page} from "$app/state";
    import Page from "#lib/components/Page.svelte";
    import Stripe from "#lib/components/Stripe.svelte";
    import SvelteMarkdown, { type MarkedExtension } from "@humanspeak/svelte-markdown";
    import type { Snippet } from 'svelte';
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

    const footnoteExtension = markedFootnote()
    for (const extension of footnoteExtension.extensions ?? []) {
        if (extension.name !== 'footnoteSection' || !('tokenizer' in extension)) continue
        const tokenize = extension.tokenizer

        // Keep adjacent definitions in one list even when the source separates them with blank lines.
        extension.tokenizer = function (source, tokens) {
            const section = tokenize.call(this, source, tokens)
            if (!section) return

            let end = section.raw.length
            while (end < source.length) {
                const rest = source.slice(end)
                const definitions = rest.replace(/^(?:[ \t]*\r?\n)+/, '')
                const next = tokenize.call(this, definitions, tokens)
                if (!next) break

                end += rest.length - definitions.length + next.raw.length
                section.footnotes.push(...next.footnotes)
            }

            return { ...section, raw: source.slice(0, end) }
        }
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
                    tokens: this.lexer.blockTokens(match[2].trim(), [])
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

    async function ScrollToExpandedFragment() {
        const target = document.querySelector(':target')
        const details = target?.closest('details')
        if (!target || !details || target === details) return

        details.open = true
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

        // The browser may adjust the scroll position while the disclosure is expanding.
        const duration = parseFloat(getComputedStyle(details, '::details-content').transitionDuration)
        if (duration > 0) {
            await new Promise(resolve => setTimeout(resolve, duration * 1000))
            await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
        }

        if (target.matches(':target')) target.scrollIntoView()
    }
</script>

<svelte:window onhashchange={ScrollToExpandedFragment} />

<Page name="CCC Rules"/>
<Stripe>Cursed Conlang Circus Rules</Stripe>

<section class="toc">
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
        extensions={[footnoteExtension, markedAlert(), detailsExtension]} {renderers}
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
    {#snippet details({ title, children }: { title: string; children: Snippet })}
        <details>
            <summary>{title}</summary>
            {@render children()}
        </details>
    {/snippet}
    </SvelteMarkdown>
</section>

<style>
    #container :global(h3), .toc h3 {
        counter-set: h4 0;
        font-size: 24pt !important;
        margin-top: 1rem !important;
        text-align: left;
    }

    #container :global(h4) {
        font-size: 18pt !important;
        margin-top: 1rem !important;
        text-align: left !important;
    }

    #container :global(ol), .toc ol {
        list-style: decimal;
        padding-inline-start: clamp(1.25rem, 5vw, 3rem);
        margin-block: 1rem;
    }

    #container {
        counter-reset: h3 h4;

        :global(ul) {
            padding-inline-start: clamp(1.25rem, 5vw, 3rem);
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

                @media (max-width: 900px) {
                    font-size: var(--text-size);
                }
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

    #container :global(.footnotes) {
        margin-top: 2rem;
        padding-inline: 0;
        padding-top: .25rem;
        border-top: 1px solid var(--accentcolour);

        :global(ol) {
            list-style: decimal;
            padding-inline-start: 1.5rem;
            margin-block: 0 !important;
        }
    }
</style>
