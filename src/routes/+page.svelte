<script lang="ts">
    import Page from "$lib/components/Page.svelte";
    import Slideshow from "$lib/components/Slideshow.svelte";
    import YouTubeVideo from "$lib/components/YouTubeVideo.svelte";
    import Stripe from "$lib/components/Stripe.svelte";

    import slide1 from "$lib/images/index/slide1.png"
    import slide2 from "$lib/images/index/slide2.jpg"
    import slide3 from "$lib/images/index/slide3.png"
    import slide4 from "$lib/images/index/slide4.png"
    import slide5 from "$lib/images/index/slide5.png"
    import slide6 from "$lib/images/index/slide6.jpg"
    import slide7 from "$lib/images/index/slide7.jpg"
    import slide8 from "$lib/images/index/slide8.jpg"
    import slide9 from "$lib/images/index/slide9.jpg"
    import slide10 from "$lib/images/index/slide10.jpg"
</script>

<Page name="Agma Schwa" />

<img src="$lib/images/index/banner 3.jpg" alt="banner 3.jpg">

<Stripe>Hey everybody, welcome to “Nguh”</Stripe>
<section class="flex gap-8">
    <article class="">
        <YouTubeVideo src="https://www.youtube.com/embed/KEGsSCcSVRo"/>
        <div>
            <p>
                Agma Schwa is a YouTube channel run by Robbie Cole, AKA “Nguh,” dedicated to bringing a more casual and
                fun approach to elements of conlanging, worldbuilding, and linguistics in general!
            </p>

            <p>
                Robbie Cole graduated from Arizona State University in 2020, majoring in Linguistics with a minor in
                Spanish Linguistics and TESOL. He graduated with a Master’s degree in Digital Audience Strategy in 2021
                and published A Grammar of the Arodjun Language later that year.</p>

                <p>He speaks English and Spanish fluently, and has created conlangs such as Arodjun, pʰ.ð.m, Rabbid,
                Hvasvan, HyperPirate, Gumsmaq, Santaa, Nashan, The Secret Handshake, Permechikan, Prins, The Hallowed
                Ween, and HyperFormal. Subscribe to the channel for more content in the future!</p>
        </div>
    </article>
    <article>
        <h3 class='mb-4 -mt-2'>“A Grammar of the Arodjun Language” for sale now!</h3>
        <img src="$lib/images/merch/cover.jpg" alt="Arodjun Book Cover">
        <h4 class='my-2'>$25 on Amazon</h4>
        <a href="https://www.amazon.com/dp/1737701502/" class="link-button">Buy Now</a>
    </article>
</section>

<Stripe>Socials</Stripe>
<section class="flex gap-8">
    <div>
        <h3 class="mb-8">Follow the Agma Schwa Social Media Channels!</h3>
        <article class="flex [&>*]:basis-full gap-8">
            <div>
                <img
                    src="$lib/images/index/Zlevau djoDaxwex.png"
                    alt="Zlevau djoDaxwex"
                    class="img-height-1 mb-8 w-full"
                >

                <div class="spaced-button-group">
                    <a href="https://www.instagram.com/agmaschwa/">Follow Nguh on Instagram</a>
                    <a href="https://twitter.com/AgmaSchwa">Follow Nguh on Twitter</a>
                    <a href="https://www.patreon.com/nguh">Follow Nguh on Patreon</a>
                </div>
            </div>
            <div>
                <Slideshow slides={[
                    slide1,
                    slide2,
                    slide3,
                    slide4,
                    slide5,
                    slide6,
                    slide7,
                    slide8,
                    slide9,
                    slide10
                ]}/>
                <img src="$lib/images/index/color-wheel.png" alt="Arodjun Colour Wheel">
            </div>
        </article>
    </div>

    <div>
        <article>
            <h3 class="mb-8">Join the Discord Server</h3>
            <div class="iframe-wrapper">
                <iframe src="https://discord.com/widget?id=697450809390268467&theme=dark" width="350" height="500"
                    allowtransparency="true" title="Discord Widget" frameborder="0"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts">
                </iframe>
            </div>
            <h4 class='mt-2'>Get in on the inside jokes, the Minecraft Server, and more!</h4>
            <a href="https://discord.gg/zCA2Urv7Tc" class="link-button">Join</a>
        </article>

    </div>
</section>

<Stripe>Merch</Stripe>
<section class="flex gap-8">
    <article><img src="$lib/images/merch/merch.jpg" alt="Merch" class="mt-8 object-cover"></article>
    <article class="flex flex-col justify-center">
        <h3 class="mb-8">Agma Schwa Merch Available Now!</h3>
        <div class="spaced-button-group">
            <a href="https://www.storefrontier.com/nguh-tonners">Browse Storefrontier</a>
            <a href="https://www.redbubble.com/people/AgmaSchwa/shop?asc=u">Browse Redbubble</a>
            <a href="/merch">Browse Merch Page</a>
        </div>
    </article>
</section>

<section class="flex gap-8 mt-4">
    <article class="pars">
        <p>Disclaimer:</p>
        <p>All of the content of the Arodjun language, the pthm language, and any of the Sern-Cahilan languages,
            along with the fictional world in which they are spoken, are the intellectual property of Robert Cole (Agma
            Schwa), and are available under
            the <strong>Creative Commons license CC
                <abbr title="Attribution-NonCommercial-ShareAlike">BY-NC-SA</abbr>,
                meaning that this license lets others remix, adapt, and build upon
                the work non-commercially, as long as they credit the creator and
                license their new creations under the identical terms.</strong></p>

        <p>The Rabbid language, however, is a fan language created for
            the Rabbids universe, which is owned by Ubisoft. Thus,
            although Agma Schwa is the creator, this language is to
            be public domain unless Ubisoft says otherwise (which is
            probably never going to happen).</p>

        <p>Sorry for the thicc disclaimer, I just don't want anybody
            falsely claiming my fictional universe. The content of 'A Grammar of the Arodjun Language'
            is already copyrighted, but this is meant for any contents of this universe that may be available online
            but are not yet a part of copyrighted literature.</p>
    </article>
</section>

<style>
    :global(.slideshow img), .img-height-1 {
    object-fit: cover;
    height: 17em;
}
</style>