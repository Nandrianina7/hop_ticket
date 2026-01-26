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
        <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Type</Text>
      </View>
      <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
      <View style={[styles.step, step >= 2 && styles.stepActive]}>
        <Text style={[styles.stepText, step >= 2 && styles.stepTextActive]}>2</Text>
        <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Quantité</Text>
      </View>
      <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
      <View style={[styles.step, step >= 3 && styles.stepActive]}>
        <Text style={[styles.stepText, step >= 3 && styles.stepTextActive]}>3</Text>
        <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>Confirmation</Text>
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

// Composant pour la sélection du type de ticket
const TierSelectionStep = ({ 
  priceTiers, 
  selectedTier, 
  onTierSelect, 
  onNext,
  theme 
}: { 
  priceTiers: PriceTier[];
  selectedTier: PriceTier | null;
  onTierSelect: (tier: PriceTier) => void;
  onNext: () => void;
  theme: any;
}) => {
  const getTierColor = (tierType: string) => {
    const colors = {
      'VIP': '#FFD700',
      'BRONZE': '#CD7F32',
      'ARGENT': '#C0C0C0',
      'PUBLIC': theme.colors.primary,
    };
    return colors[tierType as keyof typeof colors] || theme.colors.primary;
  };

  return (
    <View style={styles.stepContainer}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Choisissez votre type de ticket
      </Text>
      
      <View style={styles.tiersContainer}>
        {priceTiers.map((tier) => {
          const soldOut = tier.available_quantity <= 0;
          const tierColor = getTierColor(tier.tier_type);
          
          return (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.tierCard,
                selectedTier?.id === tier.id && [styles.tierCardSelected, { borderColor: tierColor }],
                soldOut && styles.tierCardDisabled
              ]}
              onPress={() => !soldOut && onTierSelect(tier)}
              disabled={soldOut}
            >
              <View style={styles.tierHeader}>
                <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
                  <Text style={styles.tierBadgeText}>{tier.tier_type}</Text>
                </View>
                {soldOut && (
                  <View style={styles.soldOutBadge}>
                    <Text style={styles.soldOutText}>Sold Out</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.tierPrice}>{tier.price}MGA</Text>
              <Text style={styles.tierAvailability}>
                {soldOut ? 'Épuisé' : `${tier.available_quantity} places disponibles`}
              </Text>
              
              {selectedTier?.id === tier.id && (
                <View style={[styles.selectedIndicator, { backgroundColor: tierColor }]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        mode="contained"
        onPress={onNext}
        disabled={!selectedTier}
        style={styles.nextButton}
        contentStyle={styles.nextButtonContent}
      >
        Continuer vers la quantité
      </Button>
    </View>
  );
};

// Composant pour la sélection de la quantité
const QuantitySelectionStep = ({
  selectedTier,
  quantity,
  onQuantityChange,
  onNext,
  onBack,
  theme
}: {
  selectedTier: PriceTier;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onNext: () => void;
  onBack: () => void;
  theme: any;
}) => {
  const totalPrice = selectedTier.price * quantity;

  const incrementQuantity = () => {
    if (quantity < selectedTier.available_quantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Sélectionnez la quantité
      </Text>
      
      <View style={styles.quantityStepper}>
        <TouchableOpacity
          style={[
            styles.stepperButton,
            quantity <= 1 && styles.stepperButtonDisabled
          ]}
          onPress={decrementQuantity}
          disabled={quantity <= 1}
        >
          <Ionicons 
            name="remove" 
            size={24} 
            color={quantity <= 1 ? '#ccc' : theme.colors.primary} 
          />
        </TouchableOpacity>
        
        <View style={styles.quantityDisplay}>
          <Text style={styles.quantityText}>{quantity}</Text>
          <Text style={styles.quantityLabel}>ticket(s)</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.stepperButton,
            quantity >= selectedTier.available_quantity && styles.stepperButtonDisabled
          ]}
          onPress={incrementQuantity}
          disabled={quantity >= selectedTier.available_quantity}
        >
          <Ionicons 
            name="add" 
            size={24} 
            color={quantity >= selectedTier.available_quantity ? '#ccc' : theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.quantityHint}>
        Maximum {selectedTier.available_quantity} places disponibles
      </Text>

      {/* Résumé du prix */}
      <View style={styles.pricePreview}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{quantity} × {selectedTier.price}MGA</Text>
          <Text style={styles.priceValue}>{totalPrice}MGA</Text>
        </View>
      </View>

      <View style={styles.quantityActions}>
        <Button
          mode="outlined"
          onPress={onBack}
          style={styles.backButtonStep}
          icon="arrow-left"
        >
          Retour
        </Button>
        
        <Button
          mode="contained"
          onPress={onNext}
          style={styles.nextButton}
          contentStyle={styles.nextButtonContent}
        >
          Confirmer la commande
        </Button>
      </View>
    </View>
  );
};

// Composant pour la confirmation finale
const ConfirmationStep = ({
  event,
  selectedTier,
  quantity,
  loading,
  onConfirmPurchase,
  onBack,
  theme
}: {
  event: EventType;
  selectedTier: PriceTier;
  quantity: number;
  loading: boolean;
  onConfirmPurchase: () => void;
  onBack: () => void;
  theme: any;
}) => {
  const totalPrice = selectedTier.price * quantity;

  return (
    <View style={styles.stepContainer}>
      <View style={styles.confirmationHeader}>
        <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
        <Text variant="titleMedium" style={styles.confirmationTitle}>
          Récapitulatif de commande
        </Text>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Événement:</Text>
          <Text style={styles.orderValue}>{event.name}</Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Type de ticket:</Text>
          <Text style={styles.orderValue}>{selectedTier.tier_type}</Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Quantité:</Text>
          <Text style={styles.orderValue}>{quantity}</Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Prix unitaire:</Text>
          <Text style={styles.orderValue}>{selectedTier.price}MGA</Text>
        </View>
        <Divider style={styles.orderDivider} />
        <View style={[styles.orderRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{totalPrice}MGA</Text>
        </View>
      </View>

      <View style={styles.finalActions}>
        <Button
          mode="outlined"
          onPress={onBack}
          style={styles.backButtonStep}
          icon="arrow-left"
        >
          Retour
        </Button>
        
        <Button
          mode="contained"
          onPress={onConfirmPurchase}
          loading={loading}
          disabled={loading}
          style={styles.confirmButton}
          icon="check"
          contentStyle={styles.confirmButtonContent}
        >
          Confirmer l'achat
        </Button>
      </View>
    </View>
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

  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [tiersLoading, setTiersLoading] = useState(true);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const screenWidth = Dimensions.get('window').width - 40;

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
  }, [fadeAnim, slideAnim]);

  // Charger les types de tickets
// REMPLACEZ le useEffect existant par celui-ci :
// Dans confirm-purchase.tsx - CORRIGEZ le useEffect
useEffect(() => {
  const loadPriceTiers = async () => {
    try {
      // Utilisez la fonction importée fetchEventPriceTiers
      const eventData = await fetchEventPriceTiers(event.id.toString());
      setPriceTiers(eventData.price_tiers || []);
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
    if (!selectedTier || quantity <= 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins 1 ticket');
      return;
    }

    if (quantity > selectedTier.available_quantity) {
      Alert.alert('Erreur', `Seulement ${selectedTier.available_quantity} tickets disponibles`);
      return;
    }

    setLoading(true);
    try {
      // Acheter les tickets
      for (let i = 0; i < quantity; i++) {
        await buyTicket(event.id, selectedTier.id);
      }

      Alert.alert(
        'Succès',
        `${quantity} ticket(s) acheté(s) avec succès!`,
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
      Alert.alert(
        'Erreur',
        error.message || 'Une erreur s\'est produite lors de l\'achat'
      );
    } finally {
      setLoading(false);
    }
  };

  const proceedToNextStep = () => {
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
        <ActivityIndicator size="large" />
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
        <EventCard event={event} tier={selectedTier} theme={theme} />

        {step === 1 && (
          <TierSelectionStep
            priceTiers={priceTiers}
            selectedTier={selectedTier}
            onTierSelect={setSelectedTier}
            onNext={proceedToNextStep}
            theme={theme}
          />
        )}

        {step === 2 && selectedTier && (
          <QuantitySelectionStep
            selectedTier={selectedTier}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onNext={proceedToNextStep}
            onBack={goBackToPreviousStep}
            theme={theme}
          />
        )}

        {step === 3 && selectedTier && (
          <ConfirmationStep
            event={event}
            selectedTier={selectedTier}
            quantity={quantity}
            loading={loading}
            onConfirmPurchase={handleConfirmPurchase}
            onBack={goBackToPreviousStep}
            theme={theme}
          />
          
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
    paddingHorizontal: 10,
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
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
  },
  confirmButtonContent: {
    paddingVertical: 6,
  },
});

const screenWidth = Dimensions.get('window').width - 40;