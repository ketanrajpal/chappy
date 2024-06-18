import Image from 'next/image'
import { useFormStatus } from 'react-dom'

import Loading from '@/assets/loader.svg'

export default function Button({
    label,
    disabled = false,
    className = '',
}: {
    readonly label: string
    readonly disabled?: boolean
    readonly className?: string
}) {
    const status = useFormStatus()
    return (
        <button
            className={`submit ${className}`}
            type="submit"
            disabled={status.pending || disabled}
        >
            {status.pending ? (
                <Image src={Loading} alt="Logo" height={50} />
            ) : (
                label
            )}
        </button>
    )
}
