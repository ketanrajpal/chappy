import { fileTypeFromStream } from 'file-type'
import got from 'got'

export type MediaFile = {
    url: string
    type: string
}

export async function readMedia(mediaUrl: string): Promise<MediaFile | null> {
    const response = got.stream(mediaUrl)
    const fileType = await fileTypeFromStream(response as any)
    if (!fileType) {
        return null
    }
    return { url: mediaUrl, type: fileType?.mime }
}
