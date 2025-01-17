<script lang="ts">
    import type {Tribute} from "$lib/js/hgs";
    import Message from "$lib/components/hgs/Message.svelte";
    import TributeImage from "$lib/components/hgs/TributeImage.svelte";

    interface Props {
        tribute: Tribute
    }

    let {tribute}: Props = $props();
</script>

<div class="flex flex-col items-center">
    <TributeImage {tribute} />
    <Message parts={[tribute.name]}/>
    <p class="mt-1">Kills: {tribute.kills}</p>
    <p class="mt-1">
        {#if tribute.died_in_round !== undefined}
            Died: Round {tribute.died_in_round.index}
        {:else}
            <span class="tribute-winner">⭐Winner⭐</span>
        {/if}
    </p>
</div>

<style lang="scss">
    .tribute-winner {
        color: var(--accentlight);
        font-variant: small-caps;
        font-weight: bold;
    }
</style>
