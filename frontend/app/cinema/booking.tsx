// app/cinema/booking.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { axiosInstance } from '../../utils/api';

// Import des composants
import SeatGrid from '../../components/SeatGrid';
import DateAndTimeSection from './components/DateAndTimeSection';
import ScreenSection from './components/ScreenSection';
import Stepper from './components/Stepper';
import TaxiStep from './components/TaxiStep';
import FoodStep from './components/FoodStep';
import PaymentStep from './components/PaymentStep';

import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');


interface Cinema {
  id: number;
  name: string;
  city: string;
}

interface Seat {
  id: string;  // Composite ID: "configId-row-col"
  rows: string;
  cols: string;
  seat_type: string;
  price_multiplier: number;
  is_available: boolean;
  is_vip?: boolean;
  is_disabled?: boolean;
  is_reserved?: boolean;
}

interface CinemaHall {
  id: number;
  name: string;
  screen_type: string;
  base_price: number;
  cinema: Cinema;
}

interface MovieSession {
  id: number;
  start_time: string;
  end_time: string;
  base_price: number;
  hall: CinemaHall;
  cinema_name?: string;
  cinema_city?: string;
  movie: {
    id: number;
    title: string;
    duration: number;
  };
}

const STEPS = ['Sièges','Restauration', 'Paiement'];

export default function BookingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { sessionId, movieId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<MovieSession | null>(null);
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [taxiOption, setTaxiOption] = useState({ type: 'none', label: 'Aucun taxi', price: 0 });
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Charger les sessions du film
  const fetchMovieSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      
      if (!movieId) {
        Alert.alert('Erreur', 'ID de film manquant');
        return;
      }

      const response = await axiosInstance.get(`/cinema/movies/${movieId}/sessions/`);
      setSessions(response.data);
      
      // Si un sessionId est fourni dans les paramètres, le sélectionner
      if (sessionId) {
        const initialSession = response.data.find((s: MovieSession) => s.id.toString() === sessionId);
        if (initialSession) {
          setSelectedSession(initialSession);
        }
      } else if (response.data.length > 0) {
        // Sinon, sélectionner la première session
        setSelectedSession(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching movie sessions:', error);
      Alert.alert('Erreur', 'Impossible de charger les sessions du film');
    } finally {
      setLoadingSessions(false);
    }
  }, [movieId, sessionId]);

  // Charger les sièges pour la session sélectionnée
  const fetchSessionSeats = useCallback(async () => {
    try {
      if (!selectedSession) return;
      
      setLoading(true);
      const seatsResponse = await axiosInstance.get(`/cinema/sessions/${selectedSession.id}/seats/`);
      setSeats(seatsResponse.data.seats || []);
    } catch (error) {
      console.error('Error fetching session seats:', error);
      Alert.alert('Erreur', 'Impossible de charger les sièges');
    } finally {
      setLoading(false);
    }
  }, [selectedSession]);

  useEffect(() => {
    fetchMovieSessions();
  }, [fetchMovieSessions]);

  useEffect(() => {
    if (selectedSession) {
      fetchSessionSeats();
    }
  }, [selectedSession, fetchSessionSeats]);

  // Empêche les doublons dans la sélection
  const toggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats(prev => {
        if (!prev.includes(seatId)) {
          return [...prev, seatId];
        }
        return prev;
      });
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedSession) return 0;
    
    const basePrice = selectedSession.base_price || selectedSession.hall.base_price;
    
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.id === seatId);
      if (seat) {
        let seatPrice = basePrice * seat.price_multiplier;
        if (seat.is_vip) {
          seatPrice *= 1.5; // Majoration VIP
        }
        return total + seatPrice;
      }
      return total;
    }, 0);
  };

  const handleNextStep = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Étape de confirmation - gérer le paiement
      await handleBookTickets();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookTickets = async () => {
    setIsProcessingPayment(true);
    try {
      // Validation des données de base
      if (!selectedSession) {
        Alert.alert('Erreur', 'Veuillez sélectionner une session');
        setIsProcessingPayment(false);
        return;
      }

      if (selectedSeats.length === 0) {
        Alert.alert('Erreur', 'Veuillez sélectionner au moins un siège');
        setIsProcessingPayment(false);
        return;
      }

      // Vérification de la disponibilité des sièges
      await fetchSessionSeats();
      const updatedSeats = await axiosInstance.get(`/cinema/sessions/${selectedSession.id}/seats/`);
      const availableSeats = updatedSeats.data.seats.filter((seat: any) => seat.is_available);
      const availableSeatIds = availableSeats.map((seat: any) => seat.id);
      
      const unavailableSeats = selectedSeats.filter(seatId => !availableSeatIds.includes(seatId));
      
      if (unavailableSeats.length > 0) {
        Alert.alert(
          'Sièges indisponibles', 
          `${unavailableSeats.length} siège(s) ne sont plus disponibles. Veuillez en sélectionner d'autres.`
        );
        fetchSessionSeats();
        setIsProcessingPayment(false);
        return;
      }

      // Validation des articles de nourriture
      console.log('Food items before processing:', foodItems);
      
      // Vérifier que tous les articles existent
      const foodItemIds = foodItems.map(item => item.item);
      console.log('Food item IDs being sent:', foodItemIds);

      // Vérifier la disponibilité des articles
      for (const item of foodItems) {
        if (!item.item || item.item <= 0) {
          console.error('Invalid food item found:', item);
          Alert.alert('Erreur', `Article invalide: ${item.name}`);
          setIsProcessingPayment(false);
          return;
        }
      }

      const mappedFoodItems = foodItems.map(item => ({
        item: item.item,        // Garder 'item' comme clé
        quantity: item.quantity,
        price: item.price_at_time || item.price
      }));

      console.log('Mapped food items for API:', mappedFoodItems);

      const reservationData = {
        session: selectedSession.id,
        seats: selectedSeats,
        taxi_option: taxiOption,
        food_items: mappedFoodItems,
        payment_method: paymentMethod
      };

      console.log('Final reservation data:', JSON.stringify(reservationData, null, 2));

      // Envoyer la requête
      const response = await axiosInstance.post('/cinema/tickets/create/', reservationData);

      // Nouvelle logique : accepter la redirection si on a un id/code de réservation
      const reservationObj = response.data.reservation || {};
      const reservationId = reservationObj.id || response.data.reservation_id;
      const reservationCode = reservationObj.reservation_code || response.data.reservation_code;
      const ticketCode = reservationObj.ticket_code || response.data.ticket_code || '';

      if (reservationId || reservationCode) {
        // Calculer les totaux pour la page de confirmation
        const totalPrice = calculateTotalPrice();
        const foodPrice = foodItems.reduce((total, item) => 
          total + ((item.price_at_time || item.price) * item.quantity), 0);

        // Préparer les paramètres pour la redirection
        const confirmationParams = {
          reservationId: reservationId ? reservationId.toString() : '',
          totalPrice: (totalPrice + taxiOption.price + foodPrice).toFixed(2),
          seatCount: selectedSeats.length.toString(),
          taxiPrice: taxiOption.price.toFixed(2),
          foodPrice: foodPrice.toFixed(2),
          ticketCode,
          reservationCode: reservationCode || ''
        };

        console.log('Redirecting with params:', confirmationParams);

        // Redirection vers la confirmation
        router.replace({
          pathname: '/cinema/confirmation',
          params: confirmationParams
        });
      } else {
        throw new Error('Réponse du serveur invalide');
      }
      
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      
      let errorMessage = 'Erreur lors de la réservation';
      
      // Gestion détaillée des erreurs
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer.';
        }
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Messages d'erreur spécifiques
      if (errorMessage.includes('RestaurantItem') || 
          errorMessage.includes('No RestaurantItem matches') ||
          errorMessage.includes('article de restaurant')) {
        errorMessage = 'Un problème est survenu avec les articles de restauration. Veuillez réessayer.';
      } else if (errorMessage.includes('siège') || errorMessage.includes('seat')) {
        errorMessage = 'Un problème est survenu avec la sélection des sièges. Veuillez réessayer.';
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Sièges
        return (
          <>
            <DateAndTimeSection
              selectedSession={selectedSession}
              setSelectedSession={(session: MovieSession) => setSelectedSession(session)}
              sessions={sessions}
              theme={theme}
            />

            <View style={[styles.section, { borderBottomColor: theme.colors.outline }]}>
              <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>Salle</Text>
              <View style={styles.availableInfo}>
                <View style={[styles.availableBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={[styles.availableText, { color: theme.colors.onSurfaceVariant }]}>
                    {selectedSession?.hall.name} ({selectedSession?.hall.screen_type})
                  </Text>
                </View>
                <Text style={[styles.selectedText, { color: theme.colors.primary }]}>Sélectionné</Text>
              </View>
            </View>

            <ScreenSection theme={theme} />
            
            {loading ? (
              <View style={[styles.centerContent, { padding: 20 }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
                  Chargement des sièges...
                </Text>
              </View>
            ) : (
              <SeatGrid
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatSelect={toggleSeat}
                theme={theme}
                loading={loading}
                basePrice={selectedSession?.base_price || selectedSession?.hall?.base_price || 10}
              />
            )}
            
            <View style={[styles.totalContainer, { borderTopColor: theme.colors.outline }]}>
              <Text style={[styles.totalLabel, { color: theme.colors.onBackground }]}>Prix Total</Text>
              <Text style={[styles.totalPrice, { color: theme.colors.onBackground }]}>
                {calculateTotalPrice().toFixed(2)} MGA - {selectedSeats.length} place(s)
              </Text>
            </View>
          </>
        );

      // case 1: // Taxi
      //   return (
      //     <TaxiStep
      //       taxiOption={taxiOption}
      //       setTaxiOption={setTaxiOption}
      //       theme={theme}
      //     />
      //   );

      case 1: // Restauration
        return (
          <FoodStep
            foodItems={foodItems}
            setFoodItems={setFoodItems}
            theme={theme}
          />
        );

      case 2: // Paiement
        return (
          <PaymentStep
            totalPrice={calculateTotalPrice()}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            theme={theme}
            taxiOption={taxiOption}
            foodItems={foodItems}
          />
        );

      default:
        return null;
    }
  };

  if (loadingSessions) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Chargement des sessions...</Text>
      </View>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Aucune session disponible</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!selectedSession) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Sélection d&#39;une session...</Text>
      </View>
    );
  }

  const totalPrice = calculateTotalPrice();
  const isNextDisabled = currentStep === 0 && selectedSeats.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête */}
      <View style={[styles.header, styles.responsivePadding]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.responsiveHeaderTitle, { color: theme.colors.onBackground }]}>
          {selectedSession.movie.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Section Cinema */}
      <View style={[styles.section, styles.responsiveSection, { borderBottomColor: theme.colors.outline }]}>
        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>Cinéma</Text>
        <View style={styles.cinemaInfo}>
          <Ionicons name="location" size={16} color={theme.colors.primary} />
          <Text style={[styles.cinemaName, { color: theme.colors.onBackground }]}>
            {selectedSession.cinema_name || selectedSession.hall?.cinema?.name || 'Cinéma inconnu'} - 
            {selectedSession.cinema_city || selectedSession.hall?.cinema?.city || ''}
          </Text>
        </View>
      </View>

      {/* Stepper */}
      <Stepper currentStep={currentStep} steps={STEPS} theme={theme} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>
      
      {/* Boutons de navigation */}
      <View style={[styles.footer, styles.responsiveFooter, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.outline }]}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={[styles.navButton, styles.prevButton, { borderColor: theme.colors.outline }]}
            onPress={handlePreviousStep}
            disabled={isProcessingPayment}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.onSurface} />
            <Text style={[styles.navButtonText, { color: theme.colors.onSurface }]}>
              Précédent
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[
            styles.navButton, 
            styles.nextButton, 
            { 
              backgroundColor: isNextDisabled || isProcessingPayment ? theme.colors.surfaceDisabled : theme.colors.primary,
              flex: currentStep === 0 ? 1 : undefined
            }
          ]}
          onPress={handleNextStep}
          disabled={isNextDisabled || isProcessingPayment}
        >
          {isProcessingPayment ? (
            <>
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              <Text style={[styles.navButtonText, { color: theme.colors.onPrimary, marginLeft: 8 }]}>
                Traitement...
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.navButtonText, { color: theme.colors.onPrimary }]}>
                {currentStep === STEPS.length - 1 ? 'Confirmer' : 'Suivant'}
              </Text>
              {currentStep < STEPS.length - 1 && (
                <Ionicons name="arrow-forward" size={20} color={theme.colors.onPrimary} />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorText: { fontSize: 16, marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: 'bold' },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  
  section: { 
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 12, 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  cinemaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cinemaName: { 
    fontSize: 16, 
    marginLeft: 8,
    fontWeight: '500',
  },
  
  availableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availableBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  availableText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalContainer: { 
    padding: 16, 
    alignItems: 'center',
    borderTopWidth: 1,
  },
  totalLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 8 
  },
  totalPrice: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  
  footer: { 
    padding: 16, 
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    minWidth: 120,
  },
  prevButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  nextButton: {
    flex: 1,
  },
  navButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  responsivePadding: {
    paddingHorizontal: width < 375 ? 12 : 16,
  },
  responsiveHeaderTitle: {
    fontSize: width < 375 ? 16 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  responsiveSection: {
    padding: width < 375 ? 12 : 16,
    borderBottomWidth: 1,
  },
  responsiveFooter: {
    padding: width < 375 ? 12 : 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
});