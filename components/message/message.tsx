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
                return 'error'
            case 'success':
                return 'task_alt'
            case 'warning':
                return 'warning'
            case 'info':
                return 'info'
            default:
                return ''
        }
    }

    return (
        messageState.type &&
        messageState.description && (
            <div className="message">
                <div className={`container ${messageState.type}`}>
                    <span className="material-symbols-rounded">
                        {messageType(messageState.type)}
                    </span>

                    <p>{messageState.description}</p>
                </div>
            </div>
        )
    )
}
