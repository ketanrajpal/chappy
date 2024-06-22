import { fileTypeFromStream } from 'file-type'
import got from 'got'
import { GoogleAIFileManager } from '@google/generative-ai/files'

export type MediaFile = {
    media: string
    type: string
}

export async function readMedia(mediaUrl: string): Promise<MediaFile | null> {
    const response = got.stream(mediaUrl)
    const fileType = await fileTypeFromStream(response as any)
    if (!fileType) {
        return null
    }

    return { media: mediaUrl, type: fileType?.mime }
}

export async function uploadMedia(media: MediaFile) {
    const fileManager = new GoogleAIFileManager(
        process.env.REACT_APP_GEMINI_API_KEY as string
    )

    const uploadResult = await fileManager.uploadFile(media.media, {
        mimeType: media.type,
    })

    return { media: uploadResult.file.uri, type: media.type }
}
