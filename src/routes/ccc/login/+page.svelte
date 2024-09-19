<script lang="ts">
    import {page} from "$app/stores";
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import {signIn, signOut} from '@auth/sveltekit/client';

    function LogIn() {
        signIn('google', {callbackUrl: '/ccc/vote'})
    }

    function LogOut() {
        signOut()
    }
</script>

<style lang="scss">
    .button-wrapper {
        display: flex;
        button { margin: 0 auto; }
    }
</style>

<Page name="{$page.data.session ? 'Logout' : 'Login'}"/>
<Stripe>Cursed Conlang Circus</Stripe>
<section>
    {#if $page.data.session}
        <p>Are you sure you want to log out?</p>
        <div class="button-wrapper">
            <button on:click={LogOut}>
                Log out
            </button>
        </div>
    {:else}
        <p>
        You need to sign in with Google in order to vote for the CCC. This is so we can deduplicate
        submissions and make sure we don’t get trolls who vote 10000 times.
        </p>

        <p>
        We only store your email address alongside your votes and only for the duration of the CCC.
        </p>

        <p>
        If you have questions, please contact Ætérnal on the Agma Schwa Discord server.
        </p>

        <div class="button-wrapper">
            <button on:click={LogIn}>
                Log in with Google
            </button>
        </div>
    {/if}
</section>