'use client'

import SelectCountry from '@/components/select-country/select-country'

import './login.scss'
import { useFormState } from 'react-dom'

import { Login, Resend, Verify } from '@/app/action'
import { initialState } from './schema'
import OTPInput from 'react-otp-input'
import { useEffect, useState } from 'react'

import Logo from '@/assets/logo.svg'
import Image from 'next/image'
import { useAppDispatch, useAppSelector } from '@/services/redux'
import { counter, login, setUser } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { reset, start } from '@/store/timer'
import Button from '@/components/button/button'
import useMessage from '@/hooks/message'

export default function Home() {
    const authState = useAppSelector((state) => state.auth)
    const router = useRouter()

    useEffect(() => {
        if (authState.authenticated) router.push('/c')
    }, [authState.authenticated, router])

    return (
        <div className="auth">
            <div className="auth-container">
                <Image
                    src={Logo}
                    alt="Logo"
                    className="logo"
                    width={300}
                    priority
                />
                <LoginForm />

                {authState.user && <VerifyForm />}
            </div>
        </div>
    )
}

function LoginForm() {
    const [state, formAction] = useFormState(Login, initialState)
    const authState = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const message = useMessage()

    useEffect(() => {
        if (state.success) {
            dispatch(setUser(state.user))
            dispatch(counter())
        }
    }, [state.success, dispatch, state.user])

    useEffect(() => {
        if (state.serverError) {
            message.set({
                type: 'error',
                description: 'Server error. Try again later.',
            })
        }
    }, [state.serverError, message])

    return (
        <form action={formAction} autoComplete="off">
            <div className={`country-phone ${state.error ? 'error' : ''}`}>
                <SelectCountry
                    disabled={!!authState.user}
                    value={authState.user?.country}
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Phone number"
                    disabled={!!authState.user}
                    value={authState.user?.phone}
                />
            </div>

            {!authState.authenticated && !authState.user && (
                <Button label="Login" />
            )}
        </form>
    )
}

function VerifyForm() {
    const [otp, setOtp] = useState('')
    const [state, formAction] = useFormState(Verify, initialState)
    const dispatch = useAppDispatch()
    const appState = useAppSelector((state) => state.auth)
    const router = useRouter()

    useEffect(() => {
        if (state.success && state.username) {
            dispatch(login({ user: state.user, username: state.username }))
            router.push('/c')
        }
    }, [state.success, dispatch, state.user, state.username, router])

    if (appState.user) {
        return (
            <form action={formAction} autoComplete="off">
                <input
                    type="hidden"
                    name="country"
                    value={JSON.stringify(appState.user.country)}
                />
                <input type="hidden" name="phone" value={appState.user.phone} />
                <input type="hidden" name="otp" value={otp} />
                <div className={`otp-container ${state.error ? 'error' : ''}`}>
                    <OTPInput
                        value={otp}
                        onChange={setOtp}
                        numInputs={6}
                        renderInput={(props) => <input {...props} />}
                        containerStyle="otp"
                        placeholder={'••••••'}
                    />
                </div>
                {!state.success && (
                    <div className="buttons">
                        <Button label="Verify" />
                        <ResendButton />
                    </div>
                )}
            </form>
        )
    }
}

function ResendButton() {
    const timerState = useAppSelector((state) => state.timer)
    const authState = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()

    useEffect(() => {
        timerState.duration > 0 &&
            setTimeout(
                () => dispatch(start({ duration: timerState.duration - 1000 })),
                1000
            )
    }, [timerState.duration, dispatch])

    const handleResend = () => {
        if (authState.user) {
            Resend(authState.user.country, authState.user.phone)
                .then((res) => {
                    dispatch(reset())
                    dispatch(counter())
                })
                .catch(() => {})
        }
    }

    if (authState.user) {
        return authState.counter >= 5 ? (
            <button className="resend" disabled>
                OTP limit reached
            </button>
        ) : (
            <button
                className="resend"
                type="button"
                onClick={() => handleResend()}
                disabled={timerState.duration > 0}
            >
                {timerState.duration <= 0
                    ? 'Resend OTP'
                    : `Resend in ${timerState.duration / 1000}s`}
            </button>
        )
    }
}
