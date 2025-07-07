<script lang='ts'>
    import {enhance} from '$app/forms';
    import type {CreateMotion, MotionType} from '$lib/js/ung_types';
    import {clamp} from '$lib/js/dialog.svelte';

    interface Props {
        on_submit: (data: CreateMotion) => void
        type: string,
        title: string,
        text: string,
    }

    let {
        on_submit = () => {},
        type = $bindable(),
        title = $bindable(),
        text = $bindable(),
    }: Props = $props()

    function OnSubmit({ cancel, formElement }: { cancel: () => void, formElement: HTMLFormElement }) {
        cancel()
        if (!formElement.reportValidity()) return
        on_submit({
            type: type as MotionType,
            title: title.normalize('NFC'),
            text: text.normalize('NFC')
        })
    }
</script>

<section>
    <form method='POST' use:enhance={OnSubmit}>
        <label>Type</label>
        <select bind:value={type} name='type' required>
            <option value='Unsure'>Unsure</option>
            <option value='Legislative'>Legislative</option>
            <option value='Executive'>Executive</option>
            <option value='Constitutional'>Constitutional</option>
        </select>

        <label class='w-full flex gap-4'>Title</label>
        <input type="text" name="title" minlength='1' maxlength='500' class='basis-full' bind:value={title} required />

        <label>Text</label>
        <textarea class='min-h-40' name="text" minlength='1' maxlength='10000' bind:value={text} required></textarea>

        <input type='submit' value='Submit Motion' class='!w-40 m-auto'/>
    </form>
</section>