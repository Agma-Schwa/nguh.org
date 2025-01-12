export type FileType = 'text' | 'json' | 'raw'

export class FileDialogResult {
    readonly data: string | object | File
    readonly type: FileType
    url_saved?: string

    constructor(data: string | object | File, type: FileType, is_url: boolean = false) {
        this.data = data
        this.type = type
        if (is_url) this.url_saved = data as string
    }

    static async Resolve(file: File, type: FileType): Promise<string | object | File> {
        if (type !== 'raw') {
            const text = await file.text()
            if (type === 'text') return text
            if (type === 'json')
                try { return JSON.parse(text) } catch (e: any) {
                    throw (`File '${file.name}' does not appear to be a valid JSON File: ${e?.message ?? e}`)
                }
            throw new Error('Unreachable: Invalid FileType')
        }
        return file
    }

    get url(): string {
        if (this.url_saved) return this.url_saved

        let blob: Blob
        switch (this.type) {
            case 'json':
                blob = new Blob([JSON.stringify(this.data as object)], {type: 'application/json'})
                break
            case 'raw':
                blob = this.data as Blob
                break
            case 'text':
                blob = new Blob([this.data as string], {type: 'text'})
                break
            default:
                throw new Error('Unreachable')
        }

        return URL.createObjectURL(blob)
    }
}

export interface FileDialogData {
    file: File | string
    is_file: boolean
}

export interface MultiFileDialogResult {
    readonly files: string[] | object[] | File[]
    readonly type: FileType
}

export interface MultiFileDialogData {
    files: FileList | null
    par: HTMLParagraphElement
    type: FileType
}