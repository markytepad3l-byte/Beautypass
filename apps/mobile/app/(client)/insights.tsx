import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../src/api/client'

const DISCLAIMER = 'This summary is for personal reference only and is not medical advice.'

export default function InsightsScreen() {
  const queryClient = useQueryClient()
  const [generating, setGenerating] = React.useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => (await api.get('/api/insights')).data,
  })

  const generate = async () => {
    setGenerating(true)
    try {
      await api.post('/api/insights/generate')
      queryClient.invalidateQueries({ queryKey: ['insights'] })
      queryClient.invalidateQueries({ queryKey: ['insight-latest'] })
    } catch (err: any) {
      const code = err.response?.data?.error
      if (code === 'AI_CONSENT_REQUIRED') {
        Alert.alert(
          'Consent Required',
          'To use AI insights, please enable AI processing in your Account settings.',
          [{ text: 'OK' }]
        )
      } else {
        Alert.alert('Error', err.response?.data?.message ?? 'Failed to generate insight.')
      }
    } finally {
      setGenerating(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Insights</Text>
      <Text style={styles.disclaimer}>{DISCLAIMER}</Text>

      <TouchableOpacity style={styles.button} onPress={generate} disabled={generating}>
        {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate New Insight</Text>}
      </TouchableOpacity>

      {isLoading && <ActivityIndicator color="#C06078" />}

      <FlatList
        data={data ?? []}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{new Date(item.generatedAt ?? item.generated_at).toLocaleDateString()}</Text>
            <Text style={styles.content}>{item.content ?? item.output_content}</Text>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>No insights yet. Tap above to generate your first one.</Text> : null
        }
      />
    </View>
  )
}

import React from 'react'

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: '#FAF5F7' },
  title: { fontSize: 24, fontWeight: '700', color: '#C06078', marginBottom: 8 },
  disclaimer: { color: '#999', fontSize: 12, marginBottom: 16, fontStyle: 'italic' },
  button: { backgroundColor: '#C06078', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10 },
  date: { color: '#aaa', fontSize: 12, marginBottom: 8 },
  content: { color: '#333', lineHeight: 22 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 32 },
})
