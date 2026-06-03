import { useState } from 'react'
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../../src/api/client'

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const requestPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync()
    setHasPermission(status === 'granted')
    if (status === 'granted') setScanning(true)
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)

    try {
      const payload = JSON.parse(data) as { tokenId: string; rawToken: string }
      const res = await api.post('/api/qr/scan', payload)

      queryClient.invalidateQueries({ queryKey: ['doctor-treatments'] })

      Alert.alert(
        'Access Granted',
        `Connected to ${res.data.profile?.fullName ?? 'patient'}.\nAccess level: ${res.data.accessLevel}`,
        [
          {
            text: 'View Records',
            onPress: () => router.push(`/(doctor)/client/${res.data.clientId}`),
          },
          { text: 'Done', onPress: () => router.back() },
        ]
      )
    } catch (err: any) {
      const code = err.response?.data?.error
      const messages: Record<string, string> = {
        QR_USED: 'This QR code has already been used.',
        QR_EXPIRED: 'This QR code has expired.',
        QR_INVALID: 'Invalid QR code.',
      }
      Alert.alert('Scan Failed', messages[code] ?? 'Could not scan QR code.', [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ])
    }
  }

  if (!scanning) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Scan Patient QR</Text>
        <Text style={styles.subtitle}>Ask your patient to show their BeautyPass QR code.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.scanContainer}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Point camera at patient's QR code</Text>
      </View>
      <TouchableOpacity style={styles.cancelScan} onPress={() => router.back()}>
        <Text style={styles.cancelScanText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#C06078', marginBottom: 8 },
  subtitle: { color: '#888', marginBottom: 32 },
  button: { backgroundColor: '#C06078', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel: { color: '#888', textAlign: 'center' },
  scanContainer: { flex: 1, backgroundColor: '#000' },
  overlay: { position: 'absolute', bottom: 120, left: 0, right: 0, alignItems: 'center' },
  overlayText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelScan: { position: 'absolute', bottom: 56, left: 0, right: 0, alignItems: 'center' },
  cancelScanText: { color: '#fff', fontSize: 16 },
})
