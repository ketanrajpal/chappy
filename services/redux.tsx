'use client'

import { authReducer } from '@/store/auth'
import { chatReducer } from '@/store/chat'
import { messageReducer } from '@/store/message'
import { timerReducer } from '@/store/timer'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { ReactNode, useRef } from 'react'
import {
    Provider,
    TypedUseSelectorHook,
    useDispatch,
    useSelector,
    useStore,
} from 'react-redux'
import { persistReducer } from 'redux-persist'
import persistStore from 'redux-persist/es/persistStore'
import { PersistGate } from 'redux-persist/integration/react'
import storage from 'redux-persist/lib/storage'
import { thunk } from 'redux-thunk'

const persistConfig = {
    key: 'root',
    storage,
}

const persistedReducer = persistReducer(
    persistConfig,
    combineReducers({
        auth: authReducer,
        timer: timerReducer,
        chat: chatReducer,
        message: messageReducer,
    })
)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(thunk),
})

export const makeStore = () => store

const persistor = persistStore(store)

type AppStore = ReturnType<typeof makeStore>
export type AppState = ReturnType<AppStore['getState']>
type AppDispatch = AppStore['dispatch']

type DispatchFunc = () => AppDispatch
export const useAppDispatch: DispatchFunc = useDispatch
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
export const useAppStore: () => AppStore = useStore

/** stored provider */
export default function StoreProvider({
    children,
}: {
    readonly children: ReactNode
}) {
    const storeRef = useRef<AppStore>()
    if (!storeRef.current) {
        storeRef.current = makeStore()
    }

    return (
        <Provider store={storeRef.current}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    )
}
