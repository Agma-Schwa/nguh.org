<script lang="ts">
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import SimpleDialog from "$lib/components/dialog/SimpleDialog.svelte";

    let test: SimpleDialog
</script>

<Page name="Test"  />
<Stripe>Test</Stripe>
<section>
    <button onclick={() => test.open()}>Reopen</button>
    <SimpleDialog bind:this={test} title="Baz">
        <p>Foobar</p>
    </SimpleDialog>
</section>
