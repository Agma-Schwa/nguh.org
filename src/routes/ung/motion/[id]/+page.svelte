<script lang='ts' module>
    import markdownit from 'markdown-it'
    const md = markdownit()
</script>

<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import Member from '$lib/components/ung/Member.svelte';
    import EditMotion from '$lib/components/ung/EditMotion.svelte';
    import {page} from '$app/state';
    import {EnableAdminMode, UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import {invalidateAll} from '$app/navigation';
    import type {LockPageRequestBody} from '$lib/js/ung_types';
    let { data } = $props();
    let edit_mode = $state(false)
    let admin = $derived(page.data.admin && EnableAdminMode())

    function BeforeUnload(e: BeforeUnloadEvent) {
        if (edit_mode) e.preventDefault();
    }

    async function SetLock() {
        const res = await UŊMakeRequest('admin/motion/lock', 'PATCH', {
            id: data.motion.id,
            locked: !data.motion.locked,
        } satisfies LockPageRequestBody)

        if (res.ok) await invalidateAll();
        else console.error(`Failed to lock motion: ${res.status} ${await res.text()}`)
    }
</script>

<svelte:window onbeforeunload={BeforeUnload} />

<Page name='UŊ'></Page>
<Stripe>Motion #{data.motion.id}</Stripe>
<section>
    {#if edit_mode}
        <EditMotion
            on_done={() => edit_mode = false}
            type={data.motion.type}
            title={data.motion.title}
            text={data.motion.text}
        />
        <div class='flex'>
            <button class='m-auto'  onclick={() => document.location.reload()}>Cancel</button>
        </div>
    {:else}
        <h2 class='mb-8'>
            {data.motion.title}
            [<span style='font-variant: small-caps'>{data.motion.type}</span>]
            {#if data.motion.locked}
                <span>🔒</span>
            {/if}
        </h2>
        <div class='mb-8'>
            <div class='m-auto w-fit'>
                <Member member={data.author} />
            </div>
        </div>
        <div id='ung-motion-text'>
            {@html md.render(data.motion.text)}
        </div>
        {#if
            (data.motion.author === page.data.user.id && !data.motion.locked) || admin
        }
            <div class='flex mt-8 justify-center gap-10'>
                <button onclick={() => edit_mode = true}>Edit Motion</button>
                {#if admin}
                    <button onclick={SetLock}>{data.motion.locked ? 'Unlock Motion' : 'Lock Motion'}</button>
                {/if}
            </div>
        {/if}
    {/if}
</section>
