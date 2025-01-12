<script lang="ts">
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import SingleFileDialog from "$lib/components/dialog/SingleFileDialog.svelte";
    import MultiFileDialog from "$lib/components/dialog/MultiFileDialog.svelte";

    let test: SingleFileDialog
    let content: HTMLElement
    $effect(Open);
    function Open() {
        test.open()
            .then(c => content.innerHTML = JSON.stringify(c.data))
            .catch(e => content.innerHTML = `CANCELLED: ${e}` )
    }
</script>

<Page name="Test"  />
<Stripe>Test</Stripe>
<section>
    <button onclick={Open}>Reopen</button>
    <SingleFileDialog title="Test Dialog" description="Foobar" type={'json'} bind:this={test} />
    <div bind:this={content}></div>
</section>
