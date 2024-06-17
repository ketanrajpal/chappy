import { AppState } from '@/services/redux'
import { createSlice } from '@reduxjs/toolkit'

export type Timer = {
    start: number
    end: number
    duration: number
}

export const initialState: Timer = {
    start: 0,
    end: 0,
    duration: 120000,
}

export const TimerSlice = createSlice({
    name: 'timer',
    initialState,
    reducers: {
        start: (state, action: { payload: { duration: number } }) => {
            state.start = Date.now()
            state.duration = action.payload.duration
            state.end = state.start + state.duration
        },
        reset: (state) => {
            state.start = 0
            state.end = 0
            state.duration = 120000
        },
    },
})

export const { start, reset } = TimerSlice.actions
export const timerState = (state: AppState) => state.timer
export const timerReducer = TimerSlice.reducer
