import { chats } from '@/app/c/action'
import generateReply, { extractDocumentContent } from '@/services/google'
import { mediaToBase64 } from '@/services/media'
import { collection } from '@/services/mongo'
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
    const col = await collection()

    const body = await req.text()
    const data = parseQueryString(body)
    let query = data.Body

    if (data.MediaUrl0 !== undefined) {
        const media = await mediaToBase64(data.MediaUrl0)

        // if media not an image error
        if (media.type !== 'image/jpeg' && media.type !== 'image/png') {
            reply =
                'Oopsie-daisy! Looks like we only support images for now. Can you try sending an image instead? 🌟'

            error = true
        }

        if (error === false) {
            try {
                const content = await extractDocumentContent(media)
                await col.insertOne({
                    user: data.WaId,
                    part: content,
                    createdAt: new Date(),
                    role: 'user',
                    document: true,
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
            'Oopsie-daisy! Looks like our system had a little hiccup. Can you give it another whirl? 🌟'
    } else {
        await col.insertOne({
            user: data.WaId,
            part: data.Body,
            createdAt: new Date(),
            role: 'user',
            document: false,
        })

        await col.insertOne({
            user: data.WaId,
            part: reply,
            createdAt: new Date(),
            role: 'model',
            document: false,
        })
    }

    console.log(reply)

    const message = await client.messages.create({
        from: data.To,
        body: reply,
        to: data.From,
    })

    return NextResponse.json(message)
}
