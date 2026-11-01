import { useMemo, useSyncExternalStore } from 'react'
import { getUserSnapshot, subscribeAuth } from '../utils/auth'

function useAuthUser() {
  const serializedUser = useSyncExternalStore(subscribeAuth, getUserSnapshot, () => null)

  return useMemo(() => {
    try {
      return serializedUser ? JSON.parse(serializedUser) : null
    } catch {
      return null
    }
  }, [serializedUser])
}

export default useAuthUser
