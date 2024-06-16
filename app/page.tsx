'use client'

import SelectCountry from '@/components/select-country/select-country'

import './login.scss'
import { useFormState, useFormStatus } from 'react-dom'

import { Login } from '@/app/action'
import { initialState } from './schema'
import OTPInput from 'react-otp-input'
import { useState } from 'react'

import Logo from '@/assets/logo.png'
import Image from 'next/image'

export default function Home() {
    return (
        <div className="auth">
            <div className="auth-container">
                <Image src={Logo} alt="Logo" className="logo" width={250} />
                <LoginForm />
                <VerifyForm />
            </div>
        </div>
    )
}

function LoginForm() {
    const [state, formAction] = useFormState(Login, initialState)
    const status = useFormStatus()
    return (
        <div className={`login ${state.error?.login ? 'error' : ''}`}>
            <form action={formAction} autoComplete="off">
                <div className="container">
                    <SelectCountry disabled={state.success} />
                    <input type="text" name="phone" placeholder="Phone number" disabled={state.success} />
                </div>
                <div className="button">
                    {!state.success && (
                        <button className="submit" type="submit" disabled={status.pending}>
                            Login
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}

function VerifyForm() {
    const [otp, setOtp] = useState('')
    const [state, formAction] = useFormState(Login, initialState)
    const status = useFormStatus()
    return (
        <div className={`verify ${state.error?.login ? 'error' : ''}`}>
            <form action={formAction} autoComplete="off">
                <input type="hidden" name="otp" value={otp} />
                <div className="container">
                    <OTPInput
                        value={otp}
                        onChange={setOtp}
                        numInputs={6}
                        renderInput={(props) => <input {...props} />}
                        containerStyle="otp"
                        placeholder="&bull;"
                    />
                </div>
                <div className="button">
                    {!state.success && (
                        <button className="submit" type="submit" disabled={status.pending}>
                            Verify
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
