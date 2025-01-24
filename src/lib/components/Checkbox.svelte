<script lang="ts">

    interface Props {
        checked: boolean
        children: import('svelte').Snippet
    }

    let {checked = $bindable(), children}: Props = $props()
</script>

<div class='flex gap-2'>
    <label>
        <input type='checkbox' bind:checked>
        {@render children()}
    </label>
</div>

<style lang='scss'>

</style>