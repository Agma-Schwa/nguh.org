<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import type {Admission} from '$lib/js/ung_types';
    import {page} from '$app/state';
    import NationCard from '$lib/components/ung/NationCard.svelte';
    import {MarkdownInstance} from '$lib/js/uŋ.svelte.js';

    let admissions: Admission[] = $derived(page.data.admissions)
</script>

<Page name='UŊ' />
<Stripe>Open Admissions</Stripe>
<section>
    {#each admissions as admission}
        <div class='grid gap-8' style='grid-template-columns: auto 1fr'>
            <a href='/ung/admission/{admission.id}'>
                <NationCard nation={admission} member={admission.author} />
            </a>
            <p class='leading-10 overflow-x-hidden text-nowrap text-ellipsis'>
                {@html MarkdownInstance.renderInline(admission.trivia)}
            </p>
        </div>
    {/each}
</section>