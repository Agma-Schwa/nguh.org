import {dev} from '$app/environment';

export namespace Dictionary {
    export type Data = { entries: Entry[] }
    export type Entry = FullEntry | RefEntry

    export type RefEntry = {
        word: Node,
        ref: Node,
        search: string,
    }

    export type FullEntry = {
        word: Node,
        pos: Node,
        etym?: Node,
        ipa?: Node,
        primary_definition?: Sense,
        senses?: Sense[],
        forms?: Node,
        hw_search: string,
        def_search: string,
    }

    export type Sense = {
        def: Node,
        comment?: Node,
        examples?: Example[],
    }

    export type Example = {
        text: Node,
        comment?: Node
    }

    export type Node = TextNode
                     | MathNode
                     | GroupNode
                     | MacroNode
                     | CustomMacroNode

    export type TextNode = { text: string }
    export type MathNode = { math: string }
    export type GroupNode = { group: Node[] }
    export type MacroNode = {
        macro: {
            name: BuiltinMacro,
            args?: Node[],
        }
    }
    export type CustomMacroNode = {
        custom_macro: {
            name: string,
            args?: Node[],
        }
    }

    export type BuiltinMacro = "bold"
                             | "ellipsis"
                             | "italic"
                             | "lemma"
                             | "normal"
                             | "paragraph_break"
                             | "sense"
                             | "small_caps"
                             | "subscript"
                             | "superscript"
                             | "soft_hyphen"
                             | "this"
                             | "reference"

    namespace Internal {
        export const LemmaCollation = 0
        export const DefinitionCollation = 1
        type Collation = typeof LemmaCollation | typeof DefinitionCollation

        export type DictGen = WebAssembly.Exports & {
            allocate(n: number): number
            collate(ptr: number, n: number, collation: Collation): number
            free(ptr: number, n: number): void
            get_output_size(): number
            get_output_ptr(): number
            parse(ptr: number, n: number): number
            memory: WebAssembly.Memory
        }

        export class RustBuffer {
            #instance: DictGen
            #ptr: number
            #size: number
            #buffer: Uint8Array
            constructor(instance: DictGen, contents: string) {
                const js_buffer = new TextEncoder().encode(contents)
                this.#instance = instance
                this.#size = js_buffer.byteLength
                this.#ptr = this.#instance.allocate(this.#size)
                this.#buffer = new Uint8Array(this.#instance.memory.buffer, this.#ptr, this.#size)
                this.#buffer.set(js_buffer)
            }

            delete() {
                this.#instance.free(this.#ptr, this.#size)
            }

            get ptr() { return this.#ptr }
            get size() { return this.#size }
        }

        export const DictGenURL = dev ? "/dictgen.wasm" : "/static/dictgen.wasm";
    }

    export class Generator {
        #data: Readonly<Data>
        #instance: Internal.DictGen
        constructor(instance: Internal.DictGen, dict: string) {
            this.#instance = instance

            // Parse the dictionary.
            const parse_result = this.#UploadAndRun(dict, (ptr, size) => this.#instance.parse(ptr, size))
            if (parse_result !== 0) throw new Error("Dictionary Generator: Parse Error")

            // Save the JSON data.
            this.#data = Object.freeze(JSON.parse(this.#GetOutput()) as Data)
        }

        /** Get the dictionary data. */
        get dictionary() { return this.#data; }

        /** Normalise a word for searching. */
        normalise_for_search(s: string, mode: SearchMode): string {
            const coll = mode == SearchMode.Definition ? Internal.DefinitionCollation : Internal.LemmaCollation
            const collate_result = this.#UploadAndRun(s, (ptr, size) => this.#instance.collate(ptr, size, coll))
            if (collate_result !== 0) return s; // If this failed, just return the original string.
            return this.#GetOutput()
        }

        /** Get the contents of the generator’s output buffer. */
        #GetOutput(): string {
            const size = this.#instance.get_output_size()
            const data = this.#instance.get_output_ptr()
            const raw = new Uint8Array(this.#instance.memory.buffer, data, size)
            return new TextDecoder().decode(raw);
        }

        /** Upload data to Rust and run 'cb' on it. */
        #UploadAndRun<T>(s: string, cb: (ptr: number, size: number) => T): T {
            const buffer = new Internal.RustBuffer(this.#instance, s)
            try { return cb(buffer.ptr, buffer.size) }
            finally { buffer.delete() }
        }
    }

     export async function Parse(s: string): Promise<Generator> {
        const wasm = fetch(Internal.DictGenURL)
        const exports: WebAssembly.Exports = (await WebAssembly.instantiateStreaming(wasm)).instance.exports
        const instance = exports as Internal.DictGen
        return new Generator(instance, s)
    }
}

export enum SearchMode {
    Headword = "Headword",
    Definition = "Definition",
}

export function IsFullEntry(e: Dictionary.Entry): e is Dictionary.FullEntry {
    return !IsRefEntry(e)
}

export function IsRefEntry(e: Dictionary.Entry): e is Dictionary.RefEntry {
    return 'ref' in e
}

export async function ParseDictionary(s: string): Promise<Dictionary.Generator> {
    return Dictionary.Parse(s)
}