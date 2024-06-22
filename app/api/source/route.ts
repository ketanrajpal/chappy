import { chats } from '@/app/c/action'
import generateReply from '@/services/google'
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

export async function POST(request: NextRequest) {
    let reply: string = ''
    let error: boolean = false

    const body = await request.text()
    const data = parseQueryString(body)

    const allChats = await chats({ username: data.WaId })

    try {
        reply = await generateReply(allChats, data.Body)
    } catch (err: any) {
        console.error(err)
        error = true
    }

    if (error) {
        reply =
            'Oopsie-daisy! Looks like our system had a little hiccup. Can you give it another whirl? 🌟'
    } else {
        const col = await collection()

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
        from: 'whatsapp:+14155238886',
        body: reply,
        to: data.From,
    })

    return NextResponse.json(message)
}
