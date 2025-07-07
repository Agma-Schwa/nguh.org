<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import {Persist} from '$lib/js/persist.svelte';
    import {Err} from '$lib/js/dialog.svelte';
    import {UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import {goto} from '$app/navigation';
    import type {AdmissionFormRequestBody} from '$lib/js/ung_types';
    import EditAdmission from '$lib/components/ung/EditAdmission.svelte';

    let name = Persist('ung.admission.form.country.name', '')
    let ruler = Persist('ung.admission.form.ruler.name', '')
    let banner_url = Persist('ung.admission.form.country.banner.url', '')
    let banner_text = Persist('ung.admission.form.country.banner.description', '')
    let claim_text = Persist('ung.admission.form.country.claim.description', '')
    let claim_url = Persist('ung.admission.form.country.claim.url', '')
    let trivia = Persist('ung.admission.form.country.trivia', '')
    let data: AdmissionFormRequestBody = $derived({
        name: name.value,
        ruler: ruler.value,
        banner_text: banner_text.value,
        banner_url: banner_url.value,
        claim_text: claim_text.value,
        claim_url: claim_url.value,
        trivia: trivia.value,
    })

    async function Submit(data: AdmissionFormRequestBody, form: HTMLFormElement) {
        const res = await UŊMakeRequest('admission', 'POST', data)
        if (res.ok) {
            form.reset()
            await goto(`/ung/admission/${(await res.json()).value}`, { replaceState: true, invalidateAll: true })
        } else switch (res.status) {
            default: Err(`Error ${res.status}`); break
            case 401: Err('You must be logged in to fill in this form'); break
            case 403: Err('You must be a member of the minecraft server to fill in this form'); break
            case 409: Err('You can’t create a new ŋation if you’re already the ruler of a different one.'); break
            case 413: Err('One or more fields is too long!'); break;
            case 470: Err('One or more required field is empty!'); break;
            case 471: Err('You already have an open admission!'); break;
        }
    }
</script>

<Page name='UŊ' />
<Stripe>Admission Form</Stripe>
<section>
    <EditAdmission bind:data={data} on_submit={Submit} />
</section>