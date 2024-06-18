'use server'

import { client } from '@/services/twilio'
import { LoginSchema, State, VerifySchema } from './schema'
import { Country } from '@/store/auth'

/* login phone number */
export async function Login(
    previousState: State,
    formData: FormData
): Promise<State> {
    const country: Country = JSON.parse(formData.get('country') as string)
    const phone = formData.get('phone') as string

    const result = LoginSchema.safeParse({ country, phone })

    if (!result.success) {
        return {
            ...previousState,
            error: true,
        }
    }

    const phoneNumber = `${country.phone}${phone}`

    try {
        const verify = await client.verify.v2
            .services(process.env.REACT_APP_SERVICE_SID as string)
            .verifications.create({ to: phoneNumber, channel: 'sms' })

        if (verify.status !== 'pending') {
            return {
                ...previousState,
                error: true,
            }
        }
    } catch (error) {
        console.log(error)
        return {
            ...previousState,
            serverError: true,
        }
    }

    return {
        success: true,
        user: {
            country,
            phone,
        },
        error: false,
        serverError: false,
        counter: previousState.counter + 1,
    }
}

export async function Resend(country: Country, phone: string) {
    const phoneNumber = `${country.phone}${phone}`
    try {
        const verify = await client.verify.v2
            .services(process.env.REACT_APP_SERVICE_SID as string)
            .verifications.create({ to: phoneNumber, channel: 'sms' })

        if (verify.status !== 'pending') {
            throw new Error('Invalid phone number')
        }

        return true
    } catch (error) {
        console.log(error)
        throw new Error('Server Error')
    }
}

/* verify phone number */
export async function Verify(
    previousState: State,
    formData: FormData
): Promise<State> {
    const country: Country = JSON.parse(formData.get('country') as string)
    const phone = formData.get('phone') as string
    const otp = formData.get('otp') as string

    const result = VerifySchema.safeParse({ country, phone, otp })

    if (!result.success) {
        return {
            ...previousState,
            error: true,
        }
    }

    const phoneNumber = `${country.phone}${phone}`
    let username = undefined

    try {
        const verification = await client.verify.v2
            .services(process.env.REACT_APP_SERVICE_SID as string)
            .verificationChecks.create({ to: phoneNumber, code: otp })

        if (verification.status !== 'approved') {
            return {
                ...previousState,
                error: true,
            }
        }

        username = verification.to.split('+')[1]
    } catch (error) {
        console.log(error)
        return {
            ...previousState,
            serverError: true,
        }
    }

    return {
        success: true,
        user: {
            country: country,
            phone: phone,
        },
        serverError: false,
        error: false,
        counter: previousState.counter,
        username: username,
    }
}
