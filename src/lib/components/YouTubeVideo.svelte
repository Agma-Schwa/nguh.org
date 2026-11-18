<script lang="ts">
    interface Props {
        src: string;
    }

    let { src }: Props = $props();
</script>

<div class="relative flex items-center justify-center mb-4 mx-auto aspect-video w-full min-w-0">
    <iframe class="absolute top-0 mx-auto size-full border-0" {src} title="YouTube video player" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
    </iframe>
</div>
