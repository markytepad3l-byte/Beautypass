import { useState } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../src/api/client'

export default function DoctorClientView() {
  const { id: clientId } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [noteContent, setNoteContent] = useState('')
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null)
  const [savingNote, setSavingNote] = useState(false)

  const { data: treatments, isLoading } = useQuery({
    queryKey: ['client-treatments', clientId],
    queryFn: async () => {
      const all = (await api.get('/api/treatments')).data
      return all.filter((t: any) => t.client_id === clientId)
    },
  })

  const addNote = async () => {
    if (!selectedTreatmentId || !noteContent.trim()) {
      Alert.alert('Error', 'Select a treatment and enter a note.')
      return
    }
    setSavingNote(true)
    try {
      await api.post(`/api/treatments/${selectedTreatmentId}/notes`, { content: noteContent })
      setNoteContent('')
      setSelectedTreatmentId(null)
      Alert.alert('Saved', 'Note added successfully.')
    } catch {
      Alert.alert('Error', 'Failed to save note.')
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Patient Records</Text>
      <Text style={styles.sub}>Client ID: {clientId?.slice(0, 8)}…</Text>

      {isLoading && <ActivityIndicator color="#C06078" />}

      <FlatList
        data={treatments ?? []}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, selectedTreatmentId === item.id && styles.cardSelected]}
            onPress={() => setSelectedTreatmentId(selectedTreatmentId === item.id ? null : item.id)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.date} · {item.type} · {item.status}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>No accessible treatments.</Text> : null
        }
      />

      {selectedTreatmentId && (
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Add Professional Note</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Clinical observations, recommendations..."
            value={noteContent}
            onChangeText={setNoteContent}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.button} onPress={addNote} disabled={savingNote}>
            {savingNote ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Note</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F7', padding: 20, paddingTop: 56 },
  back: { marginBottom: 8 },
  backText: { color: '#C06078', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', color: '#C06078', marginBottom: 2 },
  sub: { color: '#999', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderColor: '#C06078' },
  cardTitle: { fontWeight: '700', color: '#222' },
  cardSub: { color: '#888', fontSize: 13 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 32 },
  noteSection: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 8 },
  noteLabel: { fontWeight: '700', color: '#333', marginBottom: 8 },
  noteInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, textAlignVertical: 'top', height: 80, marginBottom: 12 },
  button: { backgroundColor: '#C06078', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
})
