// app/cinema/MovieDetailScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Animated,
  Linking,
  Modal,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import YoutubePlayer from "react-native-youtube-iframe";
import { Ionicons } from '@expo/vector-icons';
import { useMovieDetail, useMovieSessions } from '../../hooks/useMovieDetail'
import { API_BASE_URL } from '../../utils/api';

import GenreBadges from '../../components/GenreBadges';
import CastMember from '../../components/CastMember';
import RatingStars from '../../components/RatingStars';

const { height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 100;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const MovieDetailScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { movieId } = useLocalSearchParams();
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dominantColor, setDominantColor] = useState('#c7babaff');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
   const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef(null);
  const [videoId, setVideoId] = useState<string>("");
  const getYouTubeVideoId = (urlOrId: string) => {
    if (!urlOrId) return null;
    // already looks like an ID
    if (/^[A-Za-z0-9_-]{11}$/.test(urlOrId)) return urlOrId;

    try {
      const u = new URL(String(urlOrId));
      // Standard watch URL: ?v=ID
      const v = u.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;

      // Handle /embed/ID, /v/ID, /shorts/ID, /live/ID, youtu.be/ID
      const parts = u.pathname.split('/').filter(Boolean);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (/^[A-Za-z0-9_-]{11}$/.test(p)) return p;
      }
    } catch {
      // not a URL, try regex fallback
      const m = String(urlOrId).match(/(?:v=|\/)([A-Za-z0-9_-]{11})(?:[&?]|$)/);
      if (m) return m[1];
    }
    return null;
  };

  const handlePlayPress = () => {
    setVisible(true);
    setPlaying(true);
    setVideoId(getYouTubeVideoId(movie?.trailer_url || "") || "");
  };

  const handleClose = () => {
    setPlaying(false);
    setVisible(false);
  };
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const numericMovieId = parseInt(movieId as string, 10);
  const { movie, loading, error } = useMovieDetail(numericMovieId);

  const { sessions: movieSessions, loading: sessionsLoading } = useMovieSessions(numericMovieId);

  useEffect(() => {
    const extractColor = () => {
      if (!movie?.poster) return;
      
      try {
        const imageUri = movie.poster.startsWith('http') 
          ? movie.poster 
          : `${API_BASE_URL}${movie.poster}`;
        
        // Palette de couleurs prédéfinies basée sur le genre du film
        const colorMap: { [key: string]: string } = {
          'action': '#e74c3c',
          'adventure': '#f39c12',
          'comedy': '#f1c40f',
          'drama': '#3498db',
          'horror': '#9b59b6',
          'romance': '#e91e63',
          'sci-fi': '#2ecc71',
          'thriller': '#34495e',
          'fantasy': '#8e44ad',
          'animation': '#1abc9c',
          'family': '#16a085',
          'crime': '#7f8c8d',
          'documentary': '#95a5a6',
          'mystery': '#d35400',
          'music': '#9b59b6',
          'war': '#c0392b',
          'western': '#d35400',
        };
        
        let selectedColor = '#ffffffff'; // Couleur par défaut
        
        // Trouver une couleur basée sur le genre
        if (movie.genre) {
          const genres = movie.genre.toLowerCase().split(',');
          for (const genre of genres) {
            const trimmedGenre = genre.trim();
            if (colorMap[trimmedGenre]) {
              selectedColor = colorMap[trimmedGenre];
              break;
            }
          }
        }
        
        setDominantColor(selectedColor);
        
        // Obtenir les dimensions de l'image
        Image.getSize(imageUri, (imgWidth, imgHeight) => {
          setImageSize({ width: imgWidth, height: imgHeight });
        }, () => {
          setImageSize({ width: 300, height: 450 });
        });
      } catch (error) {
        console.error('Erreur lors de l\'extraction de la couleur:', error);
      }
    };

    if (movie?.poster) {
      extractColor();
    }
  }, [movie?.poster, movie?.genre]);

  const handleBookTicket = () => {
    if (movieSessions && movieSessions.length > 0) {
      // Rediriger directement vers la page de réservation avec la première session disponible
      const firstSession = movieSessions[0];
      router.push(`/cinema/booking?sessionId=${firstSession.id}&movieId=${movie.id}`);
    } else {
      alert('Aucune session disponible pour ce film');
    }
  };

  const handleViewCalendar = () => {
    // Rediriger vers le calendrier des sessions
    router.push(`/cinema/CalendarScreen?movieId=${movie.id}`);
  };

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const getImageSource = () => {
    if (movie?.poster && !imageError) {
      if (movie.poster.startsWith('http')) {
        return { uri: movie.poster };
      } else {
        return { uri: `${API_BASE_URL}${movie.poster}` };
      }
    }
    return require('../../assets/images/hoplogo.jpeg');
  };

  const getRatingValue = () => {
    const ratingMap: { [key: string]: number } = {
      'G': 8.0,
      'PG': 7.5,
      'PG-13': 8.2,
      'R': 8.5,
      'NC-17': 9.0
    };
    return ratingMap[movie?.rating || 'G'] || 8.0;
  };

  const getCastMembers = () => {
    if (!movie?.cast) return [];
    return movie.cast.split(',').map((name: string) => name.trim()).filter((name: string | any[]) => name.length > 0);
  };

  const handlePlayTrailer = async () => {
    if (!movie?.trailer_url) {
      alert('Aucune bande-annonce disponible pour ce film');
      return;
    }

    setIsVideoLoading(true);
    setVideoError(false);
    
    try {
      // Essayer d'ouvrir directement dans YouTube ou le navigateur
      const canOpen = await Linking.canOpenURL(movie.trailer_url);
      if (canOpen) {
        await Linking.openURL(movie.trailer_url);
      } else {
        setVideoError(true);
        alert('Impossible d\'ouvrir la bande-annonce');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la vidéo:', error);
      setVideoError(true);
      alert('Erreur lors de l\'ouverture de la bande-annonce');
    } finally {
      setIsVideoLoading(false);
    }
  };

  const extractYoutubeVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Chargement du film...</Text>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error || 'Film non trouvé'}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} onPress={() => router.back()}>
          <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const castMembers = getCastMembers();
  const ratingValue = getRatingValue();
  const youtubeVideoId = movie.trailer_url ? extractYoutubeVideoId(movie.trailer_url) : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={dominantColor} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>{movie.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Image du film avec bouton play */}
        <Animated.View style={[styles.posterContainer, { opacity: imageOpacity }]}>
          <Image
            source={getImageSource()}
            onError={() => setImageError(true)}
            style={styles.poster}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
          
          {/* Bouton play pour la bande-annonce */}
          {movie.trailer_url && (
            <TouchableOpacity 
              style={styles.playButton}
              onPress={handlePlayPress}
              disabled={isVideoLoading}
            >
              {isVideoLoading ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <Ionicons name="play-circle" size={64} color="white" />
              )}
            </TouchableOpacity>
          )}
          
          {/* Bouton like */}
          <TouchableOpacity 
            style={styles.likeButton}
            onPress={handleLikePress}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={28} 
              color={isLiked ? "#FF3B30" : "white"} 
            />
            {likesCount > 0 && (
              <Text style={styles.likesCount}>{likesCount}</Text>
            )}
          </TouchableOpacity>

          {/* Informations sur la taille de l'image */}
          <View style={styles.imageInfo}>
            <Text style={styles.imageInfoText}>
              {imageSize.width} × {imageSize.height} px
            </Text>
          </View>

          {/* Indicateur de miniaturisation YouTube si disponible */}
          {youtubeVideoId && (
            <View style={styles.youtubeBadge}>
              <Ionicons name="logo-youtube" size={16} color="white" />
              <Text style={styles.youtubeText}>YouTube</Text>
            </View>
          )}
        </Animated.View>

        {/* Contenu détaillé */}
        <View style={styles.content}>
          {/* <View style={styles.titleSection}>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>{movie.title}</Text>
            <RatingStars rating={ratingValue} />
          </View> */}
          
          <View style={styles.metadata}>
            {/* <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>{movie.rating}</Text> */}
            {/* <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>•</Text> */}
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>{movie.duration_formatted}</Text>
            {movie.trailer_url && (
              <>
                <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>•</Text>
                <TouchableOpacity onPress={handlePlayTrailer}>
                  <Text style={[styles.metaText, { color: theme.colors.primary }]}>Bande-annonce</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {movie.genre && (
            <View style={styles.genreSection}>
              <GenreBadges genres={movie.genre} />
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Description</Text>
            <Text style={[styles.description, { color: theme.colors.onSurface }]}>
              {movie.description || 'Aucune description disponible.'}
            </Text>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>Date de sortie:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                {new Date(movie.release_date).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>Réalisateur:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>{movie.director || 'Non spécifié'}</Text>
            </View>

            {movie.trailer_url && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>Bande-annonce:</Text>
                <TouchableOpacity onPress={handlePlayTrailer}>
                  <Text style={[styles.detailValue, { color: theme.colors.primary }]}>Regarder maintenant</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Section Sessions - Boutons pour réserver ou voir le calendrier */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Séances disponibles
            </Text>
            
            {sessionsLoading ? (
              <View style={styles.loadingSessions}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
                  Chargement des sessions...
                </Text>
              </View>
            ) : (
              <View style={styles.sessionsInfo}>
                <Text style={[styles.sessionsCount, { color: theme.colors.onSurface }]}>
                  {movieSessions?.length || 0} session(s) disponible(s)
                </Text>      
                {/* Bouton pour voir le calendrier */}
                <TouchableOpacity 
                  style={[styles.calendarButton, { borderColor: theme.colors.primary }]}
                  onPress={handleViewCalendar}
                  disabled={!movieSessions || movieSessions.length === 0}
                >
                  <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                  <Text style={[styles.calendarButtonText, { color: theme.colors.primary }]}>
                    Voir le calendrier complet
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {castMembers.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Distribution</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.castScroll}
              >
                <View style={styles.castContainer}>
                  {castMembers.map((actor: string, index: number) => (
                    <CastMember key={index} name={actor} />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Bouton réservation fixe */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          style={[styles.bookButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleBookTicket}
          disabled={!movieSessions || movieSessions.length === 0}
        >
          <Ionicons name="ticket" size={20} color={theme.colors.onPrimary} />
          <Text style={[styles.bookButtonText, { color: theme.colors.onPrimary }]}>
            Réserver une place
          </Text>
        </TouchableOpacity>
      </View>
      {/* Modal Player */}
      <Modal visible={visible} animationType="fade" onRequestClose={handleClose}>
        <View style={styles.modalContainer}>
          <YoutubePlayer
            ref={playerRef}
            height={250}
  width={350}
            play={playing}
            videoId={videoId} // <-- Replace with your video ID
            onChangeState={(state: string) => {
              if (state === "ended") {
                setPlaying(false);
              }
            }}
          />
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorText: { textAlign: 'center', marginBottom: 16, fontSize: 16 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  closeText: {
    fontWeight: "bold",
    color: "#000",
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },  
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
  },

  posterContainer: {
    height: height * 0.5,
    width: '100%',
    position: 'relative',
  },
  poster: { 
    width: '100%', 
    height: '100%',
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
    zIndex: 10,
  },

  likeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  likesCount: { color: 'white', fontSize: 10, marginTop: 2 },

  imageInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageInfoText: {
    color: 'white',
    fontSize: 12,
  },

  youtubeBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  youtubeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 'bold',
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },
  titleSection: { marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  metadata: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 },
  metaText: { fontSize: 14, marginRight: 8 },
  genreSection: { marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24 },
  details: { marginBottom: 24 },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { fontWeight: 'bold', width: 120, fontSize: 14 },
  detailValue: { flex: 1, fontSize: 14 },
  castScroll: { marginHorizontal: -20 },
  castContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },

  // Styles pour la section sessions
  sessionsInfo: {
    alignItems: 'center',
    gap: 12,
  },
  sessionsCount: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    width: '100%',
  },
  bookNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    width: '100%',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  calendarButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSessions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  bookButtonText: { fontSize: 16, fontWeight: 'bold' },
});

export default MovieDetailScreen;