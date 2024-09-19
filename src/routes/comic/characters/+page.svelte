<script>
    import { style } from 'svelte-body';

    import Stripe from "$lib/components/Stripe.svelte";
    import Page from "$lib/components/Page.svelte";
    import Character from "$lib/components/comic/Character.svelte";
    import Backdrop from "$lib/components/Backdrop.svelte";

    import img_djonato from '$lib/images/comic/characters/Djonato.jpg'
    import img_oni from '$lib/images/comic/characters/Oni.jpg'
    import img_tinit from '$lib/images/comic/characters/Tinit.jpg'
    import img_zan from '$lib/images/comic/characters/Zan.jpg'
    import img_brazim from '$lib/images/comic/characters/brazim.jpg'
    import img_djaz from '$lib/images/comic/characters/djaz.jpg'
    import img_kira from '$lib/images/comic/characters/kira.jpg'
    import img_moth from '$lib/images/comic/characters/moth.jpg'
    import img_vezi from '$lib/images/comic/characters/Vezi.jpg'
    import img_unknown from '$lib/images/comic/characters/unknown.jpg'

/*    import img_fwonnel_peninsula from '$lib/images/comic/world/Fwonnel Peninsula.PNG'
    import img from '$lib/images/comic/world/world 2067.PNG'
    import img from '$lib/images/comic/world/world.PNG'*/
</script>

<Page name="Meet the Characters" />

<Backdrop image="/comic/1/0-en.png" />
<svelte:body use:style={'background-color: var(--body-background-colour);'} />

<Stripe>Characters</Stripe>
<section>
    <Character
        name="Zan Dedoumo"
        info={{
            Born: 2054,
            Gender: 'M',
        }}
        image={img_zan}
    >
        Zan is a student at the West Wall School, born in Sarbisi.
    </Character>


    <Character
        name='Kira Dedoumo'
        info={{
            Born: 2031,
            Gender: 'F'
        }}
        image={img_kira}
    >
        Kira is the Dmacin (Sea Commander) of the Port of Sarbisi, born in Sotrvau, Arodjunsja.
    </Character>

    <Character
        name='Djaz Anori'
        info={{
            Born: 2029,
            Gender: 'M'
        }}
        image={img_djaz}
    >
        Djaz is an archaeologist and former member of the El Fwonk Science Association, born in Roox City.
    </Character>

    <Character
        name='Tinit'
        info={{
            Born: 2042,
            Gender: 'M/N'
        }}
        image={img_tinit}
    >
        Tinit is a guard in the El Fwonk Navy, serving the Dedoumo family and the Port Authority of Sarbisi.
    </Character>

    <Character
        name='Brazim Maksin'
        info={{
            Born: 2025,
            Gender: 'M'
        }}
        image={img_brazim}
    >
        Brazim is the Akuv of the third generation of the Renegade Casanosians, a group of Arojaunzan nationalists who
        refused to leave historical Arodjunsja during the Arojaunzan Exodus of 2040.
    </Character>

    <Character
        name='Oni Gerwe'
        info={{
            Born: 2038,
            Gender: 'F'
        }}
        image={img_oni}
    >
        Oni is a former member of the El Fwonk Science Association, born in Fwonn.
    </Character>

    <Character
        name='Vezi Djorox'
        info={{
            Born: 2049,
            Gender: 'M'
        }}
        image={img_vezi}
    >
        Vezi is a member of Djaz’s archaeological team, born in Sojarun.
    </Character>

    <Character
        name='Djonato'
        info={{
            Born: 2036,
            Gender: 'M'
        }}
        image={img_djonato}
    >
        Djonato is a former member of the El Fwonk Science Association, born in Krakeric.
    </Character>

    <Character
        name='Moth'
        info={{
            Born: '???',
            Gender: 'M'
        }}
        image={img_moth}
    >
        ‘Moth’ is a pup who seems to be able to turn into some giant moth-like creature, discovered by Djaz in the ruins
        of the Temple of Bez by Djaz Anori.
    </Character>

    <Character
        name='???'
        info={{
            Born: '???',
            Gender: 'F'
        }}
        image={img_unknown}
        rule_after={false}
    >
        ??? is a mysterious being who seems to hold power over the Moth and can apparently ready minds or something.
    </Character>
</section>
