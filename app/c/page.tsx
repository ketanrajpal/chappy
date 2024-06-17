'use client'

import { useAppDispatch, useAppSelector } from '@/services/redux'
import { logout } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useRef, useState } from 'react'
import { chats, create, DeleteChatAction } from './action'
import { initialChatState } from './schema'
import { useFormState } from 'react-dom'
import { Chat, createChat, deleteChat, setChats } from '@/store/chat'
import Button from '@/components/button/button'

export default function Page() {
    const authState = useAppSelector((state) => state.auth)
    const chatState = useAppSelector((state) => state.chat)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const ref = useRef<HTMLDivElement>(null)
    const [chatLength, setChatLength] = useState(0)

    useEffect(() => {
        if (!authState.authenticated) {
            dispatch(logout())
            router.push('/')
        }
    }, [authState.authenticated, router, dispatch])

    useEffect(() => {
        if (chatState.chats.length > chatLength) {
            const element = ref.current
            if (element) {
                element.scrollTop = element.scrollHeight
            }
            setChatLength(chatState.chats.length)
        }
    }, [chatState.chats, chatLength])

    useEffect(() => {
        chats({ username: authState.username as string })
            .then((data) => {
                dispatch(setChats(data))
            })
            .catch((err) => {
                console.log(err)
            })
    }, [authState.username, dispatch])

    return (
        <Fragment>
            <div className="shadow"></div>
            <div className="chats" ref={ref}>
                {chatState.chats.map((chat) => (
                    <ChatBubble key={chat._id} chat={chat} />
                ))}
            </div>
            <ChatForm />
        </Fragment>
    )
}

function ChatForm() {
    const [state, formAction] = useFormState(create, initialChatState)
    const authState = useAppSelector((state) => state.auth)
    const chatState = useAppSelector((state) => state.chat)
    const dispatch = useAppDispatch()
    const ref = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.success) {
            if (state.chat && state.chat.length > 0) {
                state.chat.forEach((chat) => {
                    if (!chatState.chats.find((c) => c._id === chat._id)) {
                        dispatch(createChat(chat))
                    }
                })
            }
            ref.current?.reset()
        }
    }, [state.success, dispatch, state.chat, chatState.chats])

    return (
        <div className={`chat-form ${state.error ? 'error' : ''}`}>
            <form action={formAction} autoComplete="off" ref={ref}>
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
                    />
                    <Button label="Send" />
                </div>
            </form>
        </div>
    )
}

function ChatBubble({ chat }: { readonly chat: Chat }) {
    return chat.role === 'user' ? (
        <div className="chat user">
            <div className="message">{chat.part}</div>
            <nav>
                <DeleteChat chat={chat} />
            </nav>
        </div>
    ) : (
        <div className="chat model">
            <nav>
                <DeleteChat chat={chat} />
            </nav>
            <div className="message">{chat.part}</div>
        </div>
    )
}

function DeleteChat({ chat }: { readonly chat: Chat }) {
    const dispatch = useAppDispatch()
    const chatState = useAppSelector((state) => state.chat)

    const handleDelete = () => {
        console.table(chatState.chats)
        DeleteChatAction({ chat }).then((success) => {
            console.log(success)
            dispatch(deleteChat(chat._id))
        })
    }

    return (
        <button className="delete" onClick={handleDelete}>
            <span className="material-symbols-rounded">delete</span>
        </button>
    )
}
