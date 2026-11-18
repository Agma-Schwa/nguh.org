<script lang="ts">
    import {afterNavigate} from "$app/navigation";
    import {browser} from "$app/env";
    import {onDestroy, onMount} from "svelte";

    interface Props {
        image: string;
        transparent?: boolean;
    }

    let { image, transparent = false }: Props = $props();
    let div: HTMLDivElement
    $effect(() => { div.style.background = `url('${image}'` })
</script>

<div bind:this={div} class="fixed inset-0 -z-10000 max-w-screen bg-cover bg-center bg-no-repeat blur-[1rem]"></div>
