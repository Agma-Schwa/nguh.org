<script>
    import Stripe from "$lib/components/Stripe.svelte";
    import Page from "$lib/components/Page.svelte";
    import YouTubeVideo from "$lib/components/YouTubeVideo.svelte";
</script>

<Page name="Tools" />

<Stripe>Playlist</Stripe>
<section>
    <YouTubeVideo src="https://www.youtube.com/embed/videoseries?list=PLZI8zCShyGT-X3hK5kqO8I_TuXsALSLT7" />
</section>

<Stripe>List of Tools</Stripe>
<section class='[&>h4]:text-left'>
    <div class='w-full mb-8'>
        <h3 class='w-2/3 mx-auto text-center'>
            The following is a list of conlanging tools that I have reviewed, and/or will be reviewing in the future, with
            associated links to said videos
        </h3>
    </div>

    <h4>Lexurgy — Sound Change Applier</h4>
    <ul>
        <li><a href='https://lexurgy-app.vercel.app/sc'>https://lexurgy-app.vercel.app/sc</a></li>
    </ul>

    <h4>SCA² – Sound Change Applier </h4>
    <ul>
        <li><a href="http://zompist.com/sca2.html">http://zompist.com/sca2.html</a></li>
        <li><a href="https://www.youtube.com/watch?v=AYktVyyha3Q">https://www.youtube.com/watch?v=AYktVyyha3Q</a></li>
    </ul>

    <h4>Word Generator here on nguh.org</h4>
    <ul>
        <li><a href='/tools/word_generator'>https://www.nguh.org/tools/word_generator</a></li>
    </ul>

    <h4>Microsoft Keyboard Layout Creator (MSKLC) Version 1.4 (Custom Keyboard Maker for Windows)</h4>
    <ul>
        <li><a href="https://www.microsoft.com/en-us/download/details.aspx?id=102134">https://www.microsoft.com/en-us/download/details.aspx?id=102134</a></li>
        <li><a href="https://www.youtube.com/watch?v=x2j0VWmPbnk">https://www.youtube.com/watch?v=x2j0VWmPbnk</a></li>
    </ul>

    <h4>Minecraft Custom Language Tutorial</h4>
    <ul>
        <li><a href="https://www.youtube.com/watch?v=moq_bNdGnoQ">https://www.youtube.com/watch?v=moq_bNdGnoQ</a></li>
    </ul>

    <h4>Conlang Syntax Test Cases (Grammar and Syntax Situations)</h4>
    <ul>
        <li><a href="https://cofl.github.io/conlang/resources/mirror/conlang-syntax-test-cases.html">https://cofl.github.io/conlang/resources/mirror/conlang-syntax-test-cases.html</a></li>
        <li><a href="https://www.youtube.com/watch?v=4AlXcvDh7B4">https://www.youtube.com/watch?v=4AlXcvDh7B4</a></li>
    </ul>

    <h4>Keyman Custom Keyboard Developer Tool</h4>
    <ul>
        <li><a href="https://keyman.com/developer/">https://keyman.com/developer/</a></li>
        <li><a href="https://www.youtube.com/watch?v=_YaH-9o5KJk">https://www.youtube.com/watch?v=_YaH-9o5KJk</a></li>
    </ul>

    <h4>Vulgarlang</h4>
    <ul>
        <li><a href="https://www.vulgarlang.com/">https://www.vulgarlang.com/</a></li>
        <li><a href="https://www.youtube.com/watch?v=vSkfcr7xm0U">https://www.youtube.com/watch?v=vSkfcr7xm0U</a></li>
    </ul>

    <h4>Memrise</h4>
    <ul>
        <li><a href="https://www.memrise.com/">https://www.memrise.com/</a></li>
        <li><a href="https://www.youtube.com/watch?v=--uk-gSqQ_E">https://www.youtube.com/watch?v=--uk-gSqQ_E</a></li>
    </ul>

    <h4>Conworkshop</h4>
    <ul>
        <li><a href="https://conworkshop.com/">https://conworkshop.com/</a></li>
        <li><a href="https://youtu.be/6QFSJxoJ-RM">https://youtu.be/6QFSJxoJ-RM</a></li>
    </ul>

    <h4>The GUMSMAQQER</h4>
    <ul>
        <li><a href="https://github.com/Sirraide/gumsmaqqer">https://github.com/Sirraide/gumsmaqqer</a></li>
    </ul>
</section>
