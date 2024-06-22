import { Chat } from '@/store/chat'
import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
} from '@google/generative-ai'
import { Media } from './media'

export const genAI = new GoogleGenerativeAI(
    process.env.REACT_APP_GEMINI_API_KEY as string
)

export const safetySettings = [
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

export const defaultChat = `Hey! 😊 I am Chappy, your friendly chat buddy. Got a question? Just ask! Let's make some magic together! ✨🌟`

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

    chat = chat.slice(-20)

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

    const msg = `${message}. Answer in 50 words in UK English. Also add relevant emojis and be casual and friendly. And also be respectful.`

    const result = await modelChat.sendMessage(msg)
    const response = result.response
    const text = response.text()

    return text
}

export async function extractDocumentContent(media: Media) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        safetySettings,
    })

    const result = await model.generateContent([
        'Extract all the content from the image. Include all the text and any other relevant information. Also if there is no text, then describe the image.',
        media.media,
    ])

    const response = result.response
    const text = response.text()

    return text
}
