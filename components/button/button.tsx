import Image from 'next/image'
import { useFormStatus } from 'react-dom'

import Loading from '@/assets/loader.svg'

export default function Button({
    label,
    disabled = false,
    className = '',
    loading = false,
    type = 'submit',
    onClick,
}: {
    readonly label: string
    readonly disabled?: boolean
    readonly className?: string
    readonly loading?: boolean
    readonly type?: 'submit' | 'button'
    readonly onClick?: () => void
}) {
    const status = useFormStatus()
    return (
        <button
            className={`submit ${className}`}
            type={type}
            disabled={status.pending || disabled}
            onClick={onClick}
        >
            {status.pending || loading ? (
                <Image src={Loading} alt="Logo" height={50} />
            ) : (
                label
            )}
        </button>
    )
}
