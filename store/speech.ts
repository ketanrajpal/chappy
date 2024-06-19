import { AppState } from '@/services/redux'
import { createSlice } from '@reduxjs/toolkit'

export type Speech = {
    output: boolean
}

export const initialSpeechState: Speech = {
    output: false,
}

export const SpeechSlice = createSlice({
    name: 'speech',
    initialState: initialSpeechState,
    reducers: {
        setOutput: (state, action) => {
            state.output = action.payload
        },
    },
})

export const { setOutput } = SpeechSlice.actions
export const speechState = (state: AppState) => state.speech
export const speechReducer = SpeechSlice.reducer
