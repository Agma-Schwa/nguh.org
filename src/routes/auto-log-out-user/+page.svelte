<script>
    import Stripe from '$lib/components/Stripe.svelte';
    import {onMount} from 'svelte';

    // Stupid hack. See the code for the CCC voting page.
    onMount(() => {
        window.stupid_logout_form.submit()
    })
</script>

<section>
    Please wait...
</section>

<form method='POST' action='?/logout' style='display: none !important;' id='stupid_logout_form'>
    <div class='inline-block'>
        <button>Sign in with Discord</button>
    </div>
</form>