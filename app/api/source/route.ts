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
    let type: 'text' | 'audio' | 'image' = 'text'

    let content: string = ''

    if (data.MediaUrl0 !== undefined) {
        const media = await mediaToBase64(data.MediaUrl0)
        if (
            [
                'audio/ogg',
                'audio/wav',
                'audio/mpeg',
                'audio/mp3',
                'audio/mp4',
                'audio/aac',
                'audio/flac',
                'audio/x-wav',
            ].includes(media.type)
        ) {
            const trans = await transcribe(media.url)
            if (trans) {
                content = trans
                type = 'audio'
            } else error = true
        } else if (
            ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(
                media.type
            )
        ) {
            content = await extractDocumentContent(media)
            type = 'image'
        } else {
            error = true
        }

        if (error === false) {
            try {
                await insertChat({
                    user: data.WaId,
                    part: content,
                    role: 'user',
                    type: type,
                    url: media.url,
                })
                query = 'Summarise the content'
            } catch (err: any) {
                console.error(err)
                error = true
            }
        }
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
