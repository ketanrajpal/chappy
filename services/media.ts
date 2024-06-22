import { fileTypeFromStream } from 'file-type'
import got from 'got'

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

    const media = await new Promise<string>((resolve, reject) => {
        let data = ''
        response.on('data', (chunk) => {
            data += chunk
        })
        response.on('end', () => {
            resolve(
                `data:${fileType.mime};base64,${Buffer.from(data).toString(
                    'base64'
                )}`
            )
        })
        response.on('error', reject)
    })

    return { media: media, type: fileType?.mime }
}
