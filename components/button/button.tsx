import Image from 'next/image'
import { useFormStatus } from 'react-dom'

import Loading from '@/assets/loader.svg'

export default function Button({ label }: { readonly label: string }) {
    const status = useFormStatus()
    return (
        <button className="submit" type="submit" disabled={status.pending}>
            {status.pending ? (
                <Image src={Loading} alt="Logo" height={40} />
            ) : (
                label
            )}
        </button>
    )
}
