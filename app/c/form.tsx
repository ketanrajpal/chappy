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
import 'regenerator-runtime/runtime'
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition'

export function ChatForm() {
    const [state, formAction] = useFormState(create, initialChatState)
    const authState = useAppSelector((state) => state.auth)
    const chatState = useAppSelector((state) => state.chat)
    const speechState = useAppSelector((state) => state.speech)
    const dispatch = useAppDispatch()
    const ref = useRef<HTMLFormElement>(null)
    const [loading, setLoading] = useState(false)
    const { transcript, listening } = useSpeechRecognition()

    const [text, setText] = useState('')

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

    useEffect(() => {
        if (transcript) setText(transcript)
    }, [transcript])

    useEffect(() => {
        if (!listening && text) {
            if (ref) {
                ref.current?.requestSubmit()
            }
        }
    }, [listening, text])

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
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button
                    className="record"
                    type="button"
                    onClick={() => SpeechRecognition.startListening()}
                >
                    <span className="material-symbols-rounded icon">
                        {listening ? 'radio_button_checked' : 'mic'}
                    </span>
                </button>
                <Button label="Send" loading={loading} />
            </div>
        </form>
    )
}
