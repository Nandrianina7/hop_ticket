import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Text,
  Button,
  useTheme,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { buyTicket, fetchEventPriceTiers } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import SelectedSeatsBill from './SelectedSeatsBill';
import TaxiStep from '../cinema/components/TaxiStep';
import { purchaseStyles } from './purchaseStyles';
import { PurchaseStepper } from './PurchaseStepper';

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
  <View style={[purchaseStyles.header, { backgroundColor: theme.colors.background }]}>
    <Ionicons
      name="arrow-back"
      size={24}
      color={theme.colors.primary}
      onPress={onBack}
      style={purchaseStyles.backButton}
    />
    <Text variant="headlineSmall" style={[purchaseStyles.title, { color: theme.colors.onBackground }]}>
      Confirmation d'achat
    </Text>
  </View>
);

// Composant principal
export default function ConfirmPurchase() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();

  // Récupération des paramètres
  const event = JSON.parse(params.event as string) as EventType;
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
                  `Seulement ${
                    matchingTier.available_quantity
                  } tickets disponibles pour la catégorie ${
                    matchingTier.tier_type
                  }. Vous avez sélectionné ${
                    seat.length
                  } sièges.`
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
      <View style={[purchaseStyles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[purchaseStyles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
          Chargement des types de tickets...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={[
        purchaseStyles.container, 
        { backgroundColor: theme.colors.background }
      ]}
    >
      <PurchaseHeader onBack={() => router.back()} theme={theme} />
      
      <PurchaseStepper step={step} theme={theme} />

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
    
            <View style={[purchaseStyles.pricePreview, { backgroundColor: theme.colors.primaryContainer }]}>
              <View style={purchaseStyles.priceRow}>
                <Text style={[purchaseStyles.priceLabel, { color: theme.colors.onPrimaryContainer }]}>
                  Total tickets:
                </Text>
                <Text style={[purchaseStyles.priceValue, { color: theme.colors.onPrimaryContainer }]}>
                  {price} MGA
                </Text>
              </View>
              {taxiOption.price > 0 && (
                <View style={purchaseStyles.priceRow}>
                  <Text style={[purchaseStyles.priceLabel, { color: theme.colors.onPrimaryContainer }]}>
                    Taxi:
                  </Text>
                  <Text style={[purchaseStyles.priceValue, { color: theme.colors.onPrimaryContainer }]}>
                    + {taxiOption.price} MGA
                  </Text>
                </View>
              )}
              <View style={[purchaseStyles.priceRow, purchaseStyles.totalRow]}>
                <Text style={[purchaseStyles.totalLabel, { color: theme.colors.onPrimaryContainer }]}>
                  Total à payer:
                </Text>
                <Text style={[purchaseStyles.totalValue, { color: theme.colors.onPrimaryContainer }]}>
                  {price + taxiOption.price} MGA
                </Text>
              </View>
            </View>

            <Button 
              mode="contained" 
              onPress={proceedToNextStep}
              style={purchaseStyles.nextButton}
              contentStyle={purchaseStyles.nextButtonContent}
              disabled={!selectedTier}
              icon="arrow-right"
            >
              Suivant
            </Button>
          </>
        )}       

        {step === 2 && (
          <View style={purchaseStyles.stepContainer}>
            <View style={purchaseStyles.confirmationSection}>
              <View style={[purchaseStyles.orderDetails, { backgroundColor: theme.colors.surfaceVariant }]}>
                
                {taxiOption.price > 0 && (
                  <View style={purchaseStyles.orderRow}>
                    <Text style={[purchaseStyles.orderLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Taxi:
                    </Text>
                    <Text style={[purchaseStyles.orderValue, { color: theme.colors.onSurfaceVariant }]}>
                      {taxiOption.label} - {taxiOption.price} MGA
                    </Text>
                  </View>
                )}
          
                <Divider style={[purchaseStyles.orderDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          
                <View style={[purchaseStyles.orderRow, purchaseStyles.totalRow]}>
                  <Text style={[purchaseStyles.totalLabel, { color: theme.colors.onSurface }]}>
                    Total à payer:
                  </Text>
                  <Text style={[purchaseStyles.totalValue, { color: theme.colors.primary }]}>
                    {price + taxiOption.price} MGA
                  </Text>
                </View>
              </View>
            </View>

            <View style={purchaseStyles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={goBackToPreviousStep}
                style={[purchaseStyles.backButtonStep, { borderColor: theme.colors.outline }]}
                icon="arrow-left"
                textColor={theme.colors.primary}
              >
                Précédent
              </Button>
      
              <Button 
                mode="contained" 
                onPress={handleConfirmPurchase}
                loading={loading}
                disabled={loading || !selectedTier}
                style={purchaseStyles.confirmButton}
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


const screenWidth = Dimensions.get('window').width - 40;