// app/intro.tsx
import { View, Image, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken, isAuthenticated } from '@/utils/api';

export default function IntroScreen() {
  const router = useRouter();
  const [token, setToken] = useState<boolean | null>(null);
  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 secondes

      const tok = await isAuthenticated();
      setToken(tok);
      console.log("IntroScreen - Retrieved token:", token);
      if (tok) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    };

    checkAuth();
  }, [token]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/intro.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
});
