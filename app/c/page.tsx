'use client'

import { useAppDispatch, useAppSelector } from '@/services/redux'
import { logout } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
    const authState = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const router = useRouter()

    useEffect(() => {
        if (!authState.authenticated) {
            dispatch(logout())
            router.push('/')
        }
    }, [authState.authenticated, router, dispatch])

    return (
        <div>
            <h1>Page</h1>
        </div>
    )
}
