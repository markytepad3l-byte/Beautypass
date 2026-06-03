import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../src/api/client'
import { useAuthStore } from '../../src/store/auth'
import { Treatment, AiInsight } from '@beautypass/shared'

async function fetchTreatments(): Promise<Treatment[]> {
  const res = await api.get('/api/treatments')
  return res.data
}

async function fetchLatestInsight(): Promise<AiInsight | null> {
  const res = await api.get('/api/insights')
  return res.data[0] ?? null
}

export default function ClientDashboard() {
  const router = useRouter()
  const { email } = useAuthStore()
  const treatments = useQuery({ queryKey: ['treatments'], queryFn: fetchTreatments })
  const insight = useQuery({ queryKey: ['insight-latest'], queryFn: fetchLatestInsight })

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Beauty Diary</Text>
      <Text style={styles.subheader}>{email}</Text>

      {insight.data && (
        <TouchableOpacity style={styles.insightCard} onPress={() => router.push('/(client)/insights')}>
          <Text style={styles.insightLabel}>AI Insight</Text>
          <Text style={styles.insightText} numberOfLines={2}>{insight.data.output_content}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.row}>
        <Text style={styles.sectionTitle}>Recent Treatments</Text>
        <TouchableOpacity onPress={() => router.push('/(client)/treatments/new')}>
          <Text style={styles.addBtn}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {treatments.isLoading && <ActivityIndicator color="#C06078" style={{ marginTop: 20 }} />}

      <FlatList
        data={treatments.data ?? []}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(client)/treatments/${item.id}`)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.date} · {item.type}</Text>
            <Text style={[styles.badge, item.status === 'completed' ? styles.badgeGreen : styles.badgePink]}>
              {item.status}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !treatments.isLoading ? (
            <Text style={styles.empty}>No treatments yet. Tap + Add to log your first one.</Text>
          ) : null
        }
      />

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(client)/qr')}>
          <Text style={styles.navText}>QR Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(client)/permissions')}>
          <Text style={styles.navText}>Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(client)/insights')}>
          <Text style={styles.navText}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(client)/account')}>
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F7', padding: 20, paddingTop: 56 },
  header: { fontSize: 28, fontWeight: '700', color: '#C06078' },
  subheader: { color: '#999', marginBottom: 16 },
  insightCard: { backgroundColor: '#FFF0F4', borderRadius: 12, padding: 16, marginBottom: 16 },
  insightLabel: { color: '#C06078', fontWeight: '600', marginBottom: 4 },
  insightText: { color: '#555', fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  addBtn: { color: '#C06078', fontWeight: '600', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 4 },
  cardSub: { color: '#888', fontSize: 13, marginBottom: 6 },
  badge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, overflow: 'hidden' },
  badgeGreen: { backgroundColor: '#E6F9EF', color: '#2E7D50' },
  badgePink: { backgroundColor: '#FDE8EE', color: '#C06078' },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 32 },
  nav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff', marginHorizontal: -20, paddingHorizontal: 20 },
  navBtn: { alignItems: 'center' },
  navText: { color: '#C06078', fontSize: 12, fontWeight: '600' },
})
