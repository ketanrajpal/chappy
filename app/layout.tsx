import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'normalize.css/normalize.css'
import '@/styles/default.scss'
import StoreProvider from '@/services/redux'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <StoreProvider>{children}</StoreProvider>
            </body>
        </html>
    )
}
