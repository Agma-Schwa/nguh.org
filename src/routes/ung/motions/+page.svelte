<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import {page} from '$app/state';
    import type {Meeting, MemberProfile, MotionNoText} from '$lib/js/ung_types';
    import MotionList from '$lib/components/ung/MotionList.svelte';

    let motions: MotionNoText[] = $derived(page.data.motions)
    let members: MemberProfile[] = $derived(page.data.members)
    let meetings: Meeting[]  = $derived(page.data.meetings)
</script>

<Page name='UŊ' />
<Stripe>Motions</Stripe>
<section>
    <MotionList
        interactive={true}
        {motions}
        {members}
        {meetings}
    />
</section>
