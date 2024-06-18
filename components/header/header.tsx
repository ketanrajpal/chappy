'use client'

import Logo from '@/assets/logo.png'
import Image from 'next/image'

import './header.scss'
import { useAppDispatch } from '@/services/redux'
import { logout } from '@/store/auth'
import { useRouter } from 'next/navigation'

export default function Header() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    return (
        <header>
            <div className="logo">
                <Image
                    src={Logo}
                    alt="Logo"
                    className="logo"
                    width={200}
                    priority
                />
            </div>
            <div className="menu">
                <button
                    onClick={() => {
                        dispatch(logout())
                        router.push('/')
                    }}
                >
                    <span className="material-symbols-rounded icon">
                        logout
                    </span>
                    <span>Logout</span>
                </button>
            </div>
        </header>
    )
}
