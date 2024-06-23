import type { Metadata } from 'next'

import './chat.scss'
import Header from '@/components/header/header'
import { ChatForm } from './form'
import { defaultChat } from '@/services/google'

export const metadata: Metadata = {
    title: 'Chat with Chappy',
    description: defaultChat,
}

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="chat-container">
            <Header />
            {children}
            <ChatForm />
        </div>
    )
}
