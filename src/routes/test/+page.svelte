<script lang="ts">
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import SimpleDialog from "$lib/components/dialog/SimpleDialog.svelte";

    let test: SimpleDialog
    let text = 'foo'
</script>

<Page name="Test"  />
<Stripe>Test</Stripe>
<section>
    <button onclick={() => test.open().catch(() => text = 'cancelled')}>Reopen</button>
    <SimpleDialog bind:this={test} title="Baz">
        <p>Foobar</p>
    </SimpleDialog>
    <div>{text}</div>
</section>
