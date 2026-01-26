// app/scan_choice.tsx
import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { checkDualUser, axiosInstance } from '../utils/api';

export default function ScanChoiceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [customerExists, setCustomerExists] = useState<boolean | null>(null);

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

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="qrcode-scan" size={28} style={{ marginRight: 10 }} />
        <Text style={styles.headerTitle}>Choisir le type de scan</Text>
      </View>

      <View style={styles.choiceContainer}>
        <TouchableOpacity 
          style={styles.choiceButton}
          onPress={() => router.push('./cinema/scan_movie')}
        >
          <MaterialCommunityIcons name="movie" size={40} color="#007AFF" />
          <Text style={styles.choiceText}>Scanner un ticket Film</Text>
          <Text style={styles.choiceSubtext}>Valider les tickets de cinéma</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.choiceButton}
          onPress={() => router.push('./event/scanqr')}
        >
          <MaterialCommunityIcons name="calendar" size={40} color="#FF9500" />
          <Text style={styles.choiceText}>Scanner un ticket Événement</Text>
          <Text style={styles.choiceSubtext}>Valider les tickets d&#39;événements</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" />
        <Text style={styles.backBtnText}>Retour</Text>
      </TouchableOpacity>
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
    alignSelf: 'center',
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
  choiceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  choiceButton: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  choiceText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  choiceSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});