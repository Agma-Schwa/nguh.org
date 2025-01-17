<script lang="ts">
    import type {Tribute} from "$lib/js/hgs";

    interface Props {
        tribute: Tribute,
        grey_if_dead?: boolean
    }

    let {tribute, grey_if_dead = false}: Props = $props();
</script>

<div class="tribute-image image-wrapper ml-0 mr-0">
    <img
        alt="{tribute.raw_name}"
        class="{grey_if_dead && tribute.died_in_round !== undefined ? 'grayscale' : ''}"
        src="{tribute.image_src}"
    >
</div>