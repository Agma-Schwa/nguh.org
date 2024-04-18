interface RouteParams {
    lang: string
    chapter: number
    page: number,
    last_page: number
}

export function load({ params }: { params: RouteParams }) {
    let chapter = Number(params.chapter)
    return {
        lang: params.lang,
        chapter: chapter,
        page: Number(params.page),
        pages: [26,  8], /// Number of pages per chapter.
    }
}