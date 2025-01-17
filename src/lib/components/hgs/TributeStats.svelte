<script lang="ts">
    import type {Tribute} from "$lib/js/hgs";
    import Message from "$lib/components/hgs/Message.svelte";

    interface Props {
        tribute: Tribute
    }

    let {tribute}: Props = $props();
</script>

<div class="tribute-stats flex-column flex-centre">
    <div class="tribute-image image-wrapper flex-row">
        <img alt="{tribute.raw_name}" class="{tribute.died_in_round !== undefined ? 'grayscale' : ''}" src="{tribute.image_src}">
    </div>
    <Message parts={[tribute.name]}/>
    <p class="tribute-stats-kills">Kills: {tribute.kills}</p>
    <p class="tribute-stats-died">
        {#if tribute.died_in_round !== undefined}
            Died: Round {tribute.died_in_round.index}
        {:else}
            <span class="tribute-winner">⭐Winner⭐</span>
        {/if}
    </p>
</div>
