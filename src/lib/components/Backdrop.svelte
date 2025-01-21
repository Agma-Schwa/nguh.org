<script lang="ts">
    import {afterNavigate} from "$app/navigation";
    import {browser} from "$app/environment";
    import {onDestroy, onMount} from "svelte";

    interface Props {
        image: string;
        transparent?: boolean;
    }

    let { image, transparent = false }: Props = $props();
    let div: HTMLDivElement
    $effect(() => { div.style.background = `url('${image}'` })
</script>

<div bind:this={div} class="backdrop"></div>

<style lang="scss">
    .backdrop {
        z-index: -10000;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        filter: blur(1rem);
    }
</style>