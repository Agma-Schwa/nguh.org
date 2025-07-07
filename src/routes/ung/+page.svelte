<script lang="ts">
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';

</script>


<Page name="UŊ"/>
<Stripe>UŊ Hub</Stripe>
<section>
    <h3 class='text-left'>Lists</h3>
    <div class='flex flex-col'>
        <a href='/ung/meeting'>Current Meeting</a>
        <a href='/ung/members'>Members</a>
        <a href='/ung/nations'>Ŋations</a>
        <a href='/ung/motions'>Motions</a>
        <a href='/ung/admissions'>Admissions</a>
    </div>
    <h3 class='text-left'>Actions</h3>
    <div class='flex flex-col'>
        <a href='/ung/motion'>Create a Motion</a>
        <a href='/ung/admission'>Create a Country</a>
    </div>
</section>
