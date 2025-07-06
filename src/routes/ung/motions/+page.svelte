<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import {page} from '$app/state';
    import type {Meeting, MemberProfile, MotionNoText} from '$lib/js/ung_types';
    import MotionList from '$lib/components/ung/MotionList.svelte';

    let motions: MotionNoText[] = $derived(page.data.motions)
    let members: MemberProfile[] = $derived(page.data.members)
    let meetings: Meeting[]  = $derived(page.data.meetings)
    let open = $derived(motions.filter(m => !m.closed))
    let closed = $derived(motions.filter(m => m.closed))
</script>

<Page name='UŊ' />
<Stripe>Motions</Stripe>
<section>
    {#if open.length !== 0}
        <h3>Open Motions</h3>
        <MotionList
            interactive={true}
            motions={open}
            {members}
            {meetings}
        />
    {/if}

    {#if closed.length !== 0}
        <h3>Closed Motions</h3>
        <MotionList
            interactive={true}
            motions={closed}
            {members}
            {meetings}
        />
    {/if}
</section>
