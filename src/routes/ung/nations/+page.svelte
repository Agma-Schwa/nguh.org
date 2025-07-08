<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import {page} from '$app/state';
    import type {MemberProfile, Nation} from '$lib/js/ung_types';
    import NationCard from '$lib/components/ung/NationCard.svelte';
    import Dialog from '$lib/components/dialog/Dialog.svelte';
    import {UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import {Err} from '$lib/js/dialog.svelte';
    import {invalidateAll} from '$app/navigation';

    let all: Nation[] = $derived(page.data.nations)
    let me: MemberProfile | null = $derived(page.data.me);
    let represented: Nation | undefined = $derived(all.find(n => n.id === me?.represented_nation))
    let my_nations: Nation[] = $derived(all.filter(n => page.data.my_nations.includes(n.id) && n.id != me?.represented_nation))
    let my_non_observer_nations: Nation[] = $derived(my_nations.filter(n => !n.observer))
    let other_nations: Nation[] = $derived(all.filter(n => !page.data.my_nations.includes(n.id)))
    let active = $derived(page.data.nations.filter(n => !n.observer).length)
    let select_dialog: Dialog
    let selected: string = $state('')

    function Select() {
        select_dialog.open().and(async () => {
            if (selected.length === 0) return;
            const res = await UŊMakeRequest(`me/represented/${selected}`, 'PUT')
            switch (res.status) {
                default: Err(`Unexpected Error ${res.status}: ${await res.text()}`); break;
                case 204: await invalidateAll(); break;
            }
        })
    }
</script>

<Dialog title='Select a Main Ŋation' bind:this={select_dialog}>
    {#snippet content()}
        Set what ŋation you vote for in absentia and in meetings.<br>
        This will not affect any past votes.

        <select bind:value={selected}>
            {#each my_non_observer_nations as nation}
                <option value={nation.id}>{nation.name}</option>
            {/each}
        </select>
    {/snippet}
    {#snippet controls()}
        <button onclick={() => select_dialog.resolve()}>Ok</button>
        <button onclick={() => select_dialog.reject()}>Cancel</button>
    {/snippet}
</Dialog>

<Page name='UŊ'></Page>
<Stripe>Ŋations</Stripe>
<section class=''>
    <p class='text-center'>Active Ŋations: {active}, Observer Ŋations: {page.data.nations.length - active}</p>
    {#if my_nations.length !== 0 || represented}
        <h3 class='text-left mb-4'>My Nations</h3>
        {#if my_non_observer_nations.length !== 0}
            <button class='mb-6' onclick={Select}>Set Main Ŋation</button>
        {/if}
        <div class='flex flex-col gap-4'>
            {#if represented}
                <NationCard nation={represented} links={true} starred={true} />
            {/if}
            {#each my_nations as nation}
                <NationCard {nation} links={true} />
            {/each}
        </div>
    {/if}
    {#if other_nations.length !== 0}
        <h3 class='text-left mb-4 {my_nations.length !== 0 ? "mt-20" : "" }'>Other Nations</h3>
        <div class='flex flex-col gap-4'>
            {#each other_nations as nation}
                <NationCard {nation} links={true} />
            {/each}
        </div>
    {/if}
</section>