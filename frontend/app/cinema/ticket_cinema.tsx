// app/cinema/ticket_cinema.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Dimensions, FlatList,
  RefreshControl, Platform, Image, SafeAreaView
} from 'react-native';
import { useTheme, Card, List, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { axiosInstance, API_BASE_URL } from '../../utils/api'
import { Ticket } from './ticket_details';

const { width } = Dimensions.get('window');

export default function MyTicketsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadUserTickets();
  }, []);

  const loadUserTickets = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/cinema/user-tickets/');
      
      // Filtrer les réservations qui ont encore des tickets disponibles
      const reservationsData = response.data.reservations
        .filter((reservation: any) => reservation.available_tickets > 0)
        .map((reservation: any) => {
          const sessionDate = new Date(reservation.session.start_time);
          
          return {
            id: reservation.id.toString(),
            movieTitle: reservation.session.movie.title,
            cinema: reservation.cinema_name || reservation.session.hall.cinema.name,
            cinema_city: reservation.cinema_city || reservation.session.hall.cinema.city,
            genre: reservation.session.movie.genre,
            date: sessionDate.toISOString().split('T')[0],
            time: sessionDate.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            seats: reservation.seats,
            bookingCode: reservation.ticket_code.substring(0, 8).toUpperCase(),
            type: 'Admission',
            price: reservation.total_amount,
            hall: reservation.session.hall.name,
            screenType: reservation.session.hall.screen_type,
            qrCodeData: reservation.ticket_code,
            poster: reservation.session.movie.poster,
            seatCount: reservation.seat_count,
            availableTickets: reservation.available_tickets, // Nouveau champ
            usedTickets: reservation.used_tickets, // Nouveau champ
            duration: reservation.session.movie.duration,
            sessionId: reservation.session.id,
            sessionDateTime: reservation.session.start_time,
            rawSessionDate: sessionDate,
            isFullyUsed: reservation.is_fully_used // Nouveau champ
          };
        });
      
      setTickets(reservationsData);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserTickets();
  };

  const handleViewTicketDetails = (ticket: Ticket) => {
    router.push({
      pathname: '/cinema/ticket_details',
      params: { 
        ticket: JSON.stringify(ticket),
        ticketId: ticket.id
      }
    });
  };

  // Fonction pour obtenir la source d'image correcte
  const getImageSource = (poster: string | undefined) => {
    if (poster && !poster.startsWith('http')) {
      return { uri: `${API_BASE_URL}${poster}` };
    }
    return poster ? { uri: poster } : require('../../assets/images/hoplogo.jpeg');
  };

  // Groupement des tickets par session (date + heure + cinéma)
  const groupedTickets = tickets.reduce((groups: Record<string, Ticket[]>, ticket) => {
    const key = `${ticket.sessionDateTime}_${ticket.cinema}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(ticket);
    return groups;
  }, {});

  const grouped = Object.entries(groupedTickets).map(([sessionKey, tickets]) => {
    const firstTicket = tickets[0];
    const sessionDate = new Date(firstTicket.sessionDateTime);
    
    return {
      key: sessionKey,
      date: firstTicket.date,
      time: firstTicket.time,
      cinema: firstTicket.cinema,
      cinema_city: firstTicket.cinema_city,
      hall: firstTicket.hall,
      poster: firstTicket.poster,
      tickets,
      rawSessionDate: sessionDate // Date réelle pour le tri
    };
  });

  // Trier les groupes par date de session (plus récent en premier)
  grouped.sort((a, b) => b.rawSessionDate.getTime() - a.rawSessionDate.getTime());

  const toggleAccordion = (key: string) => {
    setExpandedIds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Fonction corrigée pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Vérifier que la date est valide
      if (isNaN(date.getTime())) {
        console.warn('Date invalide:', dateString);
        return 'Date inconnue';
      }
      
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Date inconnue';
    }
  };

  // Fonction pour formater la date de session (pour l'en-tête)
  const formatSessionDate = (sessionDateTime: string) => {
    try {
      const date = new Date(sessionDateTime);
      if (isNaN(date.getTime())) {
        return 'Date inconnue';
      }
      
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Date inconnue';
    }
  };

  const daysRemaining = (dateString: string) => {
    try {
      const now = new Date();
      const target = new Date(dateString);
      
      if (isNaN(target.getTime())) {
        return null;
      }
      
      // Mettre les deux dates à minuit pour comparer seulement les jours
      const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
      
      const diffMs = targetMidnight.getTime() - nowMidnight.getTime();
      const day = 1000 * 60 * 60 * 24;
      const days = Math.ceil(diffMs / day);
      return days;
    } catch {
      return null;
    }
  };

  const getSessionStatus = (dateString: string) => {
    const days = daysRemaining(dateString);
    if (days === null) return { label: 'Inconnu', color: '#666' };
    
    if (days > 1) return { label: `Dans ${days} jours`, color: '#4CAF50' };
    if (days === 1) return { label: 'Demain', color: '#FF9800' };
    if (days === 0) return { label: "Aujourd'hui", color: '#F44336' };
    if (days === -1) return { label: 'Hier', color: '#9E9E9E' };
    return { label: 'Terminé', color: '#9E9E9E' };
  };

  const renderTicketCard = ({ item }: { item: Ticket }) => {
    const formattedDate = formatDate(item.sessionDateTime);
    const sessionStatus = getSessionStatus(item.sessionDateTime);

    return (
      <Card style={styles.ticketCard} elevation={3}>
        <View style={styles.ticketRow}>
          {/* LEFT: decorative image only */}
          <View style={styles.leftDecor}>
            <Image
              source={getImageSource(item.poster)}
              style={styles.posterImage}
              resizeMode="cover"
            />
            <View style={styles.leftDecorOverlay} />
            <View style={[styles.sessionStatusBadge, { backgroundColor: sessionStatus.color }]}>
              <Text style={styles.sessionStatusText}>{sessionStatus.label}</Text>
            </View>
          </View>

          {/* separator with "perforation" */}
          <View style={styles.separatorContainer}>
            <View style={styles.notches}>
              {Array.from({ length: 10 }).map((_, i) => (
                <View key={i} style={styles.notch} />
              ))}
            </View>
            <View style={styles.dashedLine} />
          </View>

          {/* RIGHT: infos */}
          <View style={styles.rightSection}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.movieTitle, { color: theme.colors.onSurface }]}
                numberOfLines={2}
              >
                {item.movieTitle}
              </Text>
            </View>

            <Text style={[styles.cinemaName, { color: theme.colors.onSurfaceVariant }]}>
              {item.cinema} - {item.hall}
            </Text>

            <View style={styles.dateTimeRow}>
              <Ionicons name="calendar-outline" size={12} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                {formattedDate}
              </Text>
              <Ionicons name="time-outline" size={12} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
                {item.time}
              </Text>
            </View>

            <View style={styles.seatRow}>
              <Ionicons name="ticket-outline" size={12} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.seatText, { color: theme.colors.onSurfaceVariant }]}>
                Sièges: {item.seats.join(', ')} ({item.seatCount || item.seats.length} place(s))
              </Text>
            </View>

            <View style={styles.rightBottomRow}>
              <View style={styles.numberAndArea}>
                <Text style={styles.ticketNumberBig}>
                  CODE: {item.bookingCode}
                </Text>
                {item.price && (
                  <Text style={[styles.priceText, { color: theme.colors.primary }]}>
                    {parseFloat(item.price.toString()).toFixed(2)} MGA
                  </Text>
                )}
              </View>

              <TouchableOpacity 
                style={[styles.detailsButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleViewTicketDetails(item)}
              >
                <Text style={[styles.detailsButtonText, { color: theme.colors.onPrimary }]}>
                  Détails
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderTicketsList = () => (
    <View style={styles.contentContainer}>
      {/* Background decorative elements - MODIFIÉ POUR ANDROID */}
      <View style={styles.backgroundDecorations}>
        <View style={styles.floatingShape1} />
        <View style={styles.floatingShape2} />
        {Platform.OS === 'web' ? (
          // Sur web, on garde les images
          <>
            <Image 
              source={require('../../assets/images/hoplogo.jpeg')}
              style={styles.floatingIcon1}
              resizeMode="contain"
            />
            <Image 
              source={require('../../assets/images/hoplogo.jpeg')}
              style={styles.floatingIcon2}
              resizeMode="contain"
            />
          </>
        ) : (
          // Sur mobile, on utilise des Views stylisées pour éviter les problèmes de performance
          <>
            <View style={styles.floatingIconAndroid1} />
            <View style={styles.floatingIconAndroid2} />
          </>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={styles.ticketsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {grouped.map((group) => (
          <View key={group.key} style={styles.groupWrapper}>
            <List.Section>
              <List.Accordion
                title={
                  <View style={styles.accordionHeader}>
                    <View style={styles.accordionHeaderContent}>
                      <Text style={[styles.sessionTitle, { color: theme.colors.onSurface }]}>
                        {formatSessionDate(group.tickets[0].sessionDateTime)}
                      </Text>
                      <Text style={[styles.sessionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                        {group.time} • {group.cinema} • {group.hall} • {group.tickets.length} billet(s)
                      </Text>
                    </View>
                  </View>
                }
                left={(props) =>
                  group.poster ? (
                    <Avatar.Image
                      size={40}
                      source={getImageSource(group.poster)}
                      style={{ marginRight: 6 }}
                    />
                  ) : (
                    <List.Icon {...props} icon="film" />
                  )
                }
                expanded={!!expandedIds[group.key]}
                onPress={() => toggleAccordion(group.key)}
                style={[styles.accordion, { backgroundColor: theme.colors.surface }]}
              >
                <FlatList
                  data={group.tickets}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => renderTicketCard({ item })}
                  scrollEnabled={false}
                  contentContainerStyle={{ paddingTop: 8 }}
                />
              </List.Accordion>
            </List.Section>
          </View>
        ))}
        
        {grouped.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
              Aucun ticket
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              Vos tickets achetés apparaîtront ici
            </Text>
            <TouchableOpacity 
              style={[styles.browseButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/cinema')}
            >
              <Text style={[styles.browseButtonText, { color: theme.colors.onPrimary }]}>
                Voir les films
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Chargement de vos tickets...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.onBackground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>Mes Tickets</Text>
          <View style={{ width: 24 }} />
        </View>

        {renderTicketsList()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },  
  backButton: { padding: 4 },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  backgroundDecorations: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  floatingIcon1: {
    position: 'absolute',
    top: '20%',
    right: -30,
    width: 120,
    height: 120,
    opacity: 0.1,
    transform: [{ rotate: '15deg' }],
  },
  floatingIcon2: {
    position: 'absolute',
    bottom: '15%',
    left: -40,
    width: 150,
    height: 150,
    opacity: 0.08,
    transform: [{ rotate: '-10deg' }],
  },
  // Styles alternatifs pour Android
  floatingIconAndroid1: {
    position: 'absolute',
    top: '20%',
    right: -30,
    width: 120,
    height: 120,
    opacity: 0.05,
    backgroundColor: '#2196F3',
    borderRadius: 60,
    transform: [{ rotate: '15deg' }],
  },
  floatingIconAndroid2: {
    position: 'absolute',
    bottom: '15%',
    left: -40,
    width: 150,
    height: 150,
    opacity: 0.04,
    backgroundColor: '#4CAF50',
    borderRadius: 75,
    transform: [{ rotate: '-10deg' }],
  },
  floatingShape1: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.03)',
  },
  floatingShape2: {
    position: 'absolute',
    bottom: '30%',
    right: '15%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(33, 150, 243, 0.03)',
  },
  ticketsContainer: { 
    padding: 12, 
    paddingBottom: 32,
    flexGrow: 1,
  },
  groupWrapper: { 
    marginBottom: 12, 
    borderRadius: 10, 
    overflow: 'hidden' 
  },
  accordion: {
    borderRadius: 10,
    marginBottom: 8,
  },
  accordionHeader: {
    flex: 1,
  },
  accordionHeaderContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  sessionSubtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: { 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8 
  },
  browseButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  // Ticket Card Styles
  ticketCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 120,
  },

  // LEFT decorative image column
  leftDecor: {
    width: 80,
    minHeight: 120,
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  leftDecorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sessionStatusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sessionStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // separator perforation container
  separatorContainer: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  notches: {
    width: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
  },
  notch: {
    width: 8,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 1,
  },
  dashedLine: {
    flex: 1,
    height: '75%',
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    marginLeft: 6,
  },

  // RIGHT info column
  rightSection: {
    flex: 2,
    padding: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  cinemaName: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    marginRight: 12,
  },
  timeText: {
    fontSize: 12,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  seatText: {
    fontSize: 12,
  },
  rightBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numberAndArea: {
    flex: 1,
    marginRight: 8,
    alignItems: 'flex-start',
  },
  ticketNumberBig: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});