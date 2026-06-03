import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '../src/store/auth'

const queryClient = new QueryClient()

function RootGuard() {
  const { userId, role, isLoaded } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    const inAuth = segments[0] === '(auth)'
    if (!userId && !inAuth) {
      router.replace('/(auth)/login')
    } else if (userId && inAuth) {
      if (role === 'client') router.replace('/(client)/')
      else if (role === 'doctor') router.replace('/(doctor)/')
      else router.replace('/(clinic)/')
    }
  }, [userId, role, isLoaded, segments])

  return null
}

export default function RootLayout() {
  const loadFromStorage = useAuthStore(s => s.loadFromStorage)
  useEffect(() => { loadFromStorage() }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <RootGuard />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
