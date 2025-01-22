export class StreamImpl {
    #text: string
    constructor(text: string) { this.#text = text }

    /** Consume a character. */
    consume(s: string): boolean {
        if (this.starts_with(s)) {
            this.drop(s.length)
            return true
        }
        return false
    }

    /** Remove a number of characters from the start of the stream. */
    drop(n: number = 1): StreamImpl { return this.#t(this.#text.slice(n)) }

    /** Check if this is empty. */
    empty(): boolean { return this.#text.length === 0 }

    /** Get the first character. */
    front(): string | null { return this.empty() ? null : this.#text[0] }

    /** Compare w/ a string for equality. */
    is(s: string): boolean { return this.#text === s }

    /** Get the number of characters in the stream. */
    size(): number { return this.#text.length }

    /** Split by a string. */
    split(s: string): StreamImpl[] { return this.#text.split(s).map(Stream) }

    /** Check if this starts with a string. */
    starts_with(s: string): boolean { return this.#text.startsWith(s) }

    /** Check if this starts with any of a list of characters. */
    starts_with_any(s: string): boolean { return this.empty() ? false : s.includes(this.front()!!) }

    /** Advance n characters and return them. */
    take(n: number): string {
        const s = this.#text.slice(0, n)
        this.drop(n)
        return s
    }

    /** Take characters until a delimiter. */
    take_until(delim: string): string {
        const i = this.#text.indexOf(delim)
        if (i === -1) return this.take(this.#text.length)
        return this.take(i)
    }

    /** Take characters until a delimiter. */
    take_until_any(delims: string): string {
        const i = this.#text.split('').findIndex(c => delims.includes(c))
        if (i === -1) return this.take(this.#text.length)
        return this.take(i)
    }

    /** Get the stream’s text. */
    text(): string { return this.#text }

    /** Trim whitespace. */
    trim_back(): StreamImpl { return this.#t(this.#text.trimEnd()) }
    trim_front(): StreamImpl { return this.#t(this.#text.trimStart()) }
    trim(): StreamImpl { return this.#t(this.#text.trim()) }

    /** Set this stream’s text and return itself. */
    #t(s: string): StreamImpl {
        this.#text = s
        return this;
    }
}

export function Stream(text: string): StreamImpl {
    return new StreamImpl(text)
}