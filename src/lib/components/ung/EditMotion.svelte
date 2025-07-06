<script lang='ts'>
    import { enhance } from '$app/forms';
    import {TYPE_CONST} from '$lib/js/uŋ.svelte';

    interface Props {
        on_done: () => void
        type: string,
        title: string,
        text: string,
    }

    let {
        on_done = () => {},
        type = $bindable(),
        title = $bindable(),
        text = $bindable(),
    } = $props()

    function OnSubmit() {
        return async ({ update }: { update: any }) => {
            on_done();
            update();
        }
    }
</script>

<section>
    <form method='POST' use:enhance={OnSubmit}>
        <label>Type</label>
        <select bind:value={type} name='type'>
            <option value='none'>Unsure</option>
            <option value='leg'>Legislative</option>
            <option value={TYPE_CONST}>Constitutional</option>
            <option value='exec'>Executive</option>
        </select>

        <label class='w-full flex gap-4'>Title</label>
        <input type="text" name="title" class='basis-full' bind:value={title} />

        <label>Text</label>
        <textarea name="text" bind:value={text}></textarea>

        <input type='submit' value='Submit Motion' class='!w-40 m-auto' />
    </form>
</section>