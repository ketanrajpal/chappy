const { GoogleGenerativeAI } = require('@google/generative-ai')
const { MongoClient, ServerApiVersion } = require('mongodb')

// create a new instance of the GoogleGenerativeAI class
const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI)

// create a new instance of the MongoClient class
const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})

safety_settings = [
    {
        category: 'HARM_CATEGORY_DANGEROUS',
        threshold: 'BLOCK_NONE',
    },
    {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
    },
    {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
    },
    {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
    },
    {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
    },
]
exports.handler = async function (context, event, callback) {
    // get the user's phone number
    const user = event.currentUser.split(':+')[1]

    // get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const chat_history = [
        {
            role: 'user',
            parts: [
                {
                    text: `Hey there, fabulous human! 🎉 I am Chappy, your friendly, quirky chat buddy. Got a question? Fire away! 🤔💬 Lets make some magic happen! ✨🌈`,
                },
            ],
        },
        {
            role: 'model',
            parts: [
                { text: 'Great to meet you. What would you like to know?' },
            ],
        },
    ]

    // connect to the MongoDB database
    await client.connect()
    const database = client.db('gemini')
    const collection = database.collection('chat')

    // get the chat
    const chat = await collection.find({ user: user, role: 'user' }).toArray()
    if (chat.length > 0) {
        chat.forEach((doc) => {
            chat_history.push({
                role: doc.role,
                parts: [{ text: doc.part }],
            })
        })
    }

    const modelChat = model.startChat({
        history: chat_history,
        generationConfig: {
            maxOutputTokens: 100,
        },
    })

    // get the user's message
    const message = event.inbound
    const msg = `${message}. Answer in 50 words in UK English. Also add relevant emojis and be creative and quirky`

    const result = await modelChat.sendMessage(msg, { safety_settings })
    const response = await result.response
    const text = response.text()

    // insert the chat into the MongoDB database
    await collection.insertMany([
        { role: 'user', part: message, createdAt: new Date(), user: user },
        { role: 'model', part: text, createdAt: new Date(), user: user },
    ])
    await client.close()

    // return the response
    return callback(null, {
        text: text,
    })
}
