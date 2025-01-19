<script lang="ts">
    interface Props {
        src: string;
    }

    let { src }: Props = $props();
</script>

<div class="iframe-wrapper relative mb-4 mx-auto aspect-video">
    <iframe class="yt-video" {src} title="YouTube video player" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
    </iframe>
</div>

<style lang="scss">
    .yt-video {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
    }
</style>