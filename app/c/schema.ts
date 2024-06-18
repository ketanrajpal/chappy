import { Chat } from '@/store/chat'
import { z } from 'zod'

export type ChatState = {
    success: boolean
    error: boolean
    serverError: boolean
    chat: Chat[] | undefined
}

export const ChatSchema = z.object({
    user: z.string().min(2),
    part: z.string().min(2),
})

export const initialChatState: ChatState = {
    success: false,
    serverError: false,
    error: false,
    chat: undefined,
}