<script lang="ts">
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import SingleFileDialog from "$lib/components/dialog/SingleFileDialog.svelte";

    let test: SingleFileDialog
    let content: HTMLElement
    $effect(() => {
        test.open()
            .then(c => content.innerHTML = (c.data as string))
            .catch(e => content.innerHTML = `CANCELLED: ${e}` )
    });
</script>

<Page name="Test"  />
<Stripe>Test</Stripe>
<section>
    <div>Before Dialog</div>
    <SingleFileDialog title="Test Dialog" description="Foobar" type={'text'} bind:this={test} />
    <div>After Dialog</div>
    <div bind:this={content}></div>
</section>
