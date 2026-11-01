export const TOKEN_KEY = 'token'
export const USER_KEY = 'user'

const AUTH_CHANGE_EVENT = 'attendease:auth-change'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getUserSnapshot = () => localStorage.getItem(USER_KEY)

export const isAuthenticated = () => Boolean(getToken())

export const subscribeAuth = (listener) => {
  window.addEventListener(AUTH_CHANGE_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export const setAuth = (accessToken, user) => {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  notifyAuthChanged()
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  notifyAuthChanged()
}
