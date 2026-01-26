// app/(tabs)/setting.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Switch} from 'react-native'; // Ajouter Switch ici
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import { useAppTheme } from './_layout';
import { axiosInstance, checkDualUser, clearAuthTokens } from '@/utils/api';
import Profile from './Profile';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, toggleTheme } = useAppTheme();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [customerExists, setCustomerExists] = useState<boolean | null>(null);

  // const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    

    (async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');

        if (!token) {
          console.log('No token found, cannot proceed');
          setAllowed(false);
          
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
        
      }
    })();
  }, []);

  const logout = async () => {
    // console.log("User logged out:", await AsyncStorage.getItem('token'));
    // await AsyncStorage.removeItem('token');
    console.log("User logged out", await AsyncStorage.getItem('access_token'));
     await clearAuthTokens();
    router.replace('/login');
  };

  

  const items = [
    {
      label: "Mode sombre",
      icon: "theme-light-dark" as const,
      color: "#FFA500",
      action: () => toggleTheme(),
      isToggle: true,
    },
    {
      label: "Mes éléments enregistrés",
      icon: "bookmark" as const,
      color: "#4285F4",
      action: () => router.push('/actu_components/SavedScreen'),
      isToggle: false,
    },
    {
      label: "Se déconnecter",
      icon: "logout" as const,
      color: "#EA4335",
      action: logout,
      isToggle: false,
    }
  ];

  if (allowed) {
    items.push({
      label: "Scanner un QR Code",
      icon: "qrcode-scan" as const,
      color: "#34A853",
      action: () => router.push('/scanqr'),
      isToggle: false,
    });
  }

  return (
    <View >
      {/* <Profile />       */}
      {/* <Animated.Text 
        entering={FadeInRight.duration(700)}
        style={[styles.title, { color: isDark ? '#fff' : '#222' }]}
      >
        Paramètres
      </Animated.Text> */}

      {items.map((item, index) => (
        <Animated.View
          key={index}
          entering={ZoomIn.delay(index * 200)}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.item, { 
              backgroundColor: isDark ? '#1e1e1e' : '#fff',
              shadowColor: isDark ? '#000' : '#000',
            }]}
            onPress={!item.isToggle ? item.action : undefined}
          >
            <Animated.View entering={BounceIn}>
              <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
            </Animated.View>
            <Text style={[styles.itemText, { color: isDark ? '#fff' : '#333' }]}>
              {item.label}
            </Text>
            
            {item.isToggle && (
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                thumbColor={isDark ? '#ff6b6b' : '#f4f3f4'}
                trackColor={{ false: '#767577', true: '#ff6b6b' }}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 16,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  itemText: {
    fontSize: 16,
    marginLeft: 14,
    fontWeight: '500',
    flex: 1,
  },
});