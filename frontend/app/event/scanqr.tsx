// app/scanqr.tsx
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
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import { checkDualUser, axiosInstance, previewTicket } from '../../utils/api';

export default function ScanQRScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [customerExists, setCustomerExists] = useState<boolean | null>(null);

  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();

    (async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');

        if (!token) {
          console.log('No token found, cannot proceed');
          setAllowed(false);
          setLoading(false);
          return;
        }

        try {
          // Vérification des droits avec checkDualUser
          const dualUserData = await checkDualUser();
          console.log('Dual user check result:', dualUserData);
          
          setAllowed(dualUserData.allowed);
          setAdminExists(dualUserData.admin_exists);
          setCustomerExists(dualUserData.customer_exists);
          
          // Si l'utilisateur a les droits, on vérifie aussi qu'il est authentifié
          if (dualUserData.allowed) {
            await axiosInstance.get('/api/mobile/my-tickets/');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          setAllowed(false);
        }
      } catch (err) {
        console.error('Erreur check auth:', err);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [fade]);

  // Demander permission caméra
  useEffect(() => {
    if (allowed && !permission) {
      requestPermission();
    }
  }, [allowed]);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    try {
      // Prévisualisation du ticket sans validation définitive
      const response = await previewTicket(result.data);

      // Naviguer vers la page de validation avec les données du ticket
      router.push({
        pathname: './validation_qr',
        params: {
          qrData: result.data,
          previewData: JSON.stringify(response)
        }
      });

    } catch (error: any) {
      console.error('Erreur prévisualisation ticket:', error);

      let errorMessage = 'Erreur lors de la lecture du QR code';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Erreur', errorMessage, [
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
    }
  };

  const resetScan = () => {
    setScanned(false);
  };

  if (loading) {
    return (
      <View style={styles.containerTop}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Vérification des droits...</Text>
      </View>
    );
  }

  if (!allowed) {
    return (
      <Animated.View style={[styles.containerTop, { opacity: fade }]}>
        <MaterialCommunityIcons name="lock-alert" size={64} color="#d9534f" />
        <Text style={styles.title}>Accès refusé</Text>
        <Text style={styles.subtitle}>
          Vous n&apos;êtes pas autorisé·e à scanner des QR codes.
        </Text>

        <View style={{ marginTop: 18 }}>
          <Text style={{ color: '#666', textAlign: 'center', marginBottom: 8 }}>
            Statut de vérification:
          </Text>
          <Text style={{ color: '#666' }}>
            Admin existe: {String(adminExists)}
          </Text>
          <Text style={{ color: '#666' }}>
            Client existe: {String(customerExists)}
          </Text>
          <Text style={{ color: '#666', marginTop: 8 }}>
            Accès autorisé: {String(allowed)}
          </Text>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" />
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (allowed && permission && !permission.granted) {
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
        <MaterialCommunityIcons name="qrcode-scan" size={28} style={{ marginRight: 10 }} />
        <Text style={styles.headerTitle}>Scanner un QR Code</Text>
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

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlItem} onPress={resetScan}>
          <MaterialCommunityIcons name="reload" size={20} />
          <Text style={styles.controlText}>Réactiver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlItem} onPress={() => router.back()}>
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
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginTop: 12 
  },
  subtitle: { 
    color: '#666', 
    marginTop: 8 
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
});