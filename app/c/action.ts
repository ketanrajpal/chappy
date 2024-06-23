'use server'

import { collection, insertChat, readChat } from '@/services/mongo'
import { Chat } from '@/store/chat'
import { ChatSchema, ChatState } from './schema'
import generateReply, { extractDocumentContent } from '@/services/google'
import { InsertOneResult, ObjectId } from 'mongodb'
import { mediaToBase64Blob } from '@/services/media'
import { client } from '@/services/twilio'

export async function chats({
    username,
}: {
    username: string
}): Promise<Chat[]> {
    const col = await collection()
    const find = col.find({ user: username })
    const data = await find.toArray()

    return data.map((d) => ({
        ...d,
        _id: d._id.toString(),
    })) as Chat[]
}

export async function DeleteChatAction({ chat }: { chat: Chat }) {
    const col = await collection()
    const del = await col.deleteOne({ _id: new ObjectId(chat._id) })

    return del.deletedCount === 1
}

export async function create(
    previousState: ChatState,
    formData: FormData
): Promise<ChatState> {
    const user = formData.get('user') as string
    const part = formData.get('part') as string

    const result = ChatSchema.safeParse({ user, part })

    if (!result.success) {
        return {
            ...previousState,
            error: true,
        }
    }

    const allChats = await chats({ username: user })

    let text: string

    try {
        text = await generateReply(allChats, part)
    } catch (error: any) {
        return {
            ...previousState,
            error: true,
            serverError: error.message,
        }
    }

    const userInsert = await insertChat({
        user,
        part,
        role: 'user',
        type: 'text',
    })

    const modelInsert = await insertChat({
        user,
        part: text,
        role: 'model',
        type: 'text',
    })

    const userChat = await readChat(userInsert.insertedId)
    const modelChat = await readChat(modelInsert.insertedId)

    if (!userChat || !modelChat) {
        return {
            ...previousState,
            error: true,
            serverError: 'Error reading chat',
        }
    }

    const chatData: Chat[] = [
        {
            _id: userChat._id.toString(),
            role: userChat.role,
            part: userChat.part,
            createdAt: userChat.createdAt,
            user: userChat.user,
            type: userChat.type,
        },
        {
            _id: modelChat._id.toString(),
            role: modelChat.role,
            part: modelChat.part,
            createdAt: modelChat.createdAt,
            user: modelChat.user,
            type: modelChat.type,
        },
    ]

    return {
        success: true,
        error: false,
        serverError: undefined,
        chat: chatData,
    }
}

export async function uploadFileGeneration(
    url: string,
    user: string
): Promise<Chat> {
    const media = await mediaToBase64Blob(url)
    let insert: InsertOneResult<Document> | undefined
    let content: string = ''

    console.log(media)

    if (
        !['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(
            media.type
        )
    ) {
        throw new Error('Invalid file type')
    }

    try {
        content = await extractDocumentContent(media)
        insert = await insertChat({
            user: user,
            part: content,
            role: 'user',
            type: 'image',
            url: url,
        })
    } catch (err: any) {
        throw new Error('Error extracting content')
    }

    if (insert) {
        return {
            _id: insert.insertedId.toString(),
            user: user,
            part: content,
            createdAt: new Date(),
            role: 'user',
            type: 'image',
            url: url,
        }
    }

    throw new Error('Error inserting document')
}

export async function sendToWhatsApp(chat: Chat): Promise<boolean> {
    return new Promise((resolve, reject) => {
        return client.messages
            .create({
                from: 'whatsapp:+14155238886',
                body: chat.part,
                to: `whatsapp:+${chat.user}`,
            })
            .then((message) => {
                resolve(true)
            })
            .catch((error) => {
                reject(false)
            })
    })
}
