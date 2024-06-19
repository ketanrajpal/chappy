import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'normalize.css/normalize.css'
import '@/styles/import.css'
import '@/styles/reset.scss'

import StoreProvider from '@/services/redux'
import Message from '@/components/message/message'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Meet Chappy: Your Friendly and Quirky Chat Buddy',
    description:
        'Hey there, fabulous human! I am Chappy, your friendly, quirky chat buddy. Got a question? Fire away! Let’s make some magic happen together!',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <StoreProvider>
                    {children}
                    <Message />
                </StoreProvider>
            </body>
        </html>
    )
}
