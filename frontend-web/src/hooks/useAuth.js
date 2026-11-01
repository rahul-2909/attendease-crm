import { useMutation } from '@tanstack/react-query'
import { authAPI } from '../api/auth'

export const useLogin = (options = {}) => {
  return useMutation({
    mutationFn: authAPI.login,
    ...options,
  })
}

export const useRegister = (options = {}) => {
  return useMutation({
    mutationFn: authAPI.register,
    ...options,
  })
}
