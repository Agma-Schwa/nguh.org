<script lang='ts'>
    import type {AdmissionFormRequestBody} from '$lib/js/ung_types';
    import {form} from '$lib/js/uŋ.svelte';

    interface Props {
        on_submit(data: AdmissionFormRequestBody, form: HTMLFormElement): void,
        name: string,
        ruler: string,
        banner_text: string,
        banner_url: string,
        claim_text: string,
        claim_url: string,
        trivia: string,
    }

    let {
        on_submit,
        name = $bindable(),
        ruler = $bindable(),
        banner_text = $bindable(),
        banner_url = $bindable(),
        claim_text = $bindable(),
        claim_url = $bindable(),
        trivia = $bindable(),
    }: Props = $props();
    let claim_url_valid = $derived(URL.canParse(claim_url))

    async function OnSubmit(form: HTMLFormElement) {
        on_submit({name, ruler, banner_text, banner_url, claim_text, claim_url, trivia}, form)
    }
</script>

<section>
    <form method='POST' use:form={OnSubmit}>
        <label>Ŋation Name*</label>
        <input type='text' minlength='1' maxlength='200' required bind:value={name}>

        <label>Ruler Name</label>
        <input
            type='text'
            maxlength='200'
            bind:value={ruler}
        >

        <label>Banner Description</label>
        <input
            type='text'
            maxlength='1000'
            placeholder='Leave this empty if you don’t know proper heraldic language'
            bind:value={banner_text}
        >

        <label>Banner URL</label>
        <input type='url' maxlength='6000' bind:value={banner_url} placeholder='Enter Banner URL here...'>
        {#if URL.canParse(banner_url)}
            <div class='flex justify-center mt-8'>
                <img src={banner_url} alt='Map Image' class='w-20 non-previewable-icon banner' />
            </div>
        {/if}

        <label>Claim Description{claim_url_valid ? '' : '*'}</label>
        <textarea
            placeholder="Describe your claim here. You can leave this empty if you provide an image below."
            class='min-h-40'
            minlength='1'
            maxlength='6000'
            bind:value={claim_text}
            required={!claim_url_valid}
        > </textarea>

        <label>Claim Image</label>
        <input type='url' maxlength='6000' bind:value={claim_url} placeholder='Enter Image URL here...'>
        {#if claim_url_valid}
            <div class='flex justify-center mt-8'>
                <div class='w-1/2 min-w-5 min-h-5' style='border: var(--ridge-border);'>
                    <img src={claim_url} alt='Map Image' class='w-full non-previewable-icon' />
                </div>
            </div>
        {/if}

        <label>Additional Info</label>
        <textarea
            placeholder="You can put additional notes relevant to the admission process or also just trivia about your country here."
            class='min-h-40'
            minlength='1'
            maxlength='6000'
            bind:value={trivia}
        > </textarea>

        <div class='flex justify-center mt-6 -mb-8 gap-8'>
            <input type='submit' value='Submit' class='w-32 border-none' />
        </div>
    </form>
</section>

<style lang='scss'>
    label { user-select: none; }
</style>
