import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { api } from '../api/client'
import { UserRole } from '@beautypass/shared'

interface AuthState {
  userId: string | null
  role: UserRole | null
  email: string | null
  isLoaded: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  role: null,
  email: null,
  isLoaded: false,

  loadFromStorage: async () => {
    const token = await SecureStore.getItemAsync('accessToken')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        set({ userId: payload.userId, role: payload.role, email: payload.email, isLoaded: true })
      } catch {
        set({ isLoaded: true })
      }
    } else {
      set({ isLoaded: true })
    }
  },

  login: async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password })
    const { accessToken, refreshToken, tokenId, role } = res.data

    await SecureStore.setItemAsync('accessToken', accessToken)
    await SecureStore.setItemAsync('refreshToken', refreshToken)
    await SecureStore.setItemAsync('tokenId', tokenId)

    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    set({ userId: payload.userId, role, email, isLoaded: true })
  },

  logout: async () => {
    const tokenId = await SecureStore.getItemAsync('tokenId')
    const refreshToken = await SecureStore.getItemAsync('refreshToken')
    if (tokenId && refreshToken) {
      try { await api.post('/api/auth/logout', { tokenId, refreshToken }) } catch { /* ok */ }
    }
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
    await SecureStore.deleteItemAsync('tokenId')
    set({ userId: null, role: null, email: null })
  },
}))
