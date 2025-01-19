<script>
    import Stripe from "$lib/components/Stripe.svelte";
    import Page from "$lib/components/Page.svelte";
</script>

<Page name="Merch" />

<Stripe>Agma Schwa Merch Available Now</Stripe>
<section class="flex gap-8 [&>*]:basis-full">
    <article class="flex flex-col" style="justify-content: space-between">
        <h3>Check out Agma Schwa merch!</h3>
        <h4>Provided by Spreadshirt, Redbubble, and Amazon</h4>
        <p>Want to sport some tasty Agma Schwa merchandise? Through Spreadshirt, Redbubble,
            and Amazon you can get anything from stickers to t-shirts to masks to the
            Arodjun Grammar Book!</p>

        <img src="$lib/images/merch/merch.jpg" alt="Merch" class="mgt2rem">
        <h4 class="mgt1rem">Shirts, buttons, and more on Spreadhsirt/Spreadshop</h4>
        <a href="https://agma-schwa.myspreadshop.com/" class="link-button mgt1rem">Browse Spreadshirt</a>

        <img src="$lib/images/merch/bio.jpg" alt="Merch" style="margin-top: 4rem;">
        <h4 class="mgt1rem">Stickers, posters, and more on Redbubble</h4>
        <a href="https://www.redbubble.com/people/AgmaSchwa/shop?asc=u" class="link-button mgt1rem" style="min-width: 50%">Browse Redbubble</a>
    </article>
    <article class="w50">
        <h3>Get the Book!</h3>
        <img src="$lib/images/merch/cover.jpg" alt="Arodjun Book cover">
        <h4 class="mgt1rem">Buy "A Grammar of the Arodjun Language" on Amazon</h4>
        <a href="https://www.amazon.com/dp/1737701502/" class="link-button mgt2rem">Buy</a>
    </article>
</section>