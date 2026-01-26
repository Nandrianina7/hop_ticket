// events2.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  Dimensions, 
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  StatusBar,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import EventCard from '../components/events';
import { fetchEvents } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { GridSkeleton } from '../components/Skeleton';

const screenWidth = Dimensions.get('window').width;
const gridMargin = 8;
const cardWidth = Math.floor((screenWidth - 32 - gridMargin) / 2);

export default function Events2Screen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const type =
    typeof params.type === 'string'
      ? params.type
      : Array.isArray(params.type) && params.type.length > 0
      ? params.type[0]
      : undefined;

  // Déterminer le titre en fonction du type
  const getTitle = () => {
    switch (type) {
      case 'recent':
        return 'Nouveautés & Populaires';
      case 'old':
        return 'Anciens Événements';
      case 'all':
        return 'Tous les Événements';
      default:
        return 'Événements';
    }
  };

  // Fonction pour charger les événements
  const loadEvents = async (pageNum: number, isRefresh = false) => {
    try {
      const data = await fetchEvents(type as 'recent' | 'old', pageNum);
      
      if (data && data.events && data.events.length > 0) {
        if (isRefresh) {
          setEvents(data.events);
        } else {
          setEvents((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const newEvents = data.events.filter((e: any) => !existingIds.has(e.id));
            return [...prev, ...newEvents];
          });
        }
        setHasMore(data.has_more);
        setPage(pageNum + 1);
      } else {
        setHasMore(false);
      }
      return true;
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Impossible de charger les événements.');
      return false;
    }
  };

  // Charger la première page
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      await loadEvents(1, true);
      setLoading(false);
    };

    loadInitial();
  }, [type]);

  // Actualiser les données
  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await loadEvents(1, true);
    setRefreshing(false);
  };

  // Charger plus au scroll
  const loadMoreEvents = async () => {
    if (!hasMore || isLoadingMore || refreshing) return;

    setIsLoadingMore(true);
    await loadEvents(page);
    setIsLoadingMore(false);
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;

    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      loadMoreEvents();
    }
  };

  // Calculer la hauteur du header en fonction de la safe area
  const getHeaderPadding = () => {
    return Platform.OS === 'ios' ? 50 : 40;
  };

  // Composant de squelette pour la grille
  const GridSkeletonsComponent = ({ count = 6 }: { count?: number }) => {
    return (
      <View style={styles.grid}>
        {Array.from({ length: count }).map((_, index) => (
          <View
            key={`skeleton-${index}`}
            style={[
              styles.gridItem,
              { 
                width: cardWidth,
                marginRight: index % 2 === 0 ? gridMargin : 0,
              }
            ]}
          >
            <GridSkeleton />
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header avec bouton retour et titre */}
      <View style={[styles.header, { paddingTop: getHeaderPadding() }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor={'#007AFF'}
          />
        }
      >
        {loading ? (
          // Squelettes de chargement initial
          <GridSkeletonsComponent count={6} />
        ) : error && events.length === 0 ? (
          // Erreur
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => onRefresh()}
            >
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Contenu principal
          <>
            <View style={styles.grid}>
              {events.map((event, idx) => (
                <View
                  key={event.id}
                  style={[
                    styles.gridItem,
                    { 
                      width: cardWidth,
                      marginRight: idx % 2 === 0 ? gridMargin : 0,
                    }
                  ]}
                >
                  <EventCard
                    id={event.id}
                    title={event.name || event.title}
                    image_url={event.image_url}
                    venue={event.venue}
                    date={event.date}
                    rating={event.rating}
                  />
                </View>
              ))}
            </View>

            {isLoadingMore && (
              <View style={styles.loadingMoreContainer}>
                <GridSkeletonsComponent count={2} />
              </View>
            )}

            {!hasMore && events.length > 0 && (
              <Text style={styles.endText}>Tous les événements sont chargés</Text>
            )}

            {events.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun événement trouvé</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    // Pour les appareils avec encoches
    ...Platform.select({
      ios: {
        paddingTop: 50, // Plus d'espace pour iOS
      },
      android: {
        paddingTop: 40, // Espace pour Android
      },
    }),
  },
  backButton: {
    padding: 4,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 32,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    minHeight: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: 16,
  },
  loadingMoreContainer: {
    marginTop: 16,
  },
  endText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
    fontStyle: 'italic',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
});