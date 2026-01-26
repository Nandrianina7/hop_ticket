// app/(tabs)/cinema.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, RefreshControl, ScrollView, Image } from 'react-native';
import { useTheme, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import MovieCard from '../cinema/movie_card';
import { Movie } from '../cinema/types';
import { useMovies } from '../../hooks/useMovies';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../utils/api';

const { width } = Dimensions.get('window');

interface Genre {
  id: string;
  name: string;
}

type CinemaTab = 'popular' | 'today' | 'tomorrow';

export default function CinemaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<CinemaTab>('popular');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Utilisation du hook personnalisé pour récupérer les films
  const { movies, loading, error, refresh, hasMore, loadMore } = useMovies({
    genre: selectedGenre || '',
    search: '',
    tab: selectedTab
  });

  // Debug: Afficher les données reçues
  useEffect(() => {
    console.log('=== CINEMA SCREEN DEBUG ===');
    console.log('Selected tab:', selectedTab);
    console.log('Selected genre:', selectedGenre);
    console.log('Total movies received:', movies.length);
    
    movies.forEach((movie, index) => {
      console.log(`Movie ${index}: "${movie.title}"`, {
        id: movie.id,
        sessionsCount: movie.sessions ? movie.sessions.length : 0,
        hasSessions: movie.sessions && movie.sessions.length > 0,
        session_count: movie.session_count,
        next_session: movie.next_session
      });
    });
  }, [movies, selectedTab, selectedGenre]);

  // Récupérer les films populaires (premiers 5 films avec sessions)
  const fetchPopularMovies = useCallback(async () => {
    try {
      // Prendre les premiers 5 films qui ont des sessions ou au moins un next_session
      const popular = movies
        .filter(movie => 
          (movie.sessions && movie.sessions.length > 0) || 
          movie.next_session ||
          (movie.session_count && movie.session_count > 0)
        )
        .slice(0, 5);
      console.log('Popular movies for carousel:', popular.length);
      setPopularMovies(popular);
    } catch (err) {
      console.error('Error fetching popular movies:', err);
    }
  }, [movies]);

  // Configuration du carrousel auto-slide
  useEffect(() => {
    if (popularMovies.length > 1) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % popularMovies.length);
      }, 2000); // Changement toutes les 2 secondes
    }

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [popularMovies.length]);

  useEffect(() => {
    fetchPopularMovies();
  }, [fetchPopularMovies]);

  useEffect(() => {
    const extractGenres = () => {
      // Extraire les genres uniques des films depuis la BD
      const uniqueGenres: Set<string> = new Set();
      
      // Ajouter l'option "Tous" en premier
      uniqueGenres.add('Tous');
      
      movies.forEach(movie => {
        if (movie.genre) {
          // Séparer les genres s'ils sont dans une chaîne comma-separated
          const movieGenres = movie.genre.split(',').map(g => g.trim());
          movieGenres.forEach(g => {
            if (g) uniqueGenres.add(g);
          });
        }
      });
      
      // Convertir le Set en tableau d'objets Genre
      const genreList: Genre[] = Array.from(uniqueGenres).map((name, index) => ({
        id: index.toString(),
        name
      }));
      
      setGenres(genreList);
    };

    extractGenres();
  }, [movies]);

  const filterMoviesByGenre = (genre: string | null) => {
    if (genre === 'Tous') {
      setSelectedGenre(null);
    } else {
      setSelectedGenre(genre);
    }
  };

  const handleMoviePress = (movie: Movie) => {
    router.push(`/cinema/MovieDetailScreen?movieId=${movie.id}`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Fonction pour construire l'URL de l'image
  const getImageUrl = (posterPath: string | null) => {
    if (!posterPath) return null;
    
    if (posterPath.startsWith('http')) {
      return posterPath;
    }
    
    // Supprimer le slash initial s'il existe
    const cleanPath = posterPath.startsWith('/') ? posterPath.substring(1) : posterPath;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  // Fonction pour rendre le carrousel
  const renderCarousel = () => {
    if (popularMovies.length === 0) {
      console.log('No popular movies for carousel');
      return null;
    }

    console.log('Rendering carousel with', popularMovies.length, 'movies');

    const currentMovie = popularMovies[currentSlide];
    const imageUrl = getImageUrl(currentMovie.poster);

    return (
      <View style={styles.carouselContainer}>
        <TouchableOpacity 
          style={styles.carouselItem}
          onPress={() => handleMoviePress(currentMovie)}
          activeOpacity={0.8}
        >
          <Image 
            source={
              imageUrl 
                ? { uri: imageUrl }
                : require('../../assets/images/hoplogo.jpeg')
            }
            style={styles.carouselImage}
            resizeMode="cover"
          />
          {/* Gradient overlay for better text readability */}
          <View style={styles.carouselGradientOverlay} />
          <View style={styles.carouselOverlay}>
            <Text style={styles.carouselTitle} numberOfLines={2}>
              {currentMovie.title}
            </Text>
            <Text style={styles.carouselGenre} numberOfLines={1}>
              {currentMovie.genre}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Indicateurs de slide */}
        <View style={styles.carouselIndicators}>
          {popularMovies.map((_, index) => (
            <View
              key={index}
              style={[
                styles.carouselIndicator,
                index === currentSlide && styles.carouselIndicatorActive
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderTabButton = (tab: CinemaTab, label: string) => (
    <TouchableOpacity 
      style={styles.tabButton}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[
        styles.tabText,
        selectedTab === tab && styles.selectedTabText
      ]}>
        {label}
      </Text>
      {selectedTab === tab && <View style={styles.tabUnderline} />}
    </TouchableOpacity>
  );

  const renderGenreItem = ({ item }: { item: Genre }) => (
    <TouchableOpacity 
      style={[
        styles.genreButton, 
        (selectedGenre === item.name || (item.name === 'Tous' && selectedGenre === null)) && styles.selectedGenreButton
      ]}
      onPress={() => filterMoviesByGenre(item.name === 'Tous' ? null : item.name)}
    >
      <Text style={[
        styles.genreText,
        (selectedGenre === item.name || (item.name === 'Tous' && selectedGenre === null)) && styles.selectedGenreText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <MovieCard 
      movie={item} 
      size="medium" 
      onPress={handleMoviePress}
    />
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const getTabTitle = () => {
    switch (selectedTab) {
      case 'today':
        return "Films d'aujourd'hui";
      case 'tomorrow':
        return "Films de demain";
      default:
        return selectedGenre ? `Films ${selectedGenre}` : 'Films populaires';
    }
  };

  // Filtrer les films pour n'afficher que ceux avec des sessions
  const moviesWithSessions = movies.filter(movie => {
    const hasSessions = 
      (movie.sessions && movie.sessions.length > 0) ||
      movie.next_session ||
      (movie.session_count && movie.session_count > 0);
    
    console.log(`Movie "${movie.title}" - sessions: ${movie.sessions?.length}, next_session: ${!!movie.next_session}, session_count: ${movie.session_count}, included: ${hasSessions}`);
    
    return hasSessions;
  });

  console.log('=== FILTERING RESULTS ===');
  console.log('Total movies:', movies.length);
  console.log('Movies with sessions:', moviesWithSessions.length);
  console.log('Movies without sessions:', movies.length - moviesWithSessions.length);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement des films...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Carrousel des films populaires */}
        {selectedTab === 'popular' && renderCarousel()}

        {/* Section Onglets */}
        <View style={styles.tabsContainer}>
          {renderTabButton('popular', 'Populaire')}
          {renderTabButton('today', "Aujourd'hui")}
          {renderTabButton('tomorrow', 'Demain')}
        </View>

        {/* Section Genres (uniquement pour l'onglet Populaire) */}
        {selectedTab === 'popular' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catégories</Text>
            <FlatList
              data={genres}
              renderItem={renderGenreItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.genreList}
              scrollEnabled={true}
            />
          </View>
        )}

        {/* Films filtrés */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getTabTitle()}</Text>
          <Text style={styles.debugText}>
            {movies.length} films chargés • {moviesWithSessions.length} avec sessions
          </Text>
          
          {moviesWithSessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="film-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>
                {selectedTab === 'today' 
                  ? "Aucun film programmé aujourd'hui" 
                  : selectedTab === 'tomorrow'
                  ? "Aucun film programmé demain"
                  : selectedGenre 
                    ? `Aucun film trouvé dans la catégorie ${selectedGenre}` 
                    : 'Aucun film disponible pour le moment'
                }
              </Text>
              <Text style={styles.debugInfo}>
                Debug: {movies.length} films chargés au total
              </Text>
            </View>
          ) : (
            <View style={styles.moviesGrid}>
              {moviesWithSessions.map((movie) => (
                <View key={movie.id.toString()} style={styles.movieCardWrapper}>
                  {renderMovieItem({ item: movie })}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Load more indicator */}
        {hasMore && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadMoreText}>Chargement...</Text>
          </View>
        )}
        
        {/* Espace en bas pour le FAB */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bouton flottant pour Mes Tickets - Même style que dans events.tsx */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.surface }]}
        icon={() => (
          <Image
            source={require('../../assets/images/ticket_icon.png')}
            style={{
              width: 52,
              height: 52,
              alignSelf: "center",
              transform: [{ translateY: -10 }],
            }}
            resizeMode="contain"
          />
        )}
        onPress={() => router.push('/cinema/ticket_cinema')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 80,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#991d1d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  // Nouveaux styles pour le carrousel amélioré
  carouselContainer: {
    marginBottom: 20,
    marginHorizontal: -16, // Supprime les marges latérales pour occuper toute la largeur
    overflow: 'hidden',
    // Suppression du box shadow comme demandé
  },
  carouselItem: {
    height: 280, // Augmentation de la hauteur pour un carrousel plus grand
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120, // Gradient plus grand pour mieux voir le texte
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    paddingTop: 25,
  },
  carouselTitle: {
    color: 'white',
    fontSize: 22, // Texte plus grand
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  carouselGenre: {
    color: '#e0e0e0',
    fontSize: 16, // Texte plus grand
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100, // Ajusté pour la nouvelle hauteur
    left: 0,
    right: 0,
    paddingVertical: 8,
  },
  carouselIndicator: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  carouselIndicatorActive: {
    backgroundColor: 'white',
    width: 12,
  },
  // Styles pour les onglets
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 16,
  },
  selectedTabText: {
    color: '#991d1d',
    fontWeight: 'bold',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: '#991d1d',
  },
  genreList: {
    paddingBottom: 8,
  },
  genreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedGenreButton: {
    backgroundColor: '#991d1d',
    borderColor: '#991d1d',
  },
  genreText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedGenreText: {
    color: 'white',
  },
  moviesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  movieCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
    fontSize: 16,
  },
  debugInfo: {
    color: '#999',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  loadMoreContainer: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadMoreText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  bottomSpacer: {
    height: 80, // Espace pour le FAB
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 5
  },
});