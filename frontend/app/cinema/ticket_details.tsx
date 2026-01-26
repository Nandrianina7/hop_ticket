// app/cinema/ticket_details.tsx
import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, 
  TouchableOpacity, ScrollView, Image, Alert,
  Animated, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../utils/api';
import * as MediaLibrary from "expo-media-library";
import { captureRef } from 'react-native-view-shot';

export interface Ticket {
  id: string;
  movieTitle: string;
  cinema: string;
  cinema_city?: string;
  genre: string;
  date: string;
  time: string;
  seats: string[];
  bookingCode: string;
  type: string;
  price?: number;
  hall?: string;
  screenType?: string;
  qrCodeData?: string;
  poster?: string;
  seatCount?: number;
  availableTickets?: number;
  usedTickets?: number; 
  isFullyUsed?: boolean; 
  duration?: number;
  foodOrders?: any[];
  taxiOption?: any;
}

export default function TicketDetailScreen() {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams();
  const [imageError, setImageError] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  const viewShotRef = useRef<View>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const ticketString = params.ticket as string;
  const ticket: Ticket = ticketString ? JSON.parse(ticketString) : null;

  if (!ticket) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.errorText}>Ticket non trouvé</Text>
      </SafeAreaView>
    );
  }

  const qrData = JSON.stringify({
    reservationId: ticket.id,
    movie: ticket.movieTitle,
    cinema: ticket.cinema,
    date: ticket.date,
    time: ticket.time,
    seats: ticket.seats,
    bookingCode: ticket.bookingCode
  });

  const getImageSource = () => {
    if (ticket?.poster && !imageError) {
      if (ticket.poster.startsWith('http')) {
        return { uri: ticket.poster };
      } else {
        return { uri: `${API_BASE_URL}${ticket.poster}` };
      }
    }
    return require('../../assets/images/hoplogo.jpeg');
  };

  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Impossible d&apos;enregistrer l&apos;image");
        return;
      }

      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef.current, {
          format: 'png',
          quality: 1.0,
        });
        
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync("Tickets", asset, false);
        Alert.alert("Succès ✅", "Ticket enregistré dans la galerie");
      }
    } catch (err) {
      console.error('Erreur download:', err);
      Alert.alert("Erreur", "Impossible d&apos;enregistrer le ticket");
    }
  };

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? `${mins}min` : ''}`;
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumScrollEnd = (event: any) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(page);
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {[0, 1].map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i === currentPage ? theme.colors.primary : theme.colors.outline }
          ]}
        />
      ))}
    </View>
  );

  const renderTicketDetails = () => (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.posterSection}>
        <Image
          source={getImageSource()}
          onError={() => setImageError(true)}
          style={[styles.poster, { height: height * 0.25 }]}
          resizeMode="cover"
        />
        <View style={styles.titleOverlay}>
          <Text style={[styles.movieTitle, { color: '#fff' }]}>{ticket.movieTitle}</Text>
          <View style={styles.movieInfo}>
            <Text style={[styles.infoText, { color: 'rgba(255,255,255,0.8)' }]}>{ticket.genre}</Text>
            <Text style={[styles.infoDot, { color: 'rgba(255,255,255,0.8)' }]}>•</Text>
            <Text style={[styles.infoText, { color: 'rgba(255,255,255,0.8)' }]}>{formatDuration(ticket.duration)}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="business-outline" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Cinéma</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>{ticket.cinema}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Date</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>{ticket.date}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Heure</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>{ticket.time}</Text>
            </View>
          </View>
          
          {ticket.hall && (
            <View style={styles.infoItem}>
              <Ionicons name="videocam-outline" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Salle</Text>
                <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>{ticket.hall}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Sièges réservés</Text>
        <View style={styles.seatsContainer}>
          {ticket.seats.map((seat, index) => (
            <View key={index} style={[styles.seatBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.seatText, { color: theme.colors.onPrimary }]}>{seat}</Text>
            </View>
          ))}
        </View>
      </View>

      {(ticket.foodOrders && ticket.foodOrders.length > 0) && (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Restauration</Text>
          {ticket.foodOrders.map((order, index) => (
            <View key={index} style={styles.serviceItem}>
              <Ionicons name="fast-food-outline" size={20} color={theme.colors.primary} />
              <View style={styles.serviceContent}>
                <Text style={[styles.serviceLabel, { color: theme.colors.onSurface }]}>
                  {order.name} x{order.quantity}
                </Text>
              </View>
              <Text style={[styles.servicePrice, { color: theme.colors.onSurface }]}>
                {order.price ? `${order.price}MGA` : 'Inclus'}
              </Text>
            </View>
          ))}
          <View style={[styles.foodTotal, { borderTopColor: theme.colors.outline }]}>
            <Text style={[styles.foodTotalLabel, { color: theme.colors.onSurface }]}>
              Total restauration
            </Text>
            <Text style={[styles.foodTotalPrice, { color: theme.colors.onSurface }]}>
              {ticket.foodOrders.reduce((total, order) => total + (order.price || 0) * (order.quantity || 1), 0)}MGA
            </Text>
          </View>
        </View>
      )}

      {ticket.taxiOption && (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Service Taxi</Text>
          <View style={styles.serviceItem}>
            <Ionicons name="car-outline" size={20} color={theme.colors.primary} />
            <View style={styles.serviceContent}>
              <Text style={[styles.serviceLabel, { color: theme.colors.onSurface }]}>
                Réservation taxi
              </Text>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                {ticket.taxiOption.pickupTime} - {ticket.taxiOption.address}
              </Text>
            </View>
            <Text style={[styles.servicePrice, { color: theme.colors.onSurface }]}>
              {ticket.taxiOption.price || '0'}MGA
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>Total</Text>
        <Text style={[styles.totalPrice, { color: theme.colors.primary }]}>
          {ticket.price || '0'}MGA
        </Text>
      </View>
    </ScrollView>
  );

  const renderQRCode = () => (
    <View style={[styles.page, { justifyContent: 'center' }]}>
      <ScrollView 
        contentContainerStyle={styles.qrContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.qrSection}>
          <Text style={[styles.qrTitle, { color: theme.colors.onSurface }]}>Votre billet numérique</Text>
          <View style={[styles.qrCard, { backgroundColor: theme.colors.surface }]}>
            <QRCode
              value={qrData}
              size={width * 0.6}
              color={theme.colors.onSurface}
              backgroundColor="transparent"
            />
          </View>

          <View style={styles.codeInfo}>
            <Text style={[styles.bookingCode, { color: theme.colors.onSurface }]}>{ticket.bookingCode}</Text>
            <Text style={[styles.codeLabel, { color: theme.colors.onSurfaceVariant }]}>Code de réservation</Text>
          </View>

          <View style={styles.instructions}>
            <Ionicons name="scan-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
              Présentez ce QR code à l&apos;entrée de la salle
            </Text>
          </View>
        </View>

        <View style={styles.downloadSection}>
          <TouchableOpacity 
            style={[styles.downloadButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleDownload}
          >
            <Ionicons name="download-outline" size={24} color={theme.colors.onPrimary} />
            <Text style={[styles.downloadText, { color: theme.colors.onPrimary }]}>Télécharger le billet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>Votre Billet</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderDots()}

      <View ref={viewShotRef} collapsable={false} style={styles.viewShotContainer}>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {renderTicketDetails()}
          {renderQRCode()}
        </Animated.ScrollView>
      </View>

      <View style={styles.swipeIndicator}>
        <Ionicons 
          name={currentPage === 0 ? "chevron-forward" : "chevron-back"} 
          size={20} 
          color={theme.colors.onSurfaceVariant} 
        />
        <Text style={[styles.swipeText, { color: theme.colors.onSurfaceVariant }]}>
          {currentPage === 0 ? "Glissez pour le QR Code" : "Glissez pour les détails"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Styles corrigés - utilisation de Dimensions au lieu de useWindowDimensions dans les styles
const { width: screenWidth } = useWindowDimensions();

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  viewShotContainer: {
    flex: 1,
  },
  centerContent: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorText: { 
    color: 'red', 
    fontSize: 16 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: { 
    padding: 4 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  scrollView: {
    flex: 1,
  },
  page: {
    width: screenWidth,
    flex: 1,
  },
  
  // Page 1: Détails du ticket
  posterSection: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    marginHorizontal: 16,
    position: 'relative',
  },
  poster: {
    width: '100%',
    borderRadius: 16,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  movieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoDot: {
    fontSize: 14,
    marginHorizontal: 6,
  },
  
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  
  seatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seatBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seatText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  serviceContent: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  // Page 2: QR Code
  qrContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  qrSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  qrCard: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  codeInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  bookingCode: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  downloadSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 12,
  },
  downloadText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Indicateur de swipe
  swipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  swipeText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Styles pour la restauration
  foodTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  foodTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  foodTotalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});