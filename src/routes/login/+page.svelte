<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import {page} from '$app/state';

    const logged_in = !!page.data.user;
</script>
<Page name='Sign In'>Sign In</Page>

{#if !logged_in}
    <Stripe>Login</Stripe>
    <section>
        <p>
            Press the button below to sign in with Discord.
        </p>
        <form method='POST' action='?/login'>
            <div class='inline-block'>
                <button>Sign in with Discord</button>
            </div>
        </form>
    </section>
{:else}
    <Stripe>Already Logged In</Stripe>
    <section>
        <p>
            You are currently signed in as: {page.data.user?.name}
        </p>
        <form method='POST' action='?/logout'>
            <div class='inline-block'>
                <button>Sign out</button>
            </div>
        </form>
    </section>
{/if}