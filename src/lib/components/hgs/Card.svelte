<script lang="ts">
    import type {FormattedMessage, Tribute} from "$lib/js/hgs.svelte";
    import Message from "$lib/components/hgs/Message.svelte";
    import TributeImage from "$lib/components/hgs/TributeImage.svelte";

    interface Props {
        tributes: Tribute[]
        message: FormattedMessage,
        dead?: boolean
    }

    let {tributes, message, dead = false}: Props = $props();
</script>

<div class="flex flex-col justify-center mb-12">
    <div class="flex flex-wrap justify-center gap-4 mb-4">
        {#each tributes as tribute}
            <TributeImage {tribute} grey_if_dead={dead} />
        {/each}
    </div>
    <Message parts={message} />
</div>