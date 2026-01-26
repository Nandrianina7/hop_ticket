// app/Register.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme, Menu, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { registerUser, API_BASE_URL } from '../utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function Register() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets(); // ADD
  const [form, setForm] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // États pour le sélecteur de date
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [dayMenuVisible, setDayMenuVisible] = useState(false);
  const [monthMenuVisible, setMonthMenuVisible] = useState(false);
  const [yearMenuVisible, setYearMenuVisible] = useState(false);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const logoScale = useState(new Animated.Value(1))[0];
  const floatingAnim1 = useState(new Animated.Value(0))[0];
  const floatingAnim2 = useState(new Animated.Value(0))[0];

   const emailRef = useRef<any>(null);
  const phoneRef = useRef<any>(null);
  const firstNameRef = useRef<any>(null);
  const lastNameRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmRef = useRef<any>(null);

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

  // Génération des options de date
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = [
    { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  // Mettre à jour la date complète quand les parties changent
  useEffect(() => {
    if (day && month && year) {
      setForm(prev => ({
        ...prev,
        birth_date: `${year}-${month}-${day}`
      }));
    }
  }, [day, month, year]);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const onSubmit = async () => {
    if (!day || !month || !year) {
      setError("Veuillez sélectionner votre date de naissance complète");
      
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
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setSuccess(null);
      
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
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
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
      const registerData = await registerUser({
        email: form.email,
        phone: form.phone,
        first_name: form.first_name,
        last_name: form.last_name,
        birth_date: form.birth_date,
        password: form.password,
      });

      if (registerData.token) {
        await AsyncStorage.setItem('token', registerData.token);
        setSuccess("Inscription réussie! Redirection...");
        
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
          setTimeout(() => router.replace('/login'), 500);
        });
      } else if (registerData.message) {
        setSuccess("Inscription réussie! Veuillez vous connecter.");
        setTimeout(() => router.replace('/login'), 2000);
      } else {
        setSuccess("Inscription réussie! Veuillez vous connecter.");
        setTimeout(() => router.replace('/login'), 2000);
      }
    } catch (err: any) {
      console.error('Register error:', err.response?.data || err.message);
      setError(err.response?.data?.detail || err.response?.data?.message || "Erreur lors de l'inscription");
      setSuccess(null);
      
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
    } finally {
      setLoading(false);
    }
  };

  const getMonthLabel = (monthValue: string) => {
    const monthObj = months.find(m => m.value === monthValue);
    return monthObj ? monthObj.label : 'Mois';
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
      {/* <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}                 // CHANGE
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}          // CHANGE
      > */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Background décoratif identique au Login */}
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

            <ScrollView
              contentContainerStyle={[
                styles.scrollContainer,
                { paddingBottom: insets.bottom + 16 },                            // ADD
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}          // ADD
              // REMOVE these to avoid extra gap
              // contentInset={{ bottom: Platform.OS === 'ios' ? 24 : 0 }}
              // contentOffset={{ x: 0, y: 0 }}
            >
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
                {/* Logo animé identique au Login */}
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
                  Créer un compte
                </Text>

                <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                  Rejoignez notre communauté
                </Text>

                <View style={styles.form}>
                  <Animated.View style={styles.inputContainer}>
                    <TextInput
                      ref={emailRef}
                      label="Email"
                      mode="outlined"
                      value={form.email}
                      onChangeText={(v) => handleChange('email', v)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={styles.input}
                      left={<TextInput.Icon icon="email" />}
                      outlineColor={theme.colors.outline}
                      activeOutlineColor={theme.colors.primary}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => phoneRef.current?.focus()}
                    />
                  </Animated.View>

                  <Animated.View style={styles.inputContainer}>
                    <TextInput
                      ref={phoneRef}
                      label="Téléphone"
                      mode="outlined"
                      value={form.phone}
                      onChangeText={(v) => handleChange('phone', v)}
                      style={styles.input}
                      keyboardType="phone-pad"
                      left={<TextInput.Icon icon="phone" />}
                      outlineColor={theme.colors.outline}
                      activeOutlineColor={theme.colors.primary}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => firstNameRef.current?.focus()}
                    />
                  </Animated.View>

                  <View style={styles.nameRow}>
                    <Animated.View style={[styles.inputContainer, styles.halfInput]}>
                      <TextInput
                        ref={firstNameRef}
                        label="Prénom"
                        mode="outlined"
                        value={form.first_name}
                        onChangeText={(v) => handleChange('first_name', v)}
                        style={styles.input}
                        left={<TextInput.Icon icon="account" />}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => lastNameRef.current?.focus()}
                      />
                    </Animated.View>
                    
                    <Animated.View style={[styles.inputContainer, styles.halfInput]}>
                      <TextInput
                        ref={lastNameRef}
                        label="Nom"
                        mode="outlined"
                        value={form.last_name}
                        onChangeText={(v) => handleChange('last_name', v)}
                        style={styles.input}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                        returnKeyType="done"
                        blurOnSubmit={true}
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </Animated.View>
                  </View>

                  {/* Sélecteur de date amélioré avec trois dropdowns */}
                  <Text style={[styles.dateLabel, { color: theme.colors.onSurface }]}>
                    Date de naissance
                  </Text>
                  <View style={styles.dateRow}>
                    {/* Jour */}
                    <Menu
                      visible={dayMenuVisible}
                      onDismiss={() => setDayMenuVisible(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setDayMenuVisible(true)}
                          style={[
                            styles.dateButton, 
                            { borderColor: theme.colors.outline },
                            !day && styles.dateButtonEmpty
                          ]}
                          labelStyle={[styles.dateButtonLabel, { color: theme.colors.onSurface }]}
                          contentStyle={styles.dateButtonContent}
                        >
                          {day || 'Jour'}
                        </Button>
                      }
                      contentStyle={[styles.menuContent, { backgroundColor: theme.colors.surface }]}
                    >
                      <ScrollView style={styles.menuScroll} nestedScrollEnabled>
                        {days.map((d) => (
                          <Menu.Item
                            key={d}
                            onPress={() => {
                              setDay(d);
                              setDayMenuVisible(false);
                            }}
                            title={d}
                            titleStyle={[styles.menuItemText, { color: theme.colors.onSurface }]}
                          />
                        ))}
                      </ScrollView>
                    </Menu>

                    {/* Mois */}
                    <Menu
                      visible={monthMenuVisible}
                      onDismiss={() => setMonthMenuVisible(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setMonthMenuVisible(true)}
                          style={[
                            styles.dateButton, 
                            { borderColor: theme.colors.outline },
                            !month && styles.dateButtonEmpty
                          ]}
                          labelStyle={[styles.dateButtonLabel, { color: theme.colors.onSurface }]}
                          contentStyle={styles.dateButtonContent}
                        >
                          {month ? getMonthLabel(month) : 'Mois'}
                        </Button>
                      }
                      contentStyle={[styles.menuContent, { backgroundColor: theme.colors.surface }]}
                    >
                      <ScrollView style={styles.menuScroll} nestedScrollEnabled>
                        {months.map((m) => (
                          <Menu.Item
                            key={m.value}
                            onPress={() => {
                              setMonth(m.value);
                              setMonthMenuVisible(false);
                            }}
                            title={m.label}
                            titleStyle={[styles.menuItemText, { color: theme.colors.onSurface }]}
                          />
                        ))}
                      </ScrollView>
                    </Menu>

                    {/* Année */}
                    <Menu
                      visible={yearMenuVisible}
                      onDismiss={() => setYearMenuVisible(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setYearMenuVisible(true)}
                          style={[
                            styles.dateButton, 
                            { borderColor: theme.colors.outline },
                            !year && styles.dateButtonEmpty
                          ]}
                          labelStyle={[styles.dateButtonLabel, { color: theme.colors.onSurface }]}
                          contentStyle={styles.dateButtonContent}
                        >
                          {year || 'Année'}
                        </Button>
                      }
                      contentStyle={[styles.menuContent, { backgroundColor: theme.colors.surface }]}
                    >
                      <ScrollView style={styles.menuScroll} nestedScrollEnabled>
                        {years.map((y) => (
                          <Menu.Item
                            key={y}
                            onPress={() => {
                              setYear(y);
                              setYearMenuVisible(false);
                            }}
                            title={y}
                            titleStyle={[styles.menuItemText, { color: theme.colors.onSurface }]}
                          />
                        ))}
                      </ScrollView>
                    </Menu>
                  </View>

                  {form.birth_date && (
                    <Text style={[styles.selectedDate, { color: theme.colors.primary }]}>
                      Date sélectionnée: {form.birth_date}
                    </Text>
                  )}
                  
                  <Animated.View style={styles.inputContainer}>
                    <TextInput
                      ref={passwordRef}
                      label="Mot de passe"
                      mode="outlined"
                      value={form.password}
                      onChangeText={(v) => handleChange('password', v)}
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
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => confirmRef.current?.focus()}
                    />
                  </Animated.View>

                  <Animated.View style={styles.inputContainer}>
                    <TextInput
                      ref={confirmRef}
                      label="Confirmer le mot de passe"
                      mode="outlined"
                      value={form.confirmPassword}
                      onChangeText={(v) => handleChange('confirmPassword', v)}
                      secureTextEntry={!showConfirmPassword}
                      style={styles.input}
                      left={<TextInput.Icon icon="lock-check" />}
                      right={
                        <TextInput.Icon 
                          icon={showConfirmPassword ? "eye-off" : "eye"} 
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      }
                      outlineColor={theme.colors.outline}
                      activeOutlineColor={theme.colors.primary}
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={onSubmit}   // submit when done
                    />
                  </Animated.View>

                  <HelperText type="error" visible={!!error} style={styles.errorText}>
                    {error}
                  </HelperText>

                  <HelperText type="info" visible={!!success} style={styles.successText}>
                    {success}
                  </HelperText>

                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <Button
                      mode="contained"
                      onPress={onSubmit}
                      loading={loading}
                      disabled={loading || !form.email || !form.password || !form.confirmPassword || !day || !month || !year}
                      style={styles.button}
                      contentStyle={styles.buttonContent}
                    >
                      {loading ? 'Inscription...' : 'S\'inscrire'}
                    </Button>
                  </Animated.View>

                  <View style={styles.login}>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                      Déjà un compte ? 
                    </Text>
                    <Text
                      style={[styles.link, { color: theme.colors.primary }]}
                      onPress={() => router.push('/login')}
                    >
                      {' '}Se connecter
                    </Text>
                  </View>
                </View>

                {/* Debug info - à retirer en production
                <Text style={[styles.debugInfo, { color: theme.colors.onSurfaceVariant }]}>
                  API: {API_BASE_URL}
                </Text> */}
              </Animated.View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  dateLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 4,
  },
  dateButtonEmpty: {
    borderStyle: 'dashed',
  },
  dateButtonContent: {
    height: 40,
  },
  dateButtonLabel: {
    fontSize: 14,
  },
  menuContent: {
    maxHeight: 200,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuScroll: {
    maxHeight: 200,
  },
  menuItemText: {
    fontSize: 14,
  },
  selectedDate: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#4CAF50',
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
  login: {
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