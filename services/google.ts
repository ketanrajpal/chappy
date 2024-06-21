import { Chat } from '@/store/chat'
import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
} from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(
    process.env.REACT_APP_GEMINI_API_KEY as string
)

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
]

export const defaultChat =
    'Hey there! 🎉 I am Chappy, your friendly, chat buddy. Got a question? Fire away! 🤔💬 Lets make some magic happen! ✨🌈'

export default async function generateReply(chat: Chat[], message: string) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        safetySettings,
    })
    const chat_history = [
        {
            role: 'user',
            parts: [
                {
                    text: defaultChat,
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

    const msg = `${message}. Answer in 50 words in UK English. Also add relevant emojis and be creative and engaging.`

    const result = await modelChat.sendMessage(msg)
    const response = result.response
    const text = response.text()

    return text
}
