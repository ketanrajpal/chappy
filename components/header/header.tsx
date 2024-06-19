'use client'

import Logo from '@/assets/logo.svg'
import Image from 'next/image'

import './header.scss'
import { useAppDispatch, useAppSelector } from '@/services/redux'
import { logout } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { setOutput } from '@/store/speech'

export default function Header() {
    const speechState = useAppSelector((state) => state.speech)
    const dispatch = useAppDispatch()
    const router = useRouter()
    return (
        <header>
            <div className="logo">
                <Image
                    src={Logo}
                    alt="Logo"
                    className="logo"
                    width={220}
                    priority
                />
            </div>
            <div className="menu">
                <nav>
                    <button
                        onClick={() => {
                            dispatch(setOutput(!speechState.output))
                        }}
                    >
                        <span className="material-symbols-rounded icon">
                            {speechState.output ? 'volume_up' : 'volume_off'}
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            dispatch(logout())
                            router.push('/')
                        }}
                    >
                        <span className="material-symbols-rounded icon">
                            logout
                        </span>
                    </button>
                </nav>
            </div>
        </header>
    )
}
