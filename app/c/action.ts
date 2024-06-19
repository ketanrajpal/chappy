'use server'

import { collection } from '@/services/mongo'
import { Chat } from '@/store/chat'
import { ChatSchema, ChatState } from './schema'
import generateReply from '@/services/google'
import { ObjectId } from 'mongodb'

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
    const text = await generateReply(allChats, part)

    //await new Promise((resolve) => setTimeout(resolve, 100000))
    //const text = 'Hello'

    const col = await collection()
    const userChat: Pick<Chat, 'user' | 'part' | 'createdAt' | 'role'> = {
        user,
        part,
        createdAt: new Date(),
        role: 'user',
    }

    const userInsert = await col.insertOne({
        user: userChat.user,
        part: userChat.part,
        createdAt: userChat.createdAt,
        role: userChat.role,
    })

    const modelChat: Pick<Chat, 'user' | 'part' | 'createdAt' | 'role'> = {
        user,
        part: text,
        createdAt: new Date(),
        role: 'model',
    }

    const modelInsert = await col.insertOne({
        user: modelChat.user,
        part: modelChat.part,
        createdAt: modelChat.createdAt,
        role: modelChat.role,
    })

    const chatData: Chat[] = [
        { ...userChat, _id: userInsert.insertedId.toString() },
        { ...modelChat, _id: modelInsert.insertedId.toString() },
    ]

    return {
        success: true,
        error: false,
        serverError: false,
        chat: chatData,
    }
}
