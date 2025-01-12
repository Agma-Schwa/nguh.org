<script lang="ts">
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import SingleFileDialog from "$lib/components/dialog/SingleFileDialog.svelte";

    let test: SingleFileDialog
    $effect(() => { test.open() });
</script>

<Page name="Test"  />
<Stripe>Test</Stripe>
<section>
    <div>Before Dialog</div>
    <SingleFileDialog title="Test Dialog" description="Foobar" bind:this={test} />
    <div>After Dialog</div>
</section>
