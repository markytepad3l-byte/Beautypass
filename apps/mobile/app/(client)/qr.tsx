import { useState } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { api } from '../../src/api/client'
import { AccessLevel } from '@beautypass/shared'

const EXPIRY_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '4 hours', hours: 4 },
  { label: '24 hours', hours: 24 },
]

export default function QrScreen() {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('readonly')
  const [expiryHours, setExpiryHours] = useState(1)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generateQr = async () => {
    setLoading(true)
    try {
      const expiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
      const res = await api.post('/api/qr/generate', { accessLevel, expiresAt: expiry })
      setQrCode(res.data.qrCode)
      setExpiresAt(res.data.expiresAt)
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to generate QR code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share My Records</Text>
      <Text style={styles.subtitle}>Show this QR code to your doctor or clinic. It grants temporary access to your treatment history.</Text>

      <Text style={styles.label}>Access Level</Text>
      <View style={styles.row}>
        {(['readonly', 'full'] as AccessLevel[]).map(a => (
          <TouchableOpacity
            key={a}
            style={[styles.optBtn, accessLevel === a && styles.optBtnActive]}
            onPress={() => setAccessLevel(a)}
          >
            <Text style={[styles.optText, accessLevel === a && styles.optTextActive]}>
              {a === 'readonly' ? 'View Only' : 'Full Access'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Expires After</Text>
      <View style={styles.row}>
        {EXPIRY_OPTIONS.map(o => (
          <TouchableOpacity
            key={o.hours}
            style={[styles.optBtn, expiryHours === o.hours && styles.optBtnActive]}
            onPress={() => setExpiryHours(o.hours)}
          >
            <Text style={[styles.optText, expiryHours === o.hours && styles.optTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={generateQr} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate QR Code</Text>}
      </TouchableOpacity>

      {qrCode && (
        <View style={styles.qrContainer}>
          <Image source={{ uri: qrCode }} style={styles.qrImage} />
          <Text style={styles.expiry}>
            Valid until {expiresAt ? new Date(expiresAt).toLocaleTimeString() : ''}
          </Text>
          <Text style={styles.singleUse}>This code can only be scanned once.</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '700', color: '#C06078', marginBottom: 8 },
  subtitle: { color: '#888', marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  optBtn: { flex: 1, borderWidth: 1, borderColor: '#C06078', borderRadius: 8, padding: 10, alignItems: 'center' },
  optBtnActive: { backgroundColor: '#C06078' },
  optText: { color: '#C06078', fontWeight: '600', fontSize: 13 },
  optTextActive: { color: '#fff' },
  button: { backgroundColor: '#C06078', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  qrContainer: { alignItems: 'center' },
  qrImage: { width: 220, height: 220, marginBottom: 12 },
  expiry: { color: '#555', marginBottom: 4 },
  singleUse: { color: '#aaa', fontSize: 12 },
})
