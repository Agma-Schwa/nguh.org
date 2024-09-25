<script lang="ts">
    import {page} from "$app/stores";
    import Ribbon from "$lib/components/Ribbon.svelte";
</script>

<style lang="scss">
span {
    color: var(--accentlighter);
    font-weight: bold;
}

a {
    font-style: normal;
    color: var(--accentlighter);
}
</style>

{#if $page.data?.session?.user}
<Ribbon>
    Logged in as <span>{$page.data.session.user.name}</span> •
    <a href="/ccc/login">Log out</a>
</Ribbon>
{/if}

<slot/>