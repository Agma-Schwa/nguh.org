<script lang='ts'>
    interface Props {
        enabled: boolean,
        onclick: () => void
    }

    let { enabled, onclick }: Props = $props()

</script>

<button
    class='w-8 h-8 p-0 !bg-transparent { enabled ? "hover:invert transition-[filter]" : "grayscale" }'
    {onclick}
    disabled={!enabled}>
    ❌
</button>