import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { api } from '../../src/api/client'
import { UserRole } from '@beautypass/shared'

const ROLES: { label: string; value: UserRole }[] = [
  { label: 'Client', value: 'client' },
  { label: 'Doctor', value: 'doctor' },
  { label: 'Clinic', value: 'clinic_admin' },
]

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('client')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/register', { email, password, fullName, role })
      Alert.alert('Success', 'Account created! Please check your email to verify your account.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ])
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Registration failed.'
      Alert.alert('Error', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.label}>I am a:</Text>
      <View style={styles.roleRow}>
        {ROLES.map(r => (
          <TouchableOpacity
            key={r.value}
            style={[styles.roleBtn, role === r.value && styles.roleBtnActive]}
            onPress={() => setRole(r.value)}
          >
            <Text style={[styles.roleBtnText, role === r.value && styles.roleBtnTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Full name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password (min 8 chars)" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', color: '#C06078', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, color: '#555', marginBottom: 8 },
  roleRow: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  roleBtn: { flex: 1, borderWidth: 1, borderColor: '#C06078', borderRadius: 8, padding: 10, alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#C06078' },
  roleBtnText: { color: '#C06078', fontWeight: '600' },
  roleBtnTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16 },
  button: { backgroundColor: '#C06078', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#C06078', textAlign: 'center', marginTop: 8 },
})
