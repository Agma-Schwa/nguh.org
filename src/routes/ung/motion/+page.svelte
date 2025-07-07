<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import {Persist} from '$lib/js/persist.svelte';
    import EditMotion from '$lib/components/ung/EditMotion.svelte';
    import type {CreateMotion} from '$lib/js/ung_types.js';
    import {UŊMakeRequest} from '$lib/js/uŋ.svelte.js';
    import {Err} from '$lib/js/dialog.svelte.js';
    import {goto} from '$app/navigation';

    let type = Persist('ung.motion.form.type', 'none')
    let title = Persist('ung.motion.form.title', '')
    let text = Persist('ung.motion.form.text', '')

    async function Create(data: CreateMotion) {
        const res = await UŊMakeRequest('motion', 'POST', data)
        switch (res.status) {
            default: Err(`Error ${res.status}: ${await res.text()}`); break;
            case 413: Err('The motion text or title is too long!'); break;
            case 200: await goto(`/ung/motion/${(await res.json()).value}`);
        }
    }
</script>

<Page name='UŊ' />
<Stripe>Submit a Motion</Stripe>
<EditMotion
    on_submit={Create}
    bind:type={type.value}
    bind:title={title.value}
    bind:text={text.value}
/>