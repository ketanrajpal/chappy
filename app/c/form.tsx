'use client'

import { useFormState } from 'react-dom'
import { create, uploadFileGeneration } from './action'
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
import Resizer from 'react-image-file-resizer'
import { v4 as uuid } from 'uuid'

export function ChatForm() {
    const [state, formAction] = useFormState(create, initialChatState)
    const authState = useAppSelector((state) => state.auth)
    const chatState = useAppSelector((state) => state.chat)
    const speechState = useAppSelector((state) => state.speech)
    const dispatch = useAppDispatch()
    const ref = useRef<HTMLFormElement>(null)
    const [loading, setLoading] = useState(false)
    const { transcript, listening } = useSpeechRecognition()

    const inputFileRef = useRef<HTMLInputElement>(null)

    const [text, setText] = useState('')
    const [speaking, setSpeaking] = useState(false)
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
            setText('')
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
        if (!listening && text && speaking) {
            if (ref) {
                ref.current?.requestSubmit()
                setSpeaking(false)
            }
        }
    }, [listening, text, speaking])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (inputFileRef.current?.files) {
            const file = inputFileRef.current.files[0]
            setLoading(true)
            resizeFile(file)
                .then((uri) => {
                    const ext = file.name.split('.').pop()
                    fetch(`/api/upload?filename=${uuid().toString()}.${ext}`, {
                        method: 'POST',
                        body: uri,
                    })
                        .then((data) => data.json())
                        .then((res) => {
                            uploadFileGeneration(
                                res.url,
                                authState.username as string
                            )
                                .then((chat) => {
                                    dispatch(createChat(chat))
                                })
                                .catch((error) => {
                                    dispatch(
                                        setMessage({
                                            description: error.message,
                                            type: 'error',
                                        })
                                    )
                                })
                                .finally(() => {
                                    setLoading(false)
                                    if (inputFileRef.current)
                                        inputFileRef.current.value = ''
                                })
                        })
                        .catch((error) => {
                            dispatch(
                                setMessage({
                                    description: error.message,
                                    type: 'error',
                                })
                            )
                            setLoading(false)
                        })
                })
                .catch((error) => {
                    dispatch(
                        setMessage({
                            description: error.message,
                            type: 'error',
                        })
                    )
                    setLoading(false)
                })
        }
    }

    return (
        <>
            <input
                name="file"
                id="file"
                ref={inputFileRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleChange}
            />
            <form
                action={formAction}
                autoComplete="off"
                ref={ref}
                className={state.error ? 'error' : ''}
            >
                <div className="container">
                    <input
                        name="user"
                        type="hidden"
                        value={authState.username}
                    />

                    <input
                        type="text"
                        placeholder="Type your message here"
                        name="part"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <button
                        className="upload"
                        type="button"
                        onClick={() => {
                            document.getElementById('file')?.click()
                        }}
                        disabled={loading}
                    >
                        <span className="material-symbols-rounded icon">
                            image
                        </span>
                    </button>

                    <button
                        className="record"
                        type="button"
                        disabled={loading}
                        onClick={() => {
                            SpeechRecognition.startListening()
                            setSpeaking(true)
                        }}
                    >
                        <span className="material-symbols-rounded icon">
                            {listening ? 'radio_button_checked' : 'mic'}
                        </span>
                    </button>
                    <Button label="Send" loading={loading} />
                </div>
            </form>
        </>
    )
}

const resizeFile = (file: File) =>
    new Promise<File>((resolve) => {
        Resizer.imageFileResizer(
            file,
            1200,
            900,
            'PNG',
            100,
            0,
            (uri) => {
                resolve(uri as File)
            },
            'file'
        )
    })
