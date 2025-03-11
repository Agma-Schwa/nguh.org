<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import {page} from '$app/state';
    import Stripe from '$lib/components/Stripe.svelte';

    console.log(page.data.session, page.data.user)
</script>

<Page name='Jeopardy' />

{#if page.data.user}
    <Stripe>Jeopardy</Stripe>
    <section>
        <p>
            Logged in as {page.data.user?.id}
        </p>
    </section>
{/if}
