import { Chat } from '@/store/chat'
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'

const client = new MongoClient(process.env.REACT_APP_MONGODB_URI as string, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})

export async function collection() {
    await client.connect()
    const database = client.db('gemini')
    const collection = database.collection('chat')
    return collection
}

export async function insertChat(
    chat: Pick<Chat, 'role' | 'part' | 'user' | 'type' | 'url'>
) {
    const col = await collection()
    const insert = await col.insertOne({ ...chat, createdAt: new Date() })
    return insert
}

export async function readChat(_id: ObjectId) {
    const col = await collection()
    const chat = await col.findOne({
        _id,
    })
    return chat
}
