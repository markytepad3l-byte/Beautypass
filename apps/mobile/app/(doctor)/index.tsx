import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { api } from '../../src/api/client'
import { useAuthStore } from '../../src/store/auth'

export default function DoctorDashboard() {
  const router = useRouter()
  const { email } = useAuthStore()

  const { data: treatments, isLoading } = useQuery({
    queryKey: ['doctor-treatments'],
    queryFn: async () => (await api.get('/api/treatments')).data,
  })

  // Group by client
  const clientMap: Record<string, { clientId: string; treatments: any[] }> = {}
  for (const t of treatments ?? []) {
    if (!clientMap[t.client_id]) clientMap[t.client_id] = { clientId: t.client_id, treatments: [] }
    clientMap[t.client_id].treatments.push(t)
  }
  const clients = Object.values(clientMap)

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Patients</Text>
      <Text style={styles.sub}>{email}</Text>

      <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/(doctor)/scan')}>
        <Text style={styles.scanText}>Scan Patient QR Code</Text>
      </TouchableOpacity>

      {isLoading && <ActivityIndicator color="#C06078" />}

      <FlatList
        data={clients}
        keyExtractor={c => c.clientId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(doctor)/client/${item.clientId}`)}
          >
            <Text style={styles.cardTitle}>Client {item.clientId.slice(0, 8)}…</Text>
            <Text style={styles.cardSub}>{item.treatments.length} treatment{item.treatments.length !== 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>No permitted clients yet. Scan a QR code to get started.</Text> : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: '#FAF5F7' },
  header: { fontSize: 28, fontWeight: '700', color: '#C06078' },
  sub: { color: '#999', marginBottom: 16 },
  scanBtn: { backgroundColor: '#C06078', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 20 },
  scanText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10 },
  cardTitle: { fontWeight: '700', color: '#222', marginBottom: 4 },
  cardSub: { color: '#888', fontSize: 13 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 32 },
})
