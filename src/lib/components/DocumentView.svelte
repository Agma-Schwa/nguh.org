<script lang="ts">
    interface Props {
        src: string;
        name: string;
        title?: string;
        sandbox?: string;
        id?: string;
        frameId?: string;
        selectable?: boolean;
    }

    let { src, name, title = 'Document', sandbox, id, frameId, selectable = false }: Props = $props();
    let selected = $state(false);
</script>

<div class="my-8">
    <div class="flex overflow-hidden border border-(--accentcolour) bg-(--accentlighter)">
        <button
            type="button"
            class={['cursor-pointer border-0 p-4! text-[1.5rem]! transition-[background-color,color] duration-500',
                'hover:bg-(--accentcolour)! hover:text-white!',
                selected ? 'bg-(--accentcolour)! text-white!' : 'bg-(--accentlighter)!']}
            onclick={selectable ? () => selected = true : undefined}
        >
            {name}
        </button>
    </div>
    <div {id} class="relative flex items-center justify-center border border-(--accentcolour)">
        <iframe id={frameId} class="mx-auto h-[60rem] w-full border-0" {src} {title} {sandbox} allowfullscreen={sandbox !== undefined}></iframe>
    </div>
</div>
