<script>
    import { style } from 'svelte-body';

    import Stripe from "$lib/components/Stripe.svelte";
    import Page from "$lib/components/Page.svelte";
    import Backdrop from "$lib/components/Backdrop.svelte";
</script>

<Page name="The World of Djogawa Djororx" />

<Backdrop image="/comic/1/0-en.png" />
<svelte:body use:style={'background-color: var(--body-background-colour);'} />

<Stripe>The World, 2067 AR</Stripe>
<img src="$lib/images/comic/world/world.png" style="margin-block: -3rem;" alt="">

<Stripe>Introduction</Stripe>
<section>
    <p>
        The humans are gone. They vanished from the Fossil Record almost three million years ago. Their civilizations
        were advanced, and deep underground their secrets were left sealed and preserved. Until the Rediscovery.
    </p>

    <p>
        It’s now been 2067 years since the first Rediscovery took place in the nation of Sern along the northeast coast
        of Menaiceraum, but the world still feels the aftershock of such a pivotal moment for dogkind. Empires have
        risen and fallen with the reverse-engineering of old human tools, weapons, and plagues. But today, it’s been
        over two hundred years since the last major discovery, and the last known functional human-style aircraft went
        up in flames in Sizarun in 2014.
    </p>

    <p>
        Here, in the Fwonnel Peninsula, a resentment of these explorations has developed. The cultural memory of the
        devastation wrought by the Prins in the late 1200’s using sonic weaponry, along with the political chaos caused
        by the Fwonk Pearl and its seemingly infinite energy that led to the Permechikan colonization of much of the
        continent. Not to mention the Ick, which was likely brought to the land by the greed of the wealthy investors
        behind the Eastern Expedition Company in 1934.
    </p>

    <p>
        During and after the War of the Continent (2009–2027), many feared that we had violated the principles of Bez
        too far and corrupted our world beyond recognition, leading to further movements to shun the use of human
        discoveries. Why should we try to take after the humans? They built this technology and destroyed themselves
        with it. They failed their pursuit of Bez, so why should they be considered role models?
    </p>

    <p>
        Life is a constant struggle against the most powerful force in nature, Xororx, entropy. To many it feels as if
        entropy has been winning the struggle as of late. Since the War, the scale of our civilizations, the scale of
        our abilities to properly terraform, and the overall balance between order and entropy that differentiates us
        from the rocks and the oceans, has been in a visible decline.
    </p>
</section>

<Stripe>The Fwonnel Peninsula</Stripe>
<img src="$lib/images/comic/world/Fwonnel Peninsula.png" style="margin-top: -3rem; margin-bottom: 1rem" alt="">
<section>
    <p>
        Kimzja Fwonnou, The Fwonnel Peninsula, is a peninsular landmass on the southwestern coast of Kradoy, south of
        the Kleo Peninsula, adjoined to the continent along the central Pemex desert. Much of the peninsula is a recent
        geological formation, uplifted from the Ocean in a cataclysmic event and followed by significant volcanic
        activity.
    </p>

    <p>
        The peninsula sits at an average elevation of 2,007 feet above sea level, with steep cliffsides defining its
        northern and western ridges. Multiple mountain ranges line the edges of the peninsula. The Fwokojoo curves
        through the south central regions of the peninsula, The Barrier Mountains line the southern and western ridges,
        and the volcanic Krakerber Mountains form a line from east to west across the north central regions.
    </p>

    <p>
        The Great Geyser Xudjadjeum sits at the convergence of two tectonic plates where the peninsula connects to
        Menaiceraum. It regularly erupts with millions of gallons of water per day and feeds the Fwonnel Watershed, a
        series of rivers, lakes, and canals that all lead to the Death Canyon River, which dumps into the Ocean after
        passing through Death Canyon, a rapid decline of hundreds of feet maintained by strong basalt bedrock. Thousands
        of years of terraforming have kept the Fwonnel Watershed nearly entirely contained to the Fwonnel Peninsula with
        few occasions of breaches in recorded history. During years of drought or tamer geothermal activity, the Geyser
        reduces or ceases its flow for days, or sometimes months, at a time.
    </p>

    <div class="image-container">
        <img src="$lib/images/comic/world/fwonnel-peninsula-flora.jpeg" alt="">
        <img src="$lib/images/comic/world/fwonnel-peninsula-flora2.jpeg" alt="">
    </div>

    <p>
        The Fwonnel Peninsula sits at the northern edge of the tropics, and due to its consistently high elevation and
        adjoining with Menaiceraum along the western coast, the landmass participates in the creation of the rain shadow
        that creates the Pemex Desert. Thus, the eastern edge of the peninsula is a rapid transition from swampy
        riparian land along the Great Geyser and its initial drainages to an arid, occasionally sandy desert. The higher
        elevations in the peninsula, especially along mountains and in along the Reuxalusian plateau, are dry forests
        and transition woodlands, full of yucca, agave, juniper, ponderosa pine, and opuntia. The land north of the
        Krakerber Mountains is the wetter side of a small rain shadow effect, and as such the northern face of the
        mountains are wetter and colder, with more varieties of pines and even some aspen near mountain slopes, and this
        small ecoregion receives occasional snow in the winter. The plains between the Arodjaunza River and The North
        Ridge Kraikojoo is grassier and includes more trees such as cottonwood, sycamore, mesquite, and more. The
        Southwestern region of the Peninsula, Pakoya, is the driest part of the peninsula proper, with an ecosystem of
        upland hilly deserts, and is full of creosote, ocotillo, true cacti, mesquite, ironwood, and other desert biota.
    </p>

    <p>
        Ringing the western and northern Peninsula is a series of smaller islands and peninsulas known as the Froof
        Straits, Frufsja. These landmasses are only adjoined to the Fwonnel Peninsula at the Death Canyon Delta, the
        outflow of all water in the Fwonnel Watershed. The northern stretch of the Straits is warm and humid and is
        replete with dense tropical forests. The western stretch of the Straits is dried and full of desert more similar
        to that of Pakoya. North of the entire peninsula is the large island of Zessis, another recent geological
        formation. This land is highly mountainous and volcanic. It’s moist and often foggy, and is mostly made up of
        coastal grassland, shrubland, and juniper forest.
    </p>
</section>

<Stripe>The Ick</Stripe>
<img src="$lib/images/comic/world/ick.jpeg" style="margin-top: -3rem; margin-bottom: 1rem" alt="">
<section>
    <p>
        The Ick, Ikaum, is a colonial fungal lifeform with spores light enough to germinate thousands of feet in the
        air, which comes down in massive storms as they reach critical mass. Their adult forms are coated with a strong
        acid which seeks out organic materials, especially the flesh of animals, which it digests in order to gain the
        nutrients required to reproduce.
    </p>

    <p>
        The Ick was initially only found in the subtropics of Maiceraum, until it was introduced to the Fwonnel
        Peninsula in 1934 AR. The aerial ecosystem in and above the Fwonnel Peninsula was perfect for the introduction
        of the Ick to the environment. As such, the Ick has been an annually-recurring phenomenon ever since, blooming
        in the late spring of every year for about a month.
    </p>

    <p>
        The Ick Phenomenon has been the source of political and social chaos since its introduction. After three years
        of unregulated handling of the situation, the government of El Fwonk Casanosia (Ezle Fwonk K’sleinozlja) nearly
        fell in an event that many thought signified the end of the world. In 1937, the first Ick Evacuation was
        introduced, an event during which anybody willing to leave home for 2 months would be funded to travel by boat
        to the newly developed Ick Basecamp to live in a rapidly constructed town. For those who could not evacuate
        (which constituted the vast majority of the population) the local governments of the cities authorized the
        establishment of annual militias to guarantee access to clean food, water, and order to as many citizens as
        possible.
    </p>

    <p>
        In 2004, Ick-Proofing material for shoes and other clothing items was invented by Sakko and the El Fwonk Science
        Association, composed of a special mixture of petroleum, tree sap, and other resinous materials. Production of
        this material was restricted to military use until 2009, and mass production was limited to the famous “Ick
        Boots” until the Folly of 2013, an unprecedentedly large and early fall of the Ick during the El Fwonk Civil
        War, which left the population of the Peninsula completely unprepared to manage the crisis. During this brutal
        event, more than one third of the population of the Peninsula died, mostly due to starvation, Ick-contaminated
        water, and marauding.
    </p>

    <p>
        Several cities completely lost their governments and some were completely depopulated, with hundreds of
        thousands of refugees moving to Roox City, Earkan City, the former Basecamp, and the new community of Franzlen
        along the Geyser Lake. Earkan City controlled the resources required to produce Ick-Proofing, and its Karkuv,
        Karbinin, promised full Ick-Proofing to all who arrived to work in the city. War between Roox City and Earkan
        City ensued on-and-off until trade relations normalized and Ick-Proofing became a purchasable commodity
        ubiquitous throughout the peninsula. By 2016, Ick Evacuations resumed, though the new government of the former
        Basecamp, the Realm of Varad Akim, forbade loyal citizens of El Fwonk from entering. As such, new resort-style
        “basecamp towns” were developed in other regions of the Froof Straits, much to the chagrin of the agrarian
        Frufi people. These resorts were no longer government-subsidized, and evacuation became a practice reserved to
        the upper class.
    </p>

    <p>
        Before the 2012 Civil War and subsequent collapse of the central government, the El Fwonk Science Association
        was experimenting with chemicals and missiles to exterminate the Ick, but these attempts were unsuccessful.
        Following the consolidation of power in Roox City after the Folly of 2013, the El Fwonk Science Association was
        reestablished, with the primary focus continuing to be the destruction of the Ick. As time went on and
        Ick-Proofing became more and more accessible, life with the Ick became more manageable and cities rebuilt with
        Ick protection in mind. The El Fwonk Science Association lost funding over time and fell out of relevancy by the
        2050’s.
    </p>
</section>

<style lang="scss">
    .image-container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1rem;

        width: 100%;

        img {
            width: 35rem !important;
            height: auto;
            margin-bottom: 1rem;
        }
    }

    @media only screen and (max-width: 1250px) {
        .image-container {
            flex-direction: column;
            align-items: center;
        }
    }

    @media only screen and (max-width: 900px) {
        .image-container img {
            width: 100% !important;
        }
    }

</style>