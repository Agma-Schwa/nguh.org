<script>
    import Page from "$lib/components/Page.svelte";
    import {page} from "$app/stores";
</script>

<Page name={$page.status} />

<h2 class="h2-no-block">{$page.error.message}</h2>

<style>
    h2 {
        font-size: 8rem;
        text-align: center;
        grid-column: 1 / span 3;
        margin-top: 3rem;
        text-transform: uppercase;
    }
</style>
