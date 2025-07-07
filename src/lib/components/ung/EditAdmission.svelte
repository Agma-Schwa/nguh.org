<script lang='ts'>
    import {enhance} from '$app/forms';
    import type {AdmissionFormRequestBody} from '$lib/js/ung_types';

    interface Props {
        on_submit(data: AdmissionFormRequestBody, form: HTMLFormElement): void
        data: AdmissionFormRequestBody
    }

    let { on_submit, data = $bindable() }: Props = $props();
    let claim_url_valid = $derived(URL.canParse(data.claim_url))

    async function OnSubmit({ cancel, formElement }: { cancel: () => void, formElement: HTMLFormElement }) {
        cancel()
        if (!formElement.reportValidity()) return
        on_submit(data, formElement)
    }
</script>

<section>
    <form method='POST' use:enhance={OnSubmit}>
        <label>Country Name*</label>
        <input type='text' minlength='1' maxlength='200' required bind:value={data.name}>

        <label>Ruler Name</label>
        <input
            type='text'
            maxlength='200'
            bind:value={data.ruler}
        >

        <label>Banner Description</label>
        <input
            type='text'
            maxlength='1000'
            placeholder='Leave this empty if you don’t know proper heraldic language'
            bind:value={data.banner_text}
        >

        <label>Banner URL</label>
        <input type='url' maxlength='6000' bind:value={data.banner_url} placeholder='Enter Banner URL here...'>
        {#if URL.canParse(data.banner_url)}
            <div class='flex justify-center mt-8'>
                <img src={data.banner_url} alt='Map Image' class='w-20 non-previewable-icon' />
            </div>
        {/if}

        <label>Claim Description{claim_url_valid ? '' : '*'}</label>
        <textarea
            placeholder="Describe your claim here. You can leave this empty if you provide an image below."
            class='min-h-40'
            minlength='1'
            maxlength='6000'
            bind:value={data.claim_text}
            required={!claim_url_valid}
        > </textarea>

        <label>Claim Image</label>
        <input type='url' maxlength='6000' bind:value={data.claim_url} placeholder='Enter Image URL here...'>
        {#if claim_url_valid}
            <div class='flex justify-center mt-8'>
                <div class='w-1/2 min-w-5 min-h-5' style='border: var(--ridge-border);'>
                    <img src={data.claim_url} alt='Map Image' class='w-full non-previewable-icon' />
                </div>
            </div>
        {/if}

        <label>Additional Info</label>
        <textarea
            placeholder="You can put additional notes relevant to the admission process or also just trivia about your country here."
            class='min-h-40'
            minlength='1'
            maxlength='6000'
            bind:value={data.trivia}
        > </textarea>

        <div class='flex justify-center mt-6 -mb-8'>
            <input type='submit' value='Submit' class='w-32' />
        </div>
    </form>
</section>

<style lang='scss'>
    label { user-select: none; }
</style>
