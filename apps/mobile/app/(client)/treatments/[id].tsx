import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { api } from '../../../src/api/client'

export default function TreatmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [uploadingPhase, setUploadingPhase] = useState<'before' | 'after' | 'progress' | null>(null)

  const treatment = useQuery({
    queryKey: ['treatment', id],
    queryFn: async () => (await api.get(`/api/treatments/${id}`)).data,
  })

  const photos = useQuery({
    queryKey: ['photos', id],
    queryFn: async () => (await api.get(`/api/treatments/${id}/photos`)).data,
  })

  const notes = useQuery({
    queryKey: ['notes', id],
    queryFn: async () => (await api.get(`/api/treatments/${id}/notes`)).data,
  })

  const uploadPhoto = async (phase: 'before' | 'after' | 'progress') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    })
    if (result.canceled) return

    setUploadingPhase(phase)
    try {
      const uri = result.assets[0].uri
      const form = new FormData()
      form.append('photo', { uri, name: 'photo.jpg', type: 'image/jpeg' } as any)
      form.append('phase', phase)
      form.append('consentClinical', 'false')
      await api.post(`/api/treatments/${id}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      queryClient.invalidateQueries({ queryKey: ['photos', id] })
    } catch {
      Alert.alert('Error', 'Failed to upload photo.')
    } finally {
      setUploadingPhase(null)
    }
  }

  if (treatment.isLoading) return <ActivityIndicator style={{ flex: 1 }} color="#C06078" />

  const t = treatment.data
  if (!t) return <Text style={{ padding: 24 }}>Treatment not found.</Text>

  const photosByPhase = (phase: string) => (photos.data ?? []).filter((p: any) => p.phase === phase)

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{t.title}</Text>
      <Text style={styles.meta}>{t.date} · {t.type} · <Text style={styles.badge}>{t.status}</Text></Text>

      {t.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{t.notes}</Text>
        </View>
      )}

      {(['before', 'after', 'progress'] as const).map(phase => (
        <View key={phase} style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>{phase.charAt(0).toUpperCase() + phase.slice(1)} Photos</Text>
            <TouchableOpacity onPress={() => uploadPhoto(phase)} disabled={uploadingPhase === phase}>
              {uploadingPhase === phase
                ? <ActivityIndicator size="small" color="#C06078" />
                : <Text style={styles.addPhoto}>+ Upload</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {photosByPhase(phase).map((p: any) => (
              <Image key={p.id} source={{ uri: p.url }} style={styles.photo} />
            ))}
            {photosByPhase(phase).length === 0 && (
              <Text style={styles.noPhoto}>No {phase} photos yet</Text>
            )}
          </ScrollView>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Notes</Text>
        {(notes.data ?? []).length === 0
          ? <Text style={styles.noPhoto}>No professional notes yet</Text>
          : (notes.data ?? []).map((n: any) => (
              <View key={n.id} style={styles.noteCard}>
                <Text style={styles.noteAuthor}>{n.author_name ?? 'Professional'}</Text>
                <Text style={styles.noteContent}>{n.content}</Text>
                <Text style={styles.noteMeta}>{new Date(n.created_at).toLocaleDateString()}</Text>
              </View>
            ))
        }
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F7' },
  back: { padding: 20, paddingBottom: 0, paddingTop: 56 },
  backText: { color: '#C06078', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: '#222', paddingHorizontal: 20, marginTop: 8 },
  meta: { color: '#888', paddingHorizontal: 20, marginBottom: 16 },
  badge: { color: '#C06078', fontWeight: '600' },
  section: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addPhoto: { color: '#C06078', fontWeight: '600' },
  photo: { width: 120, height: 120, borderRadius: 8, marginRight: 8 },
  noPhoto: { color: '#aaa', fontStyle: 'italic' },
  notes: { color: '#555', lineHeight: 22 },
  noteCard: { borderTopWidth: 1, borderColor: '#f0f0f0', paddingTop: 12, marginTop: 12 },
  noteAuthor: { fontWeight: '700', color: '#C06078', marginBottom: 4 },
  noteContent: { color: '#444', lineHeight: 20 },
  noteMeta: { color: '#aaa', fontSize: 12, marginTop: 4 },
})
