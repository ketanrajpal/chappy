import type { Metadata } from 'next'

import './chat.scss'
import Header from '@/components/header/header'
import ChatForm from './form'

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app',
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