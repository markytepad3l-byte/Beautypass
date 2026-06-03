import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../src/api/client'

export default function PermissionsScreen() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await api.get('/api/permissions')).data,
  })

  const revoke = async (id: string, granteeName: string) => {
    Alert.alert(
      'Revoke Access',
      `Remove access for ${granteeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            await api.delete(`/api/permissions/${id}`)
            queryClient.invalidateQueries({ queryKey: ['permissions'] })
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who Has Access</Text>
      <Text style={styles.subtitle}>Manage who can view your treatment records.</Text>

      {isLoading && <ActivityIndicator color="#C06078" />}

      <FlatList
        data={data ?? []}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.grantee_name ?? 'Unknown'}</Text>
              <Text style={styles.meta}>{item.grantee_type} · {item.access_level}</Text>
              {item.expires_at && (
                <Text style={styles.expiry}>Expires {new Date(item.expires_at).toLocaleDateString()}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.revokeBtn} onPress={() => revoke(item.id, item.grantee_name ?? 'this professional')}>
              <Text style={styles.revokeText}>Revoke</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>No active access grants.</Text> : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: '#FAF5F7' },
  title: { fontSize: 24, fontWeight: '700', color: '#C06078', marginBottom: 4 },
  subtitle: { color: '#888', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  name: { fontWeight: '700', color: '#222', marginBottom: 2 },
  meta: { color: '#888', fontSize: 13 },
  expiry: { color: '#aaa', fontSize: 12 },
  revokeBtn: { borderWidth: 1, borderColor: '#ff4d6d', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  revokeText: { color: '#ff4d6d', fontWeight: '600', fontSize: 13 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 32 },
})
