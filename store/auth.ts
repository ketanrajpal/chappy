import { AppState } from '@/services/redux'
import { createSlice } from '@reduxjs/toolkit'

export type Country = {
    name: string
    phone: string
    flag: string
}

export type User = {
    country: Country
    phone: string
}

export type Auth = {
    user: User | undefined
    username?: string
    authenticated: boolean
    counter: number
}

export const initialState: Auth = {
    user: undefined,
    authenticated: false,
    counter: 0,
}

export const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        login: (state, action) => {
            state.user = action.payload.user
            state.username = action.payload.username
            state.authenticated = true
        },
        logout: (state) => {
            state.user = undefined
            state.authenticated = false
            state.counter = 0
            state.username = undefined
        },
        counter: (state) => {
            state.counter = state.counter + 1
        },
    },
})

export const { setUser, login, logout, counter } = AuthSlice.actions
export const authState = (state: AppState) => state.auth
export const authReducer = AuthSlice.reducer
