<script lang='ts'>
    import { enhance } from '$app/forms';
    import {TYPE_CONST, UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import type {CreateMotion} from '$lib/js/ung_types';
    import {clamp, Err} from '$lib/js/dialog.svelte';

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
    } = $props()

    let valid = $derived(
        LimitString(type, 1, 50) &&
        LimitString(title, 1, 500) &&
        LimitString(text, 1, 10000)
    )

    function LimitString(val: string, min: number, max: number) {
        const len = val.trim().length
        return clamp(len, min, max) == len
    }

    function OnSubmit({ cancel }: { cancel: () => void }) {
        cancel()
        on_submit({
            type,
            title: title.normalize('NFC'),
            text: text.normalize('NFC')
        })
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
        <input type="text" name="title" minlength='1' maxlength='500' class='basis-full' bind:value={title} />

        <label>Text</label>
        <textarea name="text" minlength='1' maxlength='10000' bind:value={text}></textarea>

        <input type='submit' value='Submit Motion' class='!w-40 m-auto' disabled={!valid} />
    </form>
</section>