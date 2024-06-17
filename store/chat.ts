import { AppState } from '@/services/redux'
import { createSlice } from '@reduxjs/toolkit'

export type Chat = {
    _id: string
    role: 'user' | 'model'
    part: string
    createdAt: Date
    user: string
}

const firstChat =
    'Hey there, fabulous human! 🎉 I’m Chappy, your friendly, quirky chat buddy. Got a question? Fire away! 🤔💬 Let’s make some magic happen! ✨🌈'

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
            state.chats.unshift({
                _id: '0',
                role: 'model',
                part: firstChat,
                user: action.payload[0].user,
                createdAt: action.payload[0].createdAt,
            })
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
