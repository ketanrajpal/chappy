'use client'

import { useAppDispatch, useAppSelector } from '@/services/redux'
import { logout } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { chats, DeleteChatAction } from './action'
import { Chat, deleteChat, setChats } from '@/store/chat'

import Loading from '@/assets/loader.svg'
import Image from 'next/image'

export default function Page() {
    const authState = useAppSelector((state) => state.auth)
    const chatState = useAppSelector((state) => state.chat)
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
            handleScroll()
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
                handleScroll()
            })
    }, [authState.username, dispatch])

    const handleScroll = () => {
        if (ref.current) {
            ref.current.scroll({
                top: ref.current.scrollHeight,
            })
        }
    }

    return loading ? (
        <Loader />
    ) : (
        <div className="chat-content" ref={ref}>
            <div className="chats">
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

function Loader() {
    return (
        <div className="loader">
            <Image src={Loading} alt="Loading" />
        </div>
    )
}
