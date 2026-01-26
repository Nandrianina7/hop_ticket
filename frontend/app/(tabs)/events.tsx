import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { 
  ScrollView, 
  View, 
  StyleSheet, 
  NativeSyntheticEvent, 
  NativeScrollEvent,
  FlatList,
  Dimensions,
  RefreshControl,
  Image,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Text, Button, Title, FAB } from 'react-native-paper';
import EventCard from '../../components/events';
import * as Animatable from 'react-native-animatable';
import { fetchEvents } from '../../utils/api';
// import { RefreshContext } from './_layout';
import { EventCardSkeleton, GridSkeleton } from '../../components/Skeleton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RefreshContext } from '../tabLayout';

// Mettre à jour le type Event
type Event = {
  id: number;
  name: string;
  image_url?: string;
  venue?: string;
  date?: string; 
  average_rating?: number;
  total_ratings?: number;
  is_liked?: boolean;
  likes_count?: number;
  tickets_sold?: number;
  price_tiers?: {
    tier_type: string;
    price: number;
    available_quantity: number;
  }[];
  location_name?: string;
};

const { width, height } = Dimensions.get('window');
const GRID_COLUMNS = 2;
const CARD_PADDING = 16;
const CARD_GAP = 12;
const GRID_ITEM_WIDTH = (width - (CARD_PADDING * 2) - CARD_GAP) / GRID_COLUMNS;
const CAROUSEL_HEIGHT = height * 0.27;

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Fonction pour calculer le score IA d'un événement
const calculateEventScore = (event: Event): number => {
  // Facteurs pour le score:
  // 1. Rating (40% du score)
  const ratingScore = (event.average_rating || 0) * 8; // 0-5 -> 0-40
  
  // 2. Nombre de likes (20% du score)
  const likesScore = Math.min((event.likes_count || 0) / 10, 20); // Max 20 points
  
  // 3. Fraîcheur (20% du score) - Événements plus récents ont un score plus élevé
  let freshnessScore = 0;
  if (event.date) {
    const eventDate = new Date(event.date);
    const now = new Date();
    const daysDiff = Math.max(0, (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    freshnessScore = Math.min(20, 20 - (daysDiff / 30)); // Décroît sur 30 jours
  }
  
  // 4. Popularité (ventes de billets, 20% du score)
  const popularityScore = Math.min((event.tickets_sold || 0) / 5, 20); // Max 20 points
  
  return ratingScore + likesScore + freshnessScore + popularityScore;
};

// Composant pour afficher les squelettes du carrousel
const CarouselSkeletons = ({ count = 3, isLarge = true }: { count?: number, isLarge?: boolean }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={`skeleton-${index}`}
          style={[
            styles.carouselItem,
            index === count - 1 ? { marginRight: 0 } : null,
          ]}
        >
          <EventCardSkeleton isLarge={isLarge} />
        </View>
      ))}
    </>
  );
};

// Nouveau composant pour l'affichage des événements en grille
const EventGridItem = ({ item, onPress }: { item: Event; onPress: () => void }) => {
  const theme = useTheme();
  const lowestPrice = item.price_tiers?.reduce((min, tier) => 
    tier.price < min ? tier.price : min, Infinity
  ) || 0;

  return (
    <Animatable.View 
      animation="fadeInUp" 
      duration={600} 
      style={styles.gridItemContainer}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.eventCard, { backgroundColor: theme.colors.surface }]}>
          {/* Image de l'événement */}
          <View style={styles.imageContainer}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            
            {/* Badge de rating en overlay */}
            {/* {item.average_rating !== undefined && ( */}
              {/* // <View style={styles.ratingBadge}> */}
                {/* <Ionicons name="star" size={12} color="#FFD700" /> */}
                {/* <Text style={styles.ratingText}>{item.average_rating.toFixed(1)}</Text> */}
              {/* </View> */}
            {/* // )} */}
          </View>

          {/* Contenu de la carte */}
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {item.name}
            </Text>

            <View style={styles.eventDetails}>
              {item.venue && (
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <Text style={styles.eventVenue} numberOfLines={1}>
                    {item.location_name}
                  </Text>
                </View>
              )}
              
              {item.date && (
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={14} color="#666" />
                  <Text style={styles.eventDate} numberOfLines={1}>
                    {formatDate(item.date)}
                  </Text>
                </View>
              )}
            </View>

            {lowestPrice > 0 && (
              <Text style={styles.eventPrice}>
                À partir de {lowestPrice}MGA
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default function EventsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { setRefreshEvents } = useContext(RefreshContext);
  const [refreshing, setRefreshing] = useState(false);

  // State pour nouveaux événements
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const recentHasMore = useRef(true);
  const recentPageRef = useRef(1);

  // State pour tous les événements (grille)
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allPage, setAllPage] = useState(1);
  const [allLoading, setAllLoading] = useState(true);
  const [allHasMore, setAllHasMore] = useState(true);

  // Navigation vers les détails d'un événement
  const handleEventPress = useCallback((eventId: number) => {
    router.push(`/event/${eventId}`);
  }, [router]);

  // Charger les nouveaux événements page par page avec tri IA
  const loadRecentEvents = useCallback(async (page: number) => {
    if (!recentHasMore.current) return;
    
    try {
      console.log('Loading recent events, page:', page);
      const data = await fetchEvents('recent', page);
      let events = data.events || [];
      
      // Trier par score IA (les meilleurs en premier)
      events = events
        .map((event: Event) => ({
          ...event,
          ai_score: calculateEventScore(event)
        }))
        .sort((a: { ai_score: number }, b: { ai_score: number }) => b.ai_score - a.ai_score);
      
      if (events && events.length > 0) {
        setRecentEvents((prev) => {
          const existingIds = new Set(prev.map(e => e.id));
          const filtered = events.filter((e: Event) => !existingIds.has(e.id));
          if (filtered.length === 0) recentHasMore.current = false;
          return [...prev, ...filtered];
        });
      } else {
        recentHasMore.current = false;
      }
    } catch (error) {
      console.error('Erreur API récents:', error);
      recentHasMore.current = false;
    }
  }, []);

  // Charger tous les événements pour la grille
  const loadAllEvents = useCallback(async (page: number) => {
    if (!allHasMore) return;
    
    try {
      console.log('Loading all events, page:', page);
      const data = await fetchEvents(undefined, page, 18);
      const events = data.events || [];
      
      if (events && events.length > 0) {
        setAllEvents((prev) => {
          const existingIds = new Set(prev.map(e => e.id));
          const filtered = events.filter((e: Event) => !existingIds.has(e.id));
          if (filtered.length === 0) setAllHasMore(false);
          return [...prev, ...filtered];
        });
      } else {
        setAllHasMore(false);
      }
    } catch (error) {
      console.error('Erreur API tous les événements:', error);
      setAllHasMore(false);
    }
  }, [allHasMore]);

  // Fonction pour rafraîchir toutes les données
  const refreshAllData = useCallback(async () => {
    setRefreshing(true);
    
    // Réinitialiser les états
    setRecentEvents([]);
    setAllEvents([]);
    recentPageRef.current = 1;
    setAllPage(1);
    recentHasMore.current = true;
    setAllHasMore(true);
    setRecentLoading(true);
    setAllLoading(true);
    
    // Recharger les données
    try {
      await Promise.all([
        loadRecentEvents(1),
        loadAllEvents(1)
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
      setRecentLoading(false);
      setAllLoading(false);
    }
  }, [loadRecentEvents, loadAllEvents]);

  // Enregistrer la fonction de rafraîchissement dans le contexte
  useEffect(() => {
    setRefreshEvents(() => refreshAllData);
  }, [refreshAllData, setRefreshEvents]);

  // Au montage, charger la première page
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setRecentLoading(true);
        setAllLoading(true);
        await Promise.all([
          loadRecentEvents(1),
          loadAllEvents(1)
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setRecentLoading(false);
        setAllLoading(false);
      }
    };
    
    loadInitialData();
  }, [loadAllEvents, loadRecentEvents]);

  // Gestion du scroll pour charger plus de données (grille)
  const handleGridScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const paddingToBottom = 100;
    
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (allHasMore && !allLoading) {
        const nextPage = allPage + 1;
        setAllPage(nextPage);
        setAllLoading(true);
        loadAllEvents(nextPage).finally(() => setAllLoading(false));
      }
    }
  };

  // Render item pour la grille
  const renderGridItem = useCallback(({ item }: { item: Event }) => (
    <EventGridItem 
      item={item} 
      onPress={() => handleEventPress(item.id)} 
    />
  ), [handleEventPress]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleGridScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAllData}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Nouveaux & Populaires - Carrousel */}
        <Animatable.View animation="fadeInUp" duration={700} delay={100}>
          <View style={styles.sectionHeader}>
            <Title style={styles.title}>Nouveaux & Populaires</Title>
            <Button
              icon="arrow-right"
              mode="text"
              onPress={() => router.push('/events2?type=recent')}
              compact
            >
              Voir tout
            </Button>
          </View>
          <View style={styles.carouselWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            >
              {recentLoading ? (
                <CarouselSkeletons count={3} isLarge={true} />
              ) : (
                recentEvents.map((event, idx) => (
                  <View
                    key={event.id}
                    style={[
                      styles.carouselItem,
                      idx === recentEvents.length - 1 ? { marginRight: 0 } : null,
                    ]
                    }
                  >
                    <EventCard 
                      id={event.id} 
                      title={event.name} 
                      image_url={event.image_url} 
                      venue={event.venue}
                      date={event.date}
                      average_rating={event.average_rating}
                      is_liked={event.is_liked}
                      likes_count={event.likes_count}
                      isLarge={false}
                    />
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </Animatable.View>

        {/* Tous les événements - Grille 2 colonnes */}
        <Animatable.View animation="fadeInUp" duration={700} delay={400}>
          <View style={styles.sectionHeader}>
            <Title style={styles.title}>Tous les Événements</Title>
            <Button
              icon="grid"
              mode="text"
              onPress={() => router.push('/events2?type=all')}
              compact
            >
              Explorer
            </Button>
          </View>
          
          <FlatList
            data={allEvents}
            renderItem={renderGridItem}
            keyExtractor={(item) => `grid-${item.id}`}
            numColumns={GRID_COLUMNS}
            columnWrapperStyle={styles.gridRow}
            scrollEnabled={false}
            ListFooterComponent={
              allLoading ? (
                <View style={styles.gridRow}>
                  {Array.from({ length: 2 }).map((_, index) => (
                    <View key={`footer-skeleton-${index}`} style={styles.gridItemContainer}>
                      <GridSkeleton />
                    </View>
                  ))}
                </View>
              ) : null
            }
            ListEmptyComponent={
              allLoading ? (
                <View style={styles.gridRow}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <View key={`empty-skeleton-${index}`} style={styles.gridItemContainer}>
                      <GridSkeleton />
                    </View>
                  ))}
                </View>
              ) : (
                !allLoading && allEvents.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Aucun événement trouvé</Text>
                  </View>
                ) : null
              )
            }
          />
        </Animatable.View>
      </ScrollView>

      {/* Bouton flottant pour Mes Tickets */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.surface }]}
        icon={() => (
          <Image
            source={require('../../assets/images/ticket_icon.png')}
            style={{
              width: 52,     // taille adaptée (à ajuster selon ton besoin)
              height: 52,
              alignSelf: "center",
              transform: [{ translateY: -10 }],
              // tintColor: theme.colors.primary, // si tu veux recolorer l’icône
            }}
            resizeMode="contain"
          />
        )}
        onPress={() => router.push('../event/myticket_events')}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: CARD_PADDING,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  carouselWrapper: {
    height: CAROUSEL_HEIGHT,
    marginBottom: 24,
  },
  carouselContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  carouselItem: {
    marginRight: 16,
    width: width * 0.65,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
    gap: CARD_GAP,
  },
  gridItemContainer: {
    width: GRID_ITEM_WIDTH,
  },
  eventCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  eventContent: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  eventDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventVenue: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#a728b3ff',
    marginLeft: 4,
  },
  eventPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E86C1',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.5,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 5
  },
});