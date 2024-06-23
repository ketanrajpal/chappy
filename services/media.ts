export type Media = {
    media: {
        inlineData: {
            data: string
            mimeType: string
        }
    }
    type: string
    url: string
}

export async function mediaToBase64(mediaUrl: string): Promise<Media> {
    const response = await fetch(mediaUrl)
    const responseData = await response.blob()

    const image = await fetch(response.url)
    const imageBlob = await image.blob()
    const imageBuffer = await imageBlob.arrayBuffer()
    const imageBufferString = Buffer.from(imageBuffer).toString('base64')

    return {
        media: {
            inlineData: {
                data: imageBufferString,
                mimeType: responseData.type,
            },
        },
        type: responseData.type,
        url: response.url,
    }
}

export async function mediaToBase64Blob(mediaUrl: string): Promise<Media> {
    const image = await fetch(mediaUrl)
    const imageBlob = await image.blob()
    const imageBuffer = await imageBlob.arrayBuffer()
    const imageBufferString = Buffer.from(imageBuffer).toString('base64')

    return {
        media: {
            inlineData: {
                data: imageBufferString,
                mimeType: imageBlob.type,
            },
        },
        type: imageBlob.type,
        url: mediaUrl,
    }
}
