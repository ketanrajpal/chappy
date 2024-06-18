import type { Metadata } from 'next'

import './chat.scss'
import Header from '@/components/header/header'
import ChatForm from './form'

export const metadata: Metadata = {
    title: 'Chat with Chappy',
    description:
        'Hey there, fabulous human! I am Chappy, your friendly, quirky chat buddy. Got a question? Fire away! Let’s make some magic happen together!',
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
