'use client'

import { useAppDispatch, useAppSelector } from '@/services/redux'
import { clearMessage } from '@/store/message'
import { useEffect } from 'react'

import './message.scss'

export default function Message() {
    const messageState = useAppSelector((state) => state.message)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (messageState.description && messageState.type) {
            setTimeout(() => {
                dispatch(clearMessage())
            }, 3000)
        }
    }, [messageState, dispatch])

    const messageType = (type: string) => {
        switch (type) {
            case 'error':
                return '❌'
            case 'success':
                return '✅'
            case 'warning':
                return '⚠️'
            case 'info':
                return 'ℹ️'
            default:
                return ''
        }
    }

    return (
        messageState.type &&
        messageState.description && (
            <div className="message">
                <span className="material-symbols-rounded">
                    {messageType(messageState.type)}
                </span>
                <p>{messageState.description}</p>
            </div>
        )
    )
}
