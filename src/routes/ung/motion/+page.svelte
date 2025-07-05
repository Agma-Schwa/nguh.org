<script>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import {Persist} from '$lib/js/persist.svelte';
    import EditMotion from '$lib/components/ung/EditMotion.svelte';

    let type = Persist('ung.motion.form.type', 'none')
    let title = Persist('ung.motion.form.title', '')
    let text = Persist('ung.motion.form.text', '')
</script>

<Page name='UŊ' />
<Stripe>Submit a Motion</Stripe>
<EditMotion
    bind:type={type.value}
    bind:title={title.value}
    bind:text={text.value}
/>