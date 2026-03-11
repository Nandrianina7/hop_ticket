// app/event/confirm-purchase.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  useTheme,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { buyTicket, fetchEventById, fetchEventPriceTiers } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import SelectedSeatsBill from './SelectedSeatsBill';
import TaxiStep from '../cinema/components/TaxiStep';
import FoodStep from '../cinema/components/FoodStep';

type PriceTier = {
  id: number;
  tier_type: string;
  price: number;
  available_quantity: number;
};

type EventType = {
  id: number;
  name: string;
  date: string;
  venue: string;
  image_url?: string;
};

type VenuePlan = {
  id: number;
  site_name: string;
  elements: any[];
  metadata: any;
};

type SeatBillItem = {
  id: string | number;
  categoryName?: string;
  label?: string;
  row?: string | number;
  number?: string | number;
  price?: string | number;
  status?: string;
  tier?: string;
};

// Composant pour l'en-tête
const PurchaseHeader = ({ onBack, theme }: { onBack: () => void; theme: any }) => (
  <View style={styles.header}>
    <Ionicons
      name="arrow-back"
      size={24}
      color={theme.colors.primary}
      onPress={onBack}
      style={styles.backButton}
    />
    <Text variant="headlineSmall" style={styles.title}>
      Confirmation d'achat
    </Text>
  </View>
);

// Composant pour le stepper
const PurchaseStepper = ({ step }: { step: number }) => (
  <View style={styles.stepperContainer}>
    <View style={styles.stepper}>
      <View style={[styles.step, step >= 1 && styles.stepActive]}>
        <Text style={[styles.stepText, step >= 1 && styles.stepTextActive]}>1</Text>
        <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Deplacement</Text>
      </View>
      <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
      <View style={[styles.step, step >= 2 && styles.stepActive]}>
        <Text style={[styles.stepText, step >= 2 && styles.stepTextActive]}>2</Text>
        <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Confirmation</Text>
      </View>
    </View>
  </View>
);

// Composant pour la carte d'événement
const EventCard = ({ event, tier, theme }: { event: EventType; tier: PriceTier | null; theme: any }) => {
  const getTierColor = (tierType: string) => {
    const colors = {
      'VIP': '#FFD700',
      'BRONZE': '#CD7F32',
      'ARGENT': '#C0C0C0',
      'PUBLIC': theme.colors.primary,
    };
    return colors[tierType as keyof typeof colors] || theme.colors.primary;
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <Card style={[styles.card, { width: screenWidth }]} elevation={4}>
      <Card.Content>
        <View style={styles.eventHeader}>
          <Text variant="titleLarge" style={styles.eventName}>
            {event.name}
          </Text>
          {tier && (
            <View style={[styles.tierBadge, { backgroundColor: getTierColor(tier.tier_type) }]}>
              <Text style={styles.tierBadgeText}>{tier.tier_type}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.eventDetails}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text variant="bodyMedium" style={styles.detailText}>
            {formatDate(event.date)}
          </Text>
        </View>

        <View style={styles.eventDetails}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text variant="bodyMedium" style={styles.detailText}>
            {event.venue}
          </Text>
        </View>

        <Divider style={styles.divider} />
      </Card.Content>
    </Card>
  );
};

// Composant principal
export default function ConfirmPurchase() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();

  // Récupération des paramètres
  const event = JSON.parse(params.event as string) as EventType;
  const venuePlans = params.venuePlans ? JSON.parse(params.venuePlans as string) as VenuePlan[] : [];
  const ticketTotal = Number(params.total);
  const price = Number(params.price ?? 0);
  const seat = JSON.parse(params.seats as any) as SeatBillItem[];
  
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [tiersLoading, setTiersLoading] = useState(false);
  const [taxiOption, setTaxiOption] = useState({ type: 'none', label: 'Aucun taxi', price: 0 });
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const screenWidth = Dimensions.get('window').width - 40;

  // Set quantity based on number of seats
  useEffect(() => {
    if (seat && seat.length > 0) {
      setQuantity(seat.length);
    }
  }, [seat]);

  // Animation effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, step]);

  // Charger les types de tickets et trouver le tier correspondant aux sièges
  useEffect(() => {
    const loadPriceTiers = async () => {
      try {
        setTiersLoading(true);
        const eventData = await fetchEventPriceTiers(event.id.toString());
        const tiers = eventData.price_tiers || [];
        setPriceTiers(tiers);
        
        // Trouver le tier correspondant basé sur le premier siège
        if (seat && seat.length > 0 && tiers.length > 0) {
          const firstSeat = seat[0];
          if (firstSeat.tier || firstSeat.categoryName) {
            const tierType = (firstSeat.tier || firstSeat.categoryName || '').toString();
            
            // Chercher une correspondance (insensible à la casse)
            const matchingTier = tiers.find((t: any) => 
              t.tier_type.toLowerCase() === tierType.toLowerCase() ||
              t.tier_type.toLowerCase().includes(tierType.toLowerCase()) ||
              tierType.toLowerCase().includes(t.tier_type.toLowerCase())
            );
            
            if (matchingTier) {
              setSelectedTier(matchingTier);
              
              // Vérifier la disponibilité
              if (matchingTier.available_quantity < seat.length) {
                Alert.alert(
                  'Attention', 
                  `Seulement ${matchingTier.available_quantity} tickets disponibles pour la catégorie ${matchingTier.tier_type}. Vous avez sélectionné ${seat.length} sièges.`
                );
              }
            } else {
              // Si aucun tier correspondant trouvé, prendre le premier disponible
              console.warn('Aucun tier correspondant trouvé pour:', tierType);
              if (tiers.length > 0) {
                setSelectedTier(tiers[0]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des types de tickets:', error);
        Alert.alert('Erreur', 'Impossible de charger les types de tickets');
      } finally {
        setTiersLoading(false);
      }
    };

    loadPriceTiers();
  }, [event.id]);

  const handleConfirmPurchase = async () => {
    if (!selectedTier) {
      Alert.alert('Erreur', 'Type de ticket non trouvé');
      return;
    }

    if (seat.length > selectedTier.available_quantity) {
      Alert.alert(
        'Erreur', 
        `Seulement ${selectedTier.available_quantity} tickets disponibles pour la catégorie ${selectedTier.tier_type}`
      );
      return;
    }

    setLoading(true);
    try {
      // Acheter un ticket pour chaque siège sélectionné
      for (const seatItem of seat) {
        await buyTicket(
          event.id, 
          selectedTier.id, 
          seatItem.id.toString(), 
          1
        );
      }

      Alert.alert(
        'Succès',
        `${seat.length} ticket(s) acheté(s) avec succès!`,
        [
          {
            text: 'Voir mes tickets',
            onPress: () => router.replace('/event/myticket_events'),
          },
          {
            text: 'Continuer',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Erreur lors de l\'achat:', error);
      
      // Gérer les erreurs spécifiques
      let errorMessage = 'Une erreur s\'est produite lors de l\'achat';
      
      if (error.response) {
        // Erreur de l'API
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Certains sièges ne sont plus disponibles';
        } else if (error.response.status === 404) {
          errorMessage = 'Événement ou type de ticket non trouvé';
        } else if (error.response.status === 409) {
          errorMessage = 'Conflit: certains sièges ont déjà été réservés';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const proceedToNextStep = () => {
    if (!selectedTier) {
      Alert.alert('Erreur', 'Impossible de déterminer le type de ticket');
      return;
    }
    setStep(step + 1);
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const goBackToPreviousStep = () => {
    setStep(step - 1);
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };


  if (tiersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement des types de tickets...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PurchaseHeader onBack={() => router.back()} theme={theme} />
      
      <PurchaseStepper step={step} />

      <Animated.View
        style={[
          { width: screenWidth },
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={{ marginBottom: 6}}>
          <SelectedSeatsBill seats={seat} />
        </View>

        {step === 1 && (
          <>
            <TaxiStep 
              taxiOption={taxiOption} 
              setTaxiOption={setTaxiOption}  
              theme={theme}
            />
    
            <View style={styles.pricePreview}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Total tickets:</Text>
                <Text style={styles.priceValue}>{price} MGA</Text>
              </View>
              {taxiOption.price > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Taxi:</Text>
                  <Text style={styles.priceValue}>+ {taxiOption.price} MGA</Text>
                </View>
              )}
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total à payer:</Text>
                <Text style={styles.totalValue}>{price + taxiOption.price} MGA</Text>
              </View>
            </View>

            <Button 
              mode="contained" 
              onPress={proceedToNextStep}
              style={styles.nextButton}
              contentStyle={styles.nextButtonContent}
              disabled={!selectedTier}
              icon="arrow-right"
            >
              Suivant
            </Button>
          </>
        )}       

        {step === 2 && (
          <View style={styles.stepContainer}>
            <View style={styles.confirmationSection}>
              <View style={styles.orderDetails}>
                
                {taxiOption.price > 0 && (
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Taxi:</Text>
                    <Text style={styles.orderValue}>{taxiOption.label} - {taxiOption.price} MGA</Text>
                  </View>
                )}
          
                <Divider style={styles.orderDivider} />
          
                <View style={[styles.orderRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total à payer:</Text>
                  <Text style={styles.totalValue}>
                    {price + taxiOption.price} MGA
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={goBackToPreviousStep}
                style={styles.backButtonStep}
                icon="arrow-left"
              >
                Précédent
              </Button>
      
              <Button 
                mode="contained" 
                onPress={handleConfirmPurchase}
                loading={loading}
                disabled={loading || !selectedTier}
                style={styles.confirmButton}
                icon="check"
              >
                Confirmer l'achat
              </Button>
            </View>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    minHeight: '100%',
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  backButton: {
    marginRight: 15,
    padding: 4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  stepperContainer: {
    width: '100%',
    marginBottom: 30,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    alignItems: 'center',
    paddingHorizontal: 1,
  },
  stepActive: {
    // Active state styles
  },
  stepText: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  stepTextActive: {
    backgroundColor: '#2196F3',
    color: '#fff',
  },
  stepLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '400',
  },
  stepLabelActive: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: '#2196F3',
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  eventName: {
    flex: 1,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 10,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tierBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#ecf0f1',
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2c3e50',
    textAlign: 'center',
  },
  tiersContainer: {
    gap: 12,
    marginBottom: 30,
    width: '100%',
  },
  tierCard: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    position: 'relative',
  },
  tierCardSelected: {
    borderWidth: 2,
    backgroundColor: '#f8f9ff',
  },
  tierCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  soldOutBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  soldOutText: {
    color: '#c62828',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  tierAvailability: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 8,
    width: '100%',
    marginTop: 20,
  },
  nextButtonContent: {
    paddingVertical: 8,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepperButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  stepperButtonDisabled: {
    opacity: 0.5,
  },
  quantityDisplay: {
    alignItems: 'center',
    marginHorizontal: 30,
    minWidth: 80,
  },
  quantityText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quantityHint: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  pricePreview: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 30,
    marginTop: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  quantityActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  backButtonStep: {
    flex: 1,
    marginRight: 8,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#2c3e50',
    textAlign: 'center',
  },
  orderDetails: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  orderDivider: {
    marginVertical: 16,
  },
  totalRow: {
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  finalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  confirmButtonContent: {
    paddingVertical: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  confirmationSection: {
    width: '100%',
    marginBottom: 20,
  },
  tierSummaryCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  tierSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tierDivider: {
    marginVertical: 12,
  },
  tierSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tierSummaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  tierSummaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

const screenWidth = Dimensions.get('window').width - 40;