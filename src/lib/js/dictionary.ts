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
        export type DictGen = WebAssembly.Exports & {
            allocate(n: number): number
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
            constructor(instance: DictGen, js_buffer: Uint8Array) {
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
        constructor(instance: Internal.DictGen, data: Readonly<Data>) {
            this.#instance = instance
            this.#data = data
        }

        get dictionary() { return this.#data; }
    }

     export async function Parse(s: string): Promise<Generator> {
        const wasm = fetch(Internal.DictGenURL)

        // Load the generator.
        const exports: WebAssembly.Exports = (await WebAssembly.instantiateStreaming(wasm)).instance.exports
        const instance = exports as Internal.DictGen

        // Parse the dictionary.
        const dict_buffer = new Internal.RustBuffer(instance, new TextEncoder().encode(s))
        const parse_result = instance.parse(dict_buffer.ptr, dict_buffer.size)
        dict_buffer.delete()
        if (parse_result !== 0) throw new Error("Dictionary Generator: Parse Error")

        // Get the JSON output.
        const json_size = instance.get_output_size()
        const json_data = instance.get_output_ptr()
        const json_raw = new Uint8Array(instance.memory.buffer, json_data, json_size)
        const json_str = new TextDecoder().decode(json_raw);
        return new Generator(instance, Object.freeze(JSON.parse(json_str) as Data))
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