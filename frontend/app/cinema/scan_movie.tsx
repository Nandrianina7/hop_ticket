// app/scan_movie.tsx
import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import { previewMovieTicket } from '../../utils/api';

export default function ScanMovieScreen() {
  const router = useRouter();
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [fade]);

  // Demander permission caméra
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  // In scan_movie.tsx - update the handleBarCodeScanned function
const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
  if (scanned) return;
  setScanned(true);
  setLoading(true);

  try {
    console.log('QR Code scanned:', result.data); // Debug log
    
    // Ensure we're sending proper data format
    const qrData = result.data.trim();
    if (!qrData) {
      throw new Error('QR code data is empty');
    }

    // Prévisualisation du ticket film sans validation définitive
    const response = await previewMovieTicket(qrData);

    console.log('Preview response:', response); // Debug log

    // Naviguer vers la page de validation avec les données du ticket film
    router.push({
      pathname: './validation_ticketMovie',
      params: {
        qrData: qrData,
        previewData: JSON.stringify(response)
      }
    });

  } catch (error: any) {
    console.error('Erreur prévisualisation ticket film:', error);
    
    // More detailed error logging
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    let errorMessage = 'Erreur lors de la lecture du QR code';

    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.status === 400) {
      errorMessage = 'Données du QR code invalides';
    } else if (error.response?.status === 401) {
      errorMessage = 'Authentification requise';
    } else if (error.response?.status === 404) {
      errorMessage = 'Ticket non trouvé';
    }

    Alert.alert('Erreur', errorMessage, [
      { 
        text: 'OK', 
        onPress: () => {
          setScanned(false);
          setLoading(false);
        }
      },
    ]);
  } finally {
    setLoading(false);
  }
};

  const resetScan = () => {
    setScanned(false);
  };

  if (permission && !permission.granted) {
    return (
      <View style={styles.containerTop}>
        <Text>Permission caméra refusée. Active la caméra pour scanner.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Donner l&#39;accès</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="movie" size={28} style={{ marginRight: 10 }} />
        <Text style={styles.headerTitle}>Scanner un ticket Film</Text>
      </View>

      <View style={styles.scannerWrapper}>
        {!permission ? (
          <ActivityIndicator />
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'], // uniquement QR codes
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        )}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Vérification du ticket...</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlItem} onPress={resetScan} disabled={loading}>
          <MaterialCommunityIcons name="reload" size={20} />
          <Text style={styles.controlText}>Réactiver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlItem} onPress={() => router.push('../scanqr')} disabled={loading}>
          <MaterialCommunityIcons name="swap-horizontal" size={20} />
          <Text style={styles.controlText}>Changer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlItem} onPress={() => router.back()} disabled={loading}>
          <MaterialCommunityIcons name="arrow-left" size={20} />
          <Text style={styles.controlText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  containerTop: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  backBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
  },
  backBtnText: { 
    color: '#fff', 
    marginLeft: 8 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 40,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700' 
  },
  scannerWrapper: {
    height: 380,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginTop: 12,
    position: 'relative',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
  },
  controlItem: {
    alignItems: 'center',
    padding: 8,
  },
  controlText: { 
    marginTop: 6 
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
});