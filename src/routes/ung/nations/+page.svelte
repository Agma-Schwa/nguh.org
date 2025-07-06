<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import {page} from '$app/state';
    import type {Nation} from '$lib/js/ung_types';
    import NationCard from '$lib/components/ung/NationCard.svelte';

    let nations: Nation[] = $derived(page.data.nations)

</script>

<Page name='UŊ'></Page>
<Stripe>Ŋations</Stripe>
<section>
    <div class='flex flex-col gap-4'>
        {#each nations as nation}
            <NationCard {nation} links={true} />
        {/each}
    </div>
</section>