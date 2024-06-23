'use server'

import { collection } from '@/services/mongo'
import { Chat } from '@/store/chat'
import { ChatSchema, ChatState } from './schema'
import generateReply, { extractDocumentContent } from '@/services/google'
import { InsertOneResult, ObjectId } from 'mongodb'
import { mediaToBase64 } from '@/services/media'

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
    const col = await collection()

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

    const userChat: Pick<
        Chat,
        'user' | 'part' | 'createdAt' | 'role' | 'document'
    > = {
        user,
        part,
        createdAt: new Date(),
        role: 'user',
        document: false,
    }

    const userInsert = await col.insertOne({
        user: userChat.user,
        part: userChat.part,
        createdAt: userChat.createdAt,
        role: userChat.role,
        document: false,
    })

    const modelChat: Pick<
        Chat,
        'user' | 'part' | 'createdAt' | 'role' | 'document'
    > = {
        user,
        part: text,
        createdAt: new Date(),
        role: 'model',
        document: false,
    }

    const modelInsert = await col.insertOne({
        user: modelChat.user,
        part: modelChat.part,
        createdAt: modelChat.createdAt,
        role: modelChat.role,
        document: false,
    })

    const chatData: Chat[] = [
        { ...userChat, _id: userInsert.insertedId.toString() },
        { ...modelChat, _id: modelInsert.insertedId.toString() },
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
    const col = await collection()
    const media = await mediaToBase64(url)
    let insert: InsertOneResult<Document> | undefined
    let content: string = ''

    if (
        media.type !== 'image/jpeg' &&
        media.type !== 'image/png' &&
        media.type !== 'image/jpg' &&
        media.type !== 'image/gif'
    ) {
        throw new Error('Invalid file type')
    }

    try {
        content = await extractDocumentContent(media)
        insert = await col.insertOne({
            user: user,
            part: content,
            createdAt: new Date(),
            role: 'user',
            document: true,
            documentUrl: url,
        })
    } catch (err: any) {
        console.error(err)

        throw new Error('Error extracting content')
    }

    if (insert) {
        return {
            _id: insert.insertedId.toString(),
            user: user,
            part: content,
            createdAt: new Date(),
            role: 'user',
            document: true,
            documentUrl: url,
        }
    }

    throw new Error('Error inserting document')
}
