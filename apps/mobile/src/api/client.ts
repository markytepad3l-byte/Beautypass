import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

export const api: AxiosInstance = axios.create({ baseURL: BASE_URL })

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }
    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(api(originalRequest))
        })
      })
    }

    isRefreshing = true
    try {
      const tokenId = await SecureStore.getItemAsync('tokenId')
      const refreshToken = await SecureStore.getItemAsync('refreshToken')
      if (!tokenId || !refreshToken) throw new Error('No refresh token')

      const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { tokenId, refreshToken })
      const { accessToken, refreshToken: newRefresh, tokenId: newTokenId } = res.data

      await SecureStore.setItemAsync('accessToken', accessToken)
      await SecureStore.setItemAsync('refreshToken', newRefresh)
      await SecureStore.setItemAsync('tokenId', newTokenId)

      refreshQueue.forEach(cb => cb(accessToken))
      refreshQueue = []

      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return api(originalRequest)
    } catch {
      await SecureStore.deleteItemAsync('accessToken')
      await SecureStore.deleteItemAsync('refreshToken')
      await SecureStore.deleteItemAsync('tokenId')
      // Redirect to login handled by root layout
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)
