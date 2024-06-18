import { useAppDispatch } from '@/services/redux'
import { Message, setMessage } from '@/store/message'

export default function useMessage() {
    const dispatch = useAppDispatch()

    function set(message: Message) {
        dispatch(setMessage(message))
    }

    return { set }
}
