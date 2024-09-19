<script lang="ts">
    interface ServerData {
        lang: string
        chapter: number
        page: number,
        pages: number[]
    }

    export let data: ServerData;

    function LastPageForChapter(data: ServerData, chapter: number): number {
        return data.pages[chapter - 1]; /// Chapters are 1-indexed.
    }

    function BackButtonState(data: ServerData): string {
        return data.page === 0 && data.chapter === 1 ? 'disabled' : '';
    }

    function ForwardButtonState(data: ServerData): string {
        if (
            data.chapter === data.pages.length &&
            data.page == LastPageForChapter(data, data.chapter)
        ) return 'disabled';
        return '';
    }

    function NextPage(data: ServerData): number {
        if (data.page === LastPageForChapter(data, data.chapter)) return 0;
        return data.page + 1;
    }

    function PreviousPage(data: ServerData): number {
        if (data.page !== 0) return data.page - 1;
        return LastPageForChapter(data, data.chapter - 1);
    }
</script>

<div class="buttons">
    <a
        class="link-button {BackButtonState(data)}"
        href="/comic/{data.lang}/1/0"
    >&lt;&lt;&lt;</a>

    <a
        class="link-button {BackButtonState(data)}"
        href="/comic/{data.lang}/{Math.max(data.chapter - 1, 1)}/0"
    >&lt;&lt;</a>

    <a
        class="link-button {BackButtonState(data)}"
        href="/comic/{data.lang}/{data.page === 0 ? data.chapter - 1 : data.chapter}/{PreviousPage(data)}"
    >&lt;</a>

    <span class="page-number">{data.chapter}.{data.page}</span>

    <a
        class="link-button {ForwardButtonState(data)}"
        href="/comic/{data.lang}/{
            data.page === LastPageForChapter(data, data.chapter) ? data.chapter + 1 : data.chapter
        }/{NextPage(data)}"
    >&gt;</a>

    <a
        class="link-button {ForwardButtonState(data)}"
        href="/comic/{data.lang}/{Math.min(data.chapter + 1, data.pages.length)}/{
            data.chapter === data.pages.length ? LastPageForChapter(data, data.chapter) : 0
        }"
    >&gt;&gt;</a>

    <a
        class="link-button {ForwardButtonState(data)}"
        href="/comic/{data.lang}/{data.pages.length}/{LastPageForChapter(data, data.pages.length)}"
    >&gt;&gt;&gt;</a>
</div>

<style lang="scss">
    .page-number {
        display: block;
        min-width: 4.5rem;
        height: 2rem;
        line-height: 2rem;

        background: var(--accentlight);
        font-size: 20pt;
        text-align: center;
    }

    .buttons {
        --button-margin: 2rem;

        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-inline: calc(45% - 4 * var(--button-margin));
        padding-block: 1rem;

        a {
            display: block;
            min-width: 3.5rem;
            font-size: 20pt;

            -webkit-user-select: none;
            -ms-user-select: none;
            user-select: none;

            &.disabled {
                pointer-events: none;
                cursor: default;
                background: grey;
            }
        }

        // Lobotomised owl go brrr.
        * + * { margin-left: var(--button-margin); }
    }

    @media only screen and (max-width: 300px) {
        .buttons {
            --button-margin: 0;
            padding-inline: 0;
        }
    }
</style>