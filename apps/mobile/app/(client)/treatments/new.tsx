import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../../../src/api/client'
import { TreatmentStatus } from '@beautypass/shared'

const STATUSES: TreatmentStatus[] = ['planned', 'ongoing', 'completed']

export default function NewTreatmentScreen() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<TreatmentStatus>('planned')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSave = async () => {
    if (!title || !type || !date) {
      Alert.alert('Error', 'Title, type, and date are required.')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/treatments', { title, type, date, notes: notes || undefined, status })
      queryClient.invalidateQueries({ queryKey: ['treatments'] })
      router.back()
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error ?? 'Failed to save treatment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>New Treatment</Text>

      <Text style={styles.label}>Treatment Name *</Text>
      <TextInput style={styles.input} placeholder="e.g. Botox Upper Face" value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Type *</Text>
      <TextInput style={styles.input} placeholder="e.g. botox, dermal_filler, laser" value={type} onChangeText={setType} autoCapitalize="none" />

      <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="2024-06-15" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" />

      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {STATUSES.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.statusBtn, status === s && styles.statusBtnActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.statusText, status === s && styles.statusTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Any details about this treatment..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Treatment</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff', paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '700', color: '#C06078', marginBottom: 24 },
  label: { fontSize: 13, color: '#555', marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 16 },
  textarea: { height: 100, textAlignVertical: 'top' },
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusBtn: { flex: 1, borderWidth: 1, borderColor: '#C06078', borderRadius: 8, padding: 10, alignItems: 'center' },
  statusBtnActive: { backgroundColor: '#C06078' },
  statusText: { color: '#C06078', fontWeight: '600', fontSize: 12 },
  statusTextActive: { color: '#fff' },
  button: { backgroundColor: '#C06078', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel: { color: '#888', textAlign: 'center' },
})
