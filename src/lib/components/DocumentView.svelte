<script lang="ts">
    interface Props {
        src: string;
        name: string;
    }

    let { src, name }: Props = $props();
</script>

<div class="tab-wrapper">
    <div class="tab">
        <button class="tab-button">
            {name}
        </button>
    </div>
    <div class="tab-container">
        <div class="tab-content iframe-wrapper">
            <iframe class="embedded-doc" {src} title="Document"></iframe>
        </div>
    </div>
</div>
