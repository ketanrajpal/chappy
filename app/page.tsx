'use client'

import SelectCountry from '@/components/select-country/select-country'

import './login.scss'
import { useFormState } from 'react-dom'

import { Login, Verify } from '@/app/action'
import { initialState } from './schema'
import OTPInput from 'react-otp-input'
import { useEffect, useState } from 'react'

import Logo from '@/assets/logo.png'
import Image from 'next/image'
import { useAppDispatch, useAppSelector } from '@/services/redux'
import { counter, login, setUser } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { reset, start } from '@/store/timer'
import Button from '@/components/button/button'

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
                    width={250}
                    priority
                />
                <LoginForm />
                {!authState.authenticated && authState.user && (
                    <>
                        <VerifyForm />
                        <ResendButton />
                    </>
                )}
            </div>
        </div>
    )
}

function LoginForm() {
    const [state, formAction] = useFormState(Login, initialState)
    const authState = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (state.success) {
            dispatch(setUser(state.user))
            dispatch(counter())
        }
    }, [state.success, dispatch, state.user])

    return (
        <div className={`login ${state.error ? 'error' : ''}`}>
            <form action={formAction} autoComplete="off">
                <div className="container">
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
                <div className="button">
                    {!authState.authenticated && !authState.user && (
                        <Button label="Login" />
                    )}
                </div>
            </form>
        </div>
    )
}

function VerifyForm() {
    const [otp, setOtp] = useState('')
    const [state, formAction] = useFormState(Verify, initialState)
    const dispatch = useAppDispatch()
    const appState = useAppSelector((state) => state.auth)

    useEffect(() => {
        if (state.success && state.username)
            dispatch(login({ user: state.user, username: state.username }))
    }, [state.success, dispatch, state.user, state.username])

    if (appState.user) {
        return (
            <div className={`verify ${state.error ? 'error' : ''}`}>
                <form action={formAction} autoComplete="off">
                    <input
                        type="hidden"
                        name="country"
                        value={JSON.stringify(appState.user.country)}
                    />
                    <input
                        type="hidden"
                        name="phone"
                        value={appState.user.phone}
                    />
                    <input type="hidden" name="otp" value={otp} />
                    <div className="container">
                        <OTPInput
                            value={otp}
                            onChange={setOtp}
                            numInputs={6}
                            renderInput={(props) => <input {...props} />}
                            containerStyle="otp"
                            placeholder={'••••••'}
                        />
                    </div>
                    <div className="button">
                        {!state.success && <Button label="Verify" />}
                    </div>
                </form>
            </div>
        )
    }
}

function ResendButton() {
    const timerState = useAppSelector((state) => state.timer)
    const authState = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const [state, formAction] = useFormState(Login, initialState)

    useEffect(() => {
        timerState.duration > 0 &&
            setTimeout(
                () =>
                    dispatch(start({ duration: timerState.duration - 10000 })),
                1000
            )
    }, [timerState.duration, dispatch])

    useEffect(() => {
        if (state.counter < 5) {
            dispatch(reset())
            dispatch(counter())
        }
    }, [dispatch, state.counter])

    if (authState.user) {
        return (
            <div className={`resend ${state.error ? 'error' : ''}`}>
                {authState.counter >= 5 ? (
                    <button className="resend">
                        Maximum number of OTP attempts reached. Try again later.
                    </button>
                ) : (
                    <form action={formAction} autoComplete="off">
                        <input
                            type="hidden"
                            name="country"
                            value={JSON.stringify(authState.user.country)}
                        />
                        <input
                            type="hidden"
                            name="phone"
                            value={authState.user.phone}
                        />
                        <button
                            type="submit"
                            className={`resend ${
                                timerState.duration <= 0 && 'active'
                            }`}
                            disabled={timerState.duration !== 0}
                        >
                            Don&apos;t receive the code?{' '}
                            <span>
                                Resend
                                {timerState.duration <= 0 ? (
                                    <> OTP</>
                                ) : (
                                    <>
                                        {' '}
                                        in {timerState.duration / 1000} seconds
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                )}
            </div>
        )
    }
}
