import * as fs from "fs";

interface RouteParams {
    lang: string
    chapter: number
    page: number
}

export function load({ params }: { params: RouteParams }) {
    // Do a directory listing. Each directory in 'comic' is a chapter.
    const chapters = fs.readdirSync('../static/comic');
    const pages: number[] = []
    for (const c of chapters) pages.push(
        fs.readdirSync(`../static/comic/${c}`)
            .map(path => Number(path.split('-')[0]))
            .reduce((a, b) => Math.max(a, b), 0)
    )

    return {
        lang: params.lang,
        chapter: Number(params.chapter),
        page: Number(params.page),
        pages,
    }
}