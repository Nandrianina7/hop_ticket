// app/cinema/confirmation.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Easing,
  Image,
  Dimensions
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface DetailItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

export default function ConfirmationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { 
    ticketCode, 
    totalPrice, 
    seatCount, 
    taxiPrice, 
    foodPrice,
    reservationCode 
  } = useLocalSearchParams();

  // Animations
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Animation séquence du check
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Animation pulsation pour boutons
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, fadeAnim, slideAnim, pulseAnim]);

  const handleBackToHome = () => router.replace('/cinema');
  const handleViewTickets = () => router.push('./ticket_cinema');
  const handleShareTicket = () => console.log('Partager le ticket');

  const scaleStyle = { transform: [{ scale: scaleAnim }] };
  const fadeSlideStyle = { opacity: fadeAnim, transform: [{ translateY: slideAnim }] };
  const pulseStyle = { transform: [{ scale: pulseAnim }] };

  // Calcul des totaux
  const ticketPrice = parseFloat(totalPrice as string) - (parseFloat(taxiPrice as string) || 0) - (parseFloat(foodPrice as string) || 0);
  const finalTaxiPrice = parseFloat(taxiPrice as string) || 0;
  const finalFoodPrice = parseFloat(foodPrice as string) || 0;

  const details: DetailItem[] = [
    { icon: <Ionicons name="qr-code" size={20} color={theme.colors.onSurfaceVariant} />, label: 'Numéro', value: `#${reservationCode || ticketCode}` },
    { icon: <Ionicons name="people" size={20} color={theme.colors.onSurfaceVariant} />, label: 'Places', value: `${seatCount} place(s)` },
    { icon: <Ionicons name="calendar" size={20} color={theme.colors.onSurfaceVariant} />, label: 'Date', value: new Date().toLocaleDateString('fr-FR') },
    { icon: <Ionicons name="time" size={20} color={theme.colors.onSurfaceVariant} />, label: 'Heure', value: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
  ];

  const prices = [
    { label: 'Places de cinéma', amount: ticketPrice.toFixed(2) },
    ...(finalTaxiPrice > 0 ? [{ label: 'Service taxi', amount: finalTaxiPrice.toFixed(2) }] : []),
    ...(finalFoodPrice > 0 ? [{ label: 'Restauration', amount: finalFoodPrice.toFixed(2) }] : []),
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header avec vague */}
        <View style={[styles.headerWave,]}>
          <View style={styles.wave} />
        </View>

        {/* Image de confirmation animée */}
        <Animated.View style={[styles.iconContainer, scaleStyle]}>
          <View style={[styles.iconCircle, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Image
              source={require('../../assets/images/confirmation.png')} // <-- ton image perso
              style={styles.successImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Contenu principal */}
        <Animated.View style={[styles.content, fadeSlideStyle]}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>Réservation Confirmée !</Text>
          <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
            Félicitations ! Votre séance de cinéma a été réservée avec succès. Retrouvez vos billets dans 'Mes Tickets'.
          </Text>

          {/* Carte de réservation */}
          <View style={[styles.reservationCard, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.primary }]}>
            <View style={[styles.cardHeader, { backgroundColor: `${theme.colors.primary}10` }]}>
              <Ionicons name="ticket" size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Votre Réservation</Text>
            </View>

            <View style={styles.detailsGrid}>
              {details.map((item) => (
                <View key={item.label} style={styles.detailItem}>
                  {item.icon}
                  <View style={styles.detailText}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>{item.label}</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Carte prix */}
          <Animated.View style={[styles.priceCard, { backgroundColor: theme.colors.surface }, fadeSlideStyle]}>
            <Text style={[styles.priceTitle, { color: theme.colors.onBackground }]}>Détails du Prix</Text>
            <View style={styles.priceBreakdown}>
              {prices.map((item) => (
                <View key={item.label} style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.colors.onSurfaceVariant }]}>{item.label}</Text>
                  <Text style={[styles.priceAmount, { color: theme.colors.onSurface }]}>{item.amount} MGA</Text>
                </View>
              ))}
              <View style={[styles.totalRow, { borderTopColor: theme.colors.outline }]}>
                <Text style={[styles.totalLabel, { color: theme.colors.onBackground }]}>Total</Text>
                <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>{totalPrice} MGA</Text>
              </View>
            </View>
          </Animated.View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={[styles.instructionsTitle, { color: theme.colors.onBackground }]}>Prochaines Étapes</Text>

            <View style={styles.instructionList}>
              <View style={styles.instructionItem}>
                <View style={[styles.instructionIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                  <Ionicons name="ticket" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.instructionContent}>
                  <Text style={[styles.instructionStep, { color: theme.colors.onBackground }]}>Billets disponibles</Text>
                  <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
                    Retrouvez vos billets électroniques dans 'Mes Tickets'
                  </Text>
                </View>
              </View>

              <View style={styles.instructionItem}>
                <View style={[styles.instructionIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                  <Ionicons name="time" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.instructionContent}>
                  <Text style={[styles.instructionStep, { color: theme.colors.onBackground }]}>Arrivez à l'avance</Text>
                  <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
                    Présentez-vous 30 minutes avant le début de la séance
                  </Text>
                </View>
              </View>

              <View style={styles.instructionItem}>
                <View style={[styles.instructionIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                  <Ionicons name="qr-code" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.instructionContent}>
                  <Text style={[styles.instructionStep, { color: theme.colors.onBackground }]}>Code QR requis</Text>
                  <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
                    Ayez votre code de réservation prêt à scanner
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <Animated.View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.outline }, fadeSlideStyle]}>
        <Animated.View style={pulseStyle}>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]} onPress={handleViewTickets} activeOpacity={0.9}>
            <Ionicons name="ticket" size={24} color={theme.colors.onPrimary} />
            <Text style={[styles.primaryButtonText, { color: theme.colors.onPrimary }]}>Voir Mes Billets</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.secondaryButtons}>
          <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surface }]} onPress={handleShareTicket}>
            <Ionicons name="share-social" size={20} color={theme.colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>Partager</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surface }]} onPress={handleBackToHome}>
            <Ionicons name="home" size={20} color={theme.colors.onSurface} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.onSurface }]}>Accueil</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  headerWave: { height: 100, overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  wave: { position: 'absolute', bottom: -20, left: -50, right: -50, height: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 50 },
  iconContainer: { alignItems: 'center', marginTop: -40, marginBottom: 20, zIndex: 10 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  successImage: { width: 80, height: 80 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 },
  message: { fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 24, letterSpacing: 0.3 },
  reservationCard: { borderRadius: 20, marginBottom: 24, elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  detailsGrid: { padding: 20, gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailText: { flex: 1 },
  detailLabel: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  detailValue: { fontSize: 16, fontWeight: '600' },
  priceCard: { borderRadius: 20, padding: 20, marginBottom: 24, elevation: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  priceTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  priceBreakdown: { gap: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 14, fontWeight: '500' },
  priceAmount: { fontSize: 14, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTopWidth: 1 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalAmount: { fontSize: 20, fontWeight: 'bold' },
  instructions: { marginBottom: 20 },
  instructionsTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  instructionList: { gap: 16 },
  instructionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  instructionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  instructionContent: { flex: 1 },
  instructionStep: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  instructionText: { fontSize: 14 },
  footer: { paddingVertical: 16, paddingHorizontal: 20, borderTopWidth: 1 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, elevation: 4 },
  primaryButtonText: { fontSize: 16, fontWeight: 'bold' },
  secondaryButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 12 },
  secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  secondaryButtonText: { fontSize: 14, fontWeight: '600' },
});
