import { useState, useEffect } from 'react'
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { api } from '../../src/api/client'
import { useAuthStore } from '../../src/store/auth'

export default function AccountScreen() {
  const router = useRouter()
  const logout = useAuthStore(s => s.logout)
  const queryClient = useQueryClient()
  const [consentAi, setConsentAi] = useState(false)
  const [savingConsent, setSavingConsent] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['client-profile'],
    queryFn: async () => (await api.get('/api/account/export')).data.profile,
  })

  useEffect(() => {
    if (profile) setConsentAi(profile.consent_ai_processing)
  }, [profile])

  const toggleConsent = async (val: boolean) => {
    setConsentAi(val)
    setSavingConsent(true)
    try {
      await api.patch('/api/account/consent', { consentAiProcessing: val })
    } catch {
      setConsentAi(!val)
      Alert.alert('Error', 'Failed to update consent setting.')
    } finally {
      setSavingConsent(false)
    }
  }

  const handleExport = async () => {
    Alert.alert('Export Data', 'Your data export will download as JSON.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export',
        onPress: async () => {
          try {
            const res = await api.get('/api/account/export')
            Alert.alert('Export Ready', 'Data export complete. In a production app this would save to your device.')
          } catch {
            Alert.alert('Error', 'Failed to export data.')
          }
        },
      },
    ])
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This will permanently delete your BeautyPass account and all your data within 30 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/api/account')
              await logout()
              router.replace('/(auth)/login')
            } catch {
              Alert.alert('Error', 'Failed to delete account.')
            }
          },
        },
      ]
    )
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>AI Processing Consent</Text>
        <Text style={styles.desc}>
          Allow BeautyPass to use your treatment history (titles, types, dates) to generate AI-powered summaries.
          Your photos and notes are never sent to AI.
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>{consentAi ? 'Enabled' : 'Disabled'}</Text>
          {savingConsent
            ? <ActivityIndicator size="small" color="#C06078" />
            : <Switch value={consentAi} onValueChange={toggleConsent} trackColor={{ true: '#C06078' }} />
          }
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Data</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
          <Text style={styles.actionText}>Export My Data (JSON)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={handleDelete}>
          <Text style={styles.dangerText}>Delete My Account</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: '#FAF5F7' },
  title: { fontSize: 24, fontWeight: '700', color: '#C06078', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontWeight: '700', color: '#333', marginBottom: 8, fontSize: 16 },
  desc: { color: '#888', lineHeight: 20, marginBottom: 12, fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#555', fontWeight: '600' },
  actionBtn: { borderRadius: 8, borderWidth: 1, borderColor: '#ddd', padding: 12, marginTop: 8 },
  actionText: { color: '#555', textAlign: 'center', fontWeight: '600' },
  dangerBtn: { borderColor: '#ff4d6d' },
  dangerText: { color: '#ff4d6d', textAlign: 'center', fontWeight: '600' },
  logoutBtn: { marginTop: 8, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#C06078', alignItems: 'center' },
  logoutText: { color: '#C06078', fontWeight: '600', fontSize: 16 },
})
