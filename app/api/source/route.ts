import { chats } from '@/app/c/action'
import generateReply, { extractDocumentContent } from '@/services/google'
import { mediaToBase64 } from '@/services/media'
import { insertChat } from '@/services/mongo'
import { transcribe } from '@/services/transcribe'
import { client } from '@/services/twilio'
import { NextRequest, NextResponse } from 'next/server'

function parseQueryString(queryString: string) {
    return queryString
        .split('&')
        .reduce((acc: { [key: string]: string }, current) => {
            const [key, value] = current.split('=')
            acc[decodeURIComponent(key)] = decodeURIComponent(
                value.replace(/\+/g, ' ')
            )
            return acc
        }, {})
}

export async function GET(request: NextRequest) {
    return NextResponse.json({ message: 'Welcome to the API!' })
}

export async function POST(req: NextRequest) {
    let reply: string = ''
    let error: boolean = false

    const body = await req.text()
    const data = parseQueryString(body)
    let query = data.Body

    if (data.MediaUrl0 !== undefined) {
        const { error: mediaError, query: mediaQuery } = await handleMedia(
            data.MediaUrl0,
            data
        )
        error = mediaError
        query = mediaQuery
    }

    if (error === false) {
        const allChats = await chats({ username: data.WaId })
        try {
            reply = await generateReply(allChats, query)
        } catch (err: any) {
            console.error(err)
            error = true
        }
    }

    if (error) {
        reply =
            'Oopsie-daisy! Looks like our system had a little hiccup. If you sent a file, We only accept images for now.'
    } else {
        if (data.MediaUrl0 === undefined || data.Body !== '') {
            await insertChat({
                user: data.WaId,
                part: data.Body,
                role: 'user',
                type: 'text',
            })
        }

        await insertChat({
            user: data.WaId,
            part: reply,
            role: 'model',
            type: 'text',
        })
    }

    const message = await client.messages.create({
        from: data.To,
        body: reply,
        to: data.From,
    })

    return NextResponse.json(message)
}

async function handleMedia(mediaUrl: string, data: { [key: string]: string }) {
    let error = false
    let content: string = ''
    const media = await mediaToBase64(mediaUrl)
    let type: 'text' | 'audio' | 'image' = 'text'
    let query: string = ''

    switch (media.type) {
        case 'audio/ogg':
        case 'audio/wav':
        case 'audio/mpeg':
        case 'audio/mp3':
        case 'audio/mp4':
        case 'audio/aac':
        case 'audio/flac':
        case 'audio/x-wav':
            const trans = await transcribe(media.url)
            if (trans) {
                content = trans
                type = 'audio'
                query = `Summarise the content: ${content}`
            } else error = true
            break

        case 'image/jpeg':
        case 'image/png':
        case 'image/jpg':
        case 'image/gif':
            content = await extractDocumentContent(media)
            type = 'image'
            query = `Summarise the content: ${content}`
            break

        default:
            error = true
            break
    }

    if (error === false) {
        await insertChat({
            user: data.WaId,
            part: content,
            role: 'user',
            type: type,
            url: media.url,
        })
    }

    return { error, query }
}
