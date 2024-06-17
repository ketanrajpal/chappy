import { Chat } from '@/store/chat'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(
    process.env.REACT_APP_GEMINI_API_KEY as string
)

export default async function generateReply(chat: Chat[], message: string) {
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

    chat.forEach((c) => {
        chat_history.push({
            role: c.role,
            parts: [{ text: c.part }],
        })
    })

    const modelChat = model.startChat({
        history: chat_history,
        generationConfig: {
            maxOutputTokens: 100,
        },
    })

    const msg = `${message}. Answer in 50 words in UK English. Also add relevant emojis and be creative and quirky`

    const result = await modelChat.sendMessage(msg)
    const response = result.response
    const text = response.text()

    return text
}
