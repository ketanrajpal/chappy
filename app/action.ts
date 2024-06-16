'use server'

import { client } from '@/services/twilio'
import { LoginSchema, State } from './schema'

export async function Login(previousState: State, formData: FormData): Promise<State> {
    const code = formData.get('code') as string
    const phone = formData.get('phone') as string

    const result = LoginSchema.safeParse({ code, phone })

    if (!result.success) {
        return {
            ...previousState,
            error: {
                ...previousState.error,
                login: true,
            },
        }
    }

    const phoneNumber = `${code}${phone}`
    //const verify = await client.verify.v2.services(process.env.REACT_APP_SERVICE_SID as string).verifications.create({ to: phoneNumber, channel: "sms" });

    return {
        success: true,
        user: {
            code,
            phone,
        },
        error: {
            login: false,
            code: false,
        },
    }
}

export async function Verify(previousState: State, formData: FormData): Promise<State> {
    const otp = formData.get('otp') as string

    const result = LoginSchema.safeParse({ otp })

    if (!result.success) {
        return {
            ...previousState,
            error: {
                ...previousState.error,
                login: true,
            },
        }
    }

    //const verification = await client.verify.v2.services(process.env.REACT_APP_SERVICE_SID as string).verificationChecks.create({ to: phoneNumber, code: otp });

    return {
        success: true,
        user: {
            code: '',
            phone: '',
        },
        error: {
            login: false,
            code: false,
        },
    }
}
