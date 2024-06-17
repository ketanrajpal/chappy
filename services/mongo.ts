import { MongoClient, ServerApiVersion } from 'mongodb'

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
