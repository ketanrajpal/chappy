import { chats } from '@/app/c/action'
import generateReply, { extractDocumentContent } from '@/services/google'
import { collection } from '@/services/mongo'
import { client } from '@/services/twilio'
import { NextRequest, NextResponse } from 'next/server'
import { readMedia } from '@/services/media'

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

export async function POST(request: NextRequest) {
    let reply: string = ''
    let error: boolean = false
    let content: string = ''
    const col = await collection()

    const body = await request.text()
    const data = parseQueryString(body)

    if (data.MediaUrl0 !== undefined) {
        const media = await readMedia(data.MediaUrl0)
        if (media === null) {
            error = true
        } else {
            try {
                content = await extractDocumentContent(media)
                console.log(content)
                await col.insertOne({
                    user: data.WaId,
                    part: content,
                    createdAt: new Date(),
                    role: 'document',
                })
            } catch (err: any) {
                console.error(err)
                error = true
            }
        }
    }

    if (error === false) {
        const allChats = await chats({ username: data.WaId })

        try {
            reply = await generateReply(allChats, data.Body)
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
        })

        await col.insertOne({
            user: data.WaId,
            part: reply,
            createdAt: new Date(),
            role: 'model',
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
