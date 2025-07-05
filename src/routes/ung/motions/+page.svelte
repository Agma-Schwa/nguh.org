<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import {page} from '$app/state';
    import Member from '$lib/components/ung/Member.svelte';
    import type {MemberProfile, MotionNoText} from '$lib/js/ung_types';

    let motions: MotionNoText[] = $derived(page.data.motions)
    let members: MemberProfile[] = $derived(page.data.members)
</script>

<Page name='UŊ' />
<Stripe>Motions</Stripe>
<section>
    <div class='grid gap-4 leading-8' style='grid-template-columns: auto 1fr'>
        {#each motions as motion}
            <div><Member member='{members.find(m => m.discord_id === motion.author)}' /></div>
            <a href='/ung/motion/{motion.id}'>
                <span class='{motion.closed ? "line-through text-gray-500" : ""}'>
                    {motion.title}
                    [<span style='font-variant: small-caps'>{motion.type}</span>]
                    {#if motion.locked} <span>🔒</span> {/if}
                </span>
            </a>
        {/each}

    </div>
    <table class='table-no-style'>
        <tbody>
        </tbody>
    </table>
</section>