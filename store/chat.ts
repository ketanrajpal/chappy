import { AppState } from '@/services/redux'
import { createSlice } from '@reduxjs/toolkit'

export type Chat = {
    _id: string
    role: 'user' | 'model'
    part: string
    createdAt: Date
    user: string
}

export type ChatState = {
    chats: Chat[]
}

export const initialState: ChatState = {
    chats: [],
}

export const ChatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChats: (state, action) => {
            state.chats = action.payload
        },
        createChat: (state, action) => {
            state.chats.push(action.payload)
        },
        deleteChat: (state, action) => {
            console.log(action.payload)
            console.log(
                state.chats.filter((chat) => chat._id == action.payload)
            )

            state.chats = state.chats.filter(
                (chat) => chat._id !== action.payload
            )
        },
    },
})

export const { setChats, createChat, deleteChat } = ChatSlice.actions
export const chatState = (state: AppState) => state.chat
export const chatReducer = ChatSlice.reducer
