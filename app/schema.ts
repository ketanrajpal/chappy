import { User } from '@/store/auth'
import { z } from 'zod'

export type State = {
    success: boolean
    error: boolean
    serverError: string | undefined
    user: User | undefined
    counter: number
    username?: string
}

export const CountrySchema = z.object({
    name: z.string().min(2),
    phone: z.string().min(2),
    flag: z.string().min(2),
})

export const LoginSchema = z.object({
    country: CountrySchema,
    phone: z.string().min(10),
})

export const VerifySchema = z.object({
    country: CountrySchema,
    phone: z.string().min(10),
    otp: z.string().min(6),
})

export const initialState: State = {
    success: false,
    user: undefined,
    error: false,
    serverError: undefined,
    counter: 0,
}
