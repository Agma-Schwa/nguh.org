<script lang="ts">
    interface ServerData {
        lang: string
        chapter: number
        page: number,
        pages: number[]
    }

    interface Props {
        data: ServerData;
    }

    let { data }: Props = $props();

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

<div class="flex justify-between py-4 [--button-margin:2rem]
    px-[calc(45%-4*var(--button-margin))] [&>*+*]:ml-(--button-margin)
    [@media(max-width:900px)]:grid [@media(max-width:900px)]:grid-cols-[repeat(7,minmax(0,1fr))]
    [@media(max-width:900px)]:gap-1 [@media(max-width:900px)]:px-2
    [@media(max-width:900px)]:[--button-margin:0]
    [@media(max-width:900px)]:[&>a]:min-w-0 [@media(max-width:900px)]:[&>a]:px-0
    [@media(max-width:900px)]:[&>a]:text-base [@media(max-width:900px)]:[&>span]:min-w-0
    [@media(max-width:900px)]:[&>span]:h-auto [@media(max-width:900px)]:[&>span]:grid
    [@media(max-width:900px)]:[&>span]:place-items-center [@media(max-width:900px)]:[&>span]:text-base
    [&>a]:block [&>a]:min-w-14 [&>a]:select-none [&>a]:text-[20pt]
    [&>a.disabled]:pointer-events-none [&>a.disabled]:cursor-default [&>a.disabled]:bg-[grey]!">
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

    <span class="block h-8 min-w-18 bg-(--accentlight) text-center text-[20pt] leading-8">{data.chapter}.{data.page}</span>

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
