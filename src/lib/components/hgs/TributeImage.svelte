<script lang="ts">
    import type {Tribute} from "$lib/js/hgs";

    interface Props {
        tribute: Tribute
    }

    let {tribute}: Props = $props();
</script>

<div class="tribute-image image-wrapper">
    <img
        alt="{tribute.raw_name}"
        class="{tribute.died_in_round !== undefined ? 'grayscale' : ''}"
        src="{tribute.image_src}"
    >
</div>