'use client'

import { useAppDispatch, useAppSelector } from '@/services/redux'
import { logout } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { chats, DeleteChatAction } from './action'
import { Chat, deleteChat, setChats } from '@/store/chat'

import Loading from '@/assets/loader.svg'
import Image from 'next/image'
import { defaultChat } from '@/services/google'
import { setMessage } from '@/store/message'

export default function Page() {
    const authState = useAppSelector((state) => state.auth)
    const chatState = useAppSelector((state) => state.chat)
    const speechState = useAppSelector((state) => state.speech)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const ref = useRef<HTMLDivElement>(null)
    const [chatLength, setChatLength] = useState(0)

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!authState.authenticated) {
            dispatch(logout())
            router.push('/')
        }
    }, [authState.authenticated, router, dispatch])

    useEffect(() => {
        if (chatState.chats.length > chatLength) {
            setChatLength(chatState.chats.length)
            if (ref.current) {
                ref.current.scrollTo({
                    top: ref.current.scrollHeight,
                    behavior: 'smooth',
                })
            }
        }
    }, [chatState.chats, chatLength])

    useEffect(() => {
        setLoading(true)
        chats({ username: authState.username as string })
            .then((data) => {
                dispatch(setChats(data))
            })
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {
                setLoading(false)
                if (ref.current) {
                    ref.current.scrollTo({
                        top: ref.current.scrollHeight,
                    })
                    ref.current.scrollTop = ref.current.scrollHeight
                }
            })
    }, [authState.username, dispatch])

    return loading ? (
        <Loader />
    ) : (
        <div className="chat-content" ref={ref}>
            <div className="chats">
                <div className="chat model">
                    <div className="description">{defaultChat}</div>
                    <nav></nav>
                </div>
                {chatState.chats.map((chat) => (
                    <ChatBubble key={chat._id} chat={chat} />
                ))}
            </div>
        </div>
    )
}

function ChatBubble({ chat }: { readonly chat: Chat }) {
    return chat.role === 'user' ? (
        <div className="chat user">
            <nav>
                <DeleteChat chat={chat} />
            </nav>
            <div className="description">{chat.part}</div>
        </div>
    ) : (
        <div className="chat model">
            <div className="description">{chat.part}</div>
            <nav>
                <DeleteChat chat={chat} />
            </nav>
        </div>
    )
}

function DeleteChat({ chat }: { readonly chat: Chat }) {
    const dispatch = useAppDispatch()
    const handleDelete = () => {
        DeleteChatAction({ chat }).then((success) => {
            dispatch(deleteChat(chat._id))
            dispatch(
                setMessage({
                    type: 'success',
                    description: 'Message successfully deleted',
                })
            )
        })
    }

    return (
        <button className="delete" onClick={handleDelete}>
            <span className="material-symbols-rounded">delete</span>
        </button>
    )
}

function Loader() {
    return (
        <div className="loader">
            <Image src={Loading} alt="Loading" />
        </div>
    )
}
