<script lang="ts">
    export let src: string
</script>

<div class="iframe-wrapper yt-video-container mgb1rem">
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

        &-container {
            position: relative;
            margin: 1rem auto;
            aspect-ratio: 16 / 9;
        }
    }
</style>