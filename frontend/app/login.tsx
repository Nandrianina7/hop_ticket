// app/login.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  Easing,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  KeyboardAvoidingView,          // ADD
  Platform                        // ADD
} from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { loginUser, storeAuthTokens, API_BASE_URL, storeUser, getUser,fcmTokenInsertion} from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useFcmNotification } from '@/hooks/useFCMNotification';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { fcmToken, notification } = useFcmNotification();
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const logoScale = useState(new Animated.Value(1))[0];
  const floatingAnim1 = useState(new Animated.Value(0))[0];
  const floatingAnim2 = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();

    // Animation flottante pour les éléments de fond
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim1, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim1, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim2, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          delay: 1000,
        }),
        Animated.timing(floatingAnim2, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onLogin = async () => {
    setLoading(true);
    setError(null);
    
    // Animation du bouton
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const loginData = await loginUser(email, password);
      const fcmData = await fcmTokenInsertion(loginData.user.id, fcmToken || '');
      console.log("FCM Token insertion response:", fcmData);

      if (loginData.access_token && loginData.refresh_token) {
        await storeAuthTokens(loginData.access_token, loginData.refresh_token);
        await storeUser(loginData.user);
        console.log("user:",await getUser())
        // Animation de succès
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          router.replace('/(tabs)');
        });
      } else {
        setError('Tokens manquants dans la réponse');
        setLoading(false);
      }
    } catch (e: any) {
      console.error('Login error:', e.response?.data || e.message);
      setError(e.response?.data?.detail || e.response?.data?.message || 'Erreur de connexion');
      setLoading(false);
      
      // Animation d'erreur
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const floating1TranslateY = floatingAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const floating2TranslateY = floatingAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  const floating2TranslateX = floatingAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // 'height' works well on Android
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // adjust if you have a header
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Background décoratif similaire à ticket_cinema */}
            <View style={styles.backgroundDecorations}>
              <Animated.Image 
                source={require('../assets/images/hoplogo.jpeg')}
                style={[
                  styles.floatingIcon1,
                  {
                    transform: [
                      { translateY: floating1TranslateY },
                      { rotate: '15deg' }
                    ]
                  }
                ]}
                resizeMode="contain"
              />
              <Animated.Image 
                source={require('../assets/images/hoplogo.jpeg')}
                style={[
                  styles.floatingIcon2,
                  {
                    transform: [
                      { translateY: floating2TranslateY },
                      { translateX: floating2TranslateX },
                      { rotate: '-10deg' }
                    ]
                  }
                ]}
                resizeMode="contain"
              />
              <View style={styles.floatingShape1} />
              <View style={styles.floatingShape2} />
              <View style={styles.gradientOverlay} />
            </View>

            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              {/* Logo animé */}
              <Animated.View 
                style={[
                  styles.logoContainer,
                  {
                    transform: [{ scale: logoScale }]
                  }
                ]}
              >
                <Image 
                  source={require('../assets/images/hoplogo.jpeg')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </Animated.View>

              <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
                Connexion
              </Text>

              {/* <Text style={styles.title}>Système de Notification</Text>
        
        <View style={styles.tokenBox}>
          <Text style={styles.label}>Mon Token FCM :</Text>
          <Text selectable style={styles.token}>
              {fcmToken ? fcmToken : "Chargement..."}
          </Text>
        </View> */}
        {notification && (
          <View style={styles.notifBox}>
            <Text style={styles.label}>Dernière notification :</Text>
            <Text>{notification.request.content.title}</Text>
            <Text>{notification.request.content.body}</Text>
          </View>
        )}

              <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                Connectez-vous à votre compte
              </Text>

              <View style={styles.form}>
                <Animated.View style={styles.inputContainer}>
                  <TextInput
                    label="Email"
                    mode="outlined"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                    left={<TextInput.Icon icon="email" />}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                  />
                </Animated.View>

                <Animated.View style={styles.inputContainer}>
                  <TextInput
                    label="Mot de passe"
                    mode="outlined"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon 
                        icon={showPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    blurOnSubmit={true}                // helps dismiss keyboard on submit
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </Animated.View>

                <HelperText type="error" visible={!!error} style={styles.errorText}>
                  {error}
                </HelperText>

                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Button
                    mode="contained"
                    onPress={onLogin}
                    loading={loading}
                    disabled={loading || !email || !password}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </Animated.View>

                <View style={styles.signup}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    Pas de compte ? 
                  </Text>
                  <Text
                    style={[styles.link, { color: theme.colors.primary }]}
                    onPress={() => router.push('/Register')}
                  >
                    {' '}S&apos;inscrire
                  </Text>
                </View>
              </View>

              {/* Debug info - à retirer en production */}
              {/* <Text style={[styles.debugInfo, { color: theme.colors.onSurfaceVariant }]}>
                API: {API_BASE_URL}
              </Text> */}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tokenBox: { marginVertical: 10, padding: 10, backgroundColor: '#eee', borderRadius: 5 },
  notifBox: { marginTop: 20, padding: 10, borderColor: 'blue', borderWidth: 1 },
  label: { fontWeight: 'bold' },
  token: { fontSize: 10, color: '#555' },
  container: {
    flex: 1,
  },
  backgroundDecorations: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  floatingIcon1: {
    position: 'absolute',
    top: '10%',
    right: -40,
    width: 150,
    height: 150,
    opacity: 0.08,
  },
  floatingIcon2: {
    position: 'absolute',
    bottom: '15%',
    left: -50,
    width: 180,
    height: 180,
    opacity: 0.06,
  },
  floatingShape1: {
    position: 'absolute',
    top: '20%',
    left: '5%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.03)',
  },
  floatingShape2: {
    position: 'absolute',
    bottom: '25%',
    right: '10%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(33, 150, 243, 0.03)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  signup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  link: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  debugInfo: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  },
});