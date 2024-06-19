import { AppState } from '@/services/redux'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export type Message = {
    type?: 'error' | 'success' | 'warning' | 'info'
    description?: string
}

export const initialState: Message = {}

export const MessageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        setMessage: (state, action: PayloadAction<Message>) => {
            state.type = action.payload.type
            state.description = action.payload.description
        },
        clearMessage: (state) => {
            state.type = undefined
            state.description = undefined
        },
    },
})

export const { setMessage, clearMessage } = MessageSlice.actions
export const messageState = (state: AppState) => state.message
export const messageReducer = MessageSlice.reducer
