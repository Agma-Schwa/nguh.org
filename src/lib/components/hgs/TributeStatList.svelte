<script lang="ts">
    import type {Tribute} from "$lib/js/hgs.svelte";
    import Message from "$lib/components/hgs/Message.svelte";
    import TributeImage from "$lib/components/hgs/TributeImage.svelte";

    interface Props {
        tributes: Tribute[],
        grey_if_dead?: boolean
    }

    let {tributes, grey_if_dead = false}: Props = $props();
</script>

<div class="flex flex-wrap justify-center gap-8">
    {#each tributes as tribute}
        <div class="flex flex-col items-center gap-2">
            <TributeImage {tribute} {grey_if_dead} />
            <Message parts={[tribute.name]}/>
            <p>Kills: {tribute.kills}</p>
            <p>
                {#if tribute.died_in_round !== undefined}
                    Died: Round {tribute.died_in_round.index}
                {:else}
                    <span class="tribute-winner">⭐Winner⭐</span>
                {/if}
            </p>
        </div>
    {/each}
</div>

<style lang="scss">
    p { margin: 0; }
    .tribute-winner {
        color: var(--accentlight);
        font-variant: small-caps;
        font-weight: bold;
    }
</style>
