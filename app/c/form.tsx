'use client'

import { useFormState } from 'react-dom'
import { create } from './action'
import { initialChatState } from './schema'
import { useAppDispatch, useAppSelector } from '@/services/redux'
import { useEffect, useRef, useState } from 'react'
import { createChat } from '@/store/chat'
import Button from '@/components/button/button'
import { setMessage } from '@/store/message'
import speak from '@/services/polly'

export default function ChatForm() {
    const [state, formAction] = useFormState(create, initialChatState)
    const authState = useAppSelector((state) => state.auth)
    const chatState = useAppSelector((state) => state.chat)
    const speechState = useAppSelector((state) => state.speech)
    const dispatch = useAppDispatch()
    const ref = useRef<HTMLFormElement>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (state.serverError) {
            dispatch(
                setMessage({ description: state.serverError, type: 'error' })
            )
        }
    }, [state.serverError, dispatch])

    useEffect(() => {
        if (state.success) {
            if (state.chat && state.chat.length > 0) {
                state.chat.forEach((chat) => {
                    if (!chatState.chats.find((c) => c._id === chat._id)) {
                        dispatch(createChat(chat))
                        if (speechState.output) {
                            setLoading(true)
                            if (chat.role === 'model') {
                                speak(chat.part).then((data) => {
                                    const audio = new Audio(data)
                                    audio.play()
                                    audio.onended = () => {
                                        setLoading(false)
                                    }
                                })
                            }
                        }
                    }
                })
            }
            ref.current?.reset()
        }
    }, [
        state.success,
        dispatch,
        state.chat,
        chatState.chats,
        speechState.output,
    ])

    return (
        <form
            action={formAction}
            autoComplete="off"
            ref={ref}
            className={state.error ? 'error' : ''}
        >
            <div className="container">
                <input name="user" type="hidden" value={authState.username} />
                <input
                    type="text"
                    placeholder="Type your message here"
                    name="part"
                />

                <Button label="Send" loading={loading} />
            </div>
        </form>
    )
}
