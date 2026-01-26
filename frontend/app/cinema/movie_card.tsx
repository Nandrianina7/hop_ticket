// app/cinema/movie_card.tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from './types'; // Import du type depuis le fichier séparé
import { useAppTheme } from '../_layout'; // Import du hook pour le thème

const { width } = Dimensions.get('window');

interface MovieCardProps {
  movie: Movie;
  onPress?: (movie: Movie) => void;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  onPress, 
  size = 'medium',
  showDetails = true 
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const { isDark } = useAppTheme(); // Récupération de l'état du thème
  
  const handlePress = () => {
    if (onPress) {
      onPress(movie);
    } else {
      router.push(`/cinema/MovieDetailScreen?movieId=${movie.id}`);
    }
  };

  // Format portrait (ratio 2:3)
  const getCardSize = () => {
    const cardWidth = (width - 40) / 2;
    const cardHeight = cardWidth * 1.5; // Ratio 2:3 pour format portrait
    
    switch (size) {
      case 'small':
        return { width: (width - 48) / 3, height: 180 };
      case 'large':
        return { width: width - 32, height: 250 };
      default:
        return { width: cardWidth, height: cardHeight };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return { title: 12, details: 10, rating: 10, badge: 8 };
      case 'large':
        return { title: 16, details: 12, rating: 14, badge: 10 };
      default:
        return { title: 14, details: 11, rating: 12, badge: 9 };
    }
  };

  const cardSize = getCardSize();
  const fontSize = getFontSize();

  // Construction de l'URL complète de l'image
  const getImageSource = () => {
    if (movie.poster && !imageError) {
      if (movie.poster.startsWith('http')) {
        return { uri: movie.poster };
      } else {
        return { uri: `${API_BASE_URL}${movie.poster}` };
      }
    }
    return require('../../assets/images/hoplogo.jpeg');
  };

  // Convertir le rating en nombre
  const getRatingValue = () => {
    if (movie.rating_value !== undefined) return movie.rating_value;
    
    const ratingMap: { [key: string]: number } = {
      'G': 8.0,
      'PG': 7.5,
      'PG-13': 8.2,
      'R': 8.5,
      'NC-17': 9.0
    };
    
    return ratingMap[movie.rating] || 8.0;
  };

  // Formater la date de la session
  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Générer des badges de genre
  const renderGenreBadges = () => {
    if (!movie.genre) return null;
    
    const genres = movie.genre.split(',').map((g: string) => g.trim()).slice(0, 2);
    
    return (
      <View style={styles.genreBadges}>
        {genres.map((genre: string, index: number) => (
          <View key={index} style={[styles.genreBadge, { backgroundColor: isDark ? '#333' : '#000000d2' }]}>
            <Text style={[styles.genreBadgeText, { fontSize: fontSize.badge, color: isDark ? '#fff' : '#fff' }]} numberOfLines={1}>
              {genre}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Afficher le rating avec étoiles
  const renderRating = () => {
    const rating = getRatingValue();
    
    return (
      <View style={[styles.ratingContainer, { backgroundColor: isDark ? '#333' : '#8959faff' }]}>
        <Ionicons name="star" size={fontSize.rating} color="#FFD700" />
        <Text style={[styles.ratingText, { fontSize: fontSize.rating, color: isDark ? '#fff' : '#f3f3f3ff' }]}>
          {rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  // Afficher les informations de session et cinéma
  const renderSessionInfo = () => {
    if (!movie.next_session && (!movie.sessions || movie.sessions.length === 0)) {
      return null;
    }

    const session = movie.next_session || movie.sessions?.[0];
    if (!session) return null;

    return (
      <View style={styles.sessionInfo}>
        <View style={[styles.sessionBadge, { 
          backgroundColor: isDark ? '#333' : '#ffffffff',
          borderColor: isDark ? '#555' : '#000000ff'
        }]}>
          <Ionicons name="time-outline" size={fontSize.badge} color={isDark ? '#ccc' : '#8b8b8bff'} />
          <Text style={[styles.sessionText, { fontSize: fontSize.badge, color: isDark ? '#ccc' : '#666' }]} numberOfLines={1}>
            {formatSessionDate(session.start_time)}
          </Text>
        </View>
        
        {session.hall?.cinema && (
          <View style={[styles.cinemaBadge, { backgroundColor: isDark ? '#2a2a2a' : '#f9f0e8' }]}>
            <Ionicons name="location-outline" size={fontSize.badge} color={isDark ? '#ccc' : '#666'} />
            <Text style={[styles.sessionText, { fontSize: fontSize.badge, color: isDark ? '#ccc' : '#666' }]} numberOfLines={1}>
              {session.hall.cinema.name}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Styles dynamiques basés sur le thème
  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#1e1e1e' : 'white',
    },
    title: {
      color: isDark ? '#fff' : '#333',
    },
    duration: {
      color: isDark ? '#d946ef' : '#c922adff',
    },
    littleLigne: {
      backgroundColor: isDark ? '#555' : '#27242477',
    },
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { width: cardSize.width }, dynamicStyles.container]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image 
        source={getImageSource()}
        onError={() => setImageError(true)}
        style={[
          styles.poster, 
          { 
            width: cardSize.width, 
            height: cardSize.height - (showDetails ? 100 : 0),
            borderRadius: 2,
          }
        ]}
        resizeMode="cover"
      />
      
      {showDetails && (
        <View style={styles.details}>
          <View style={styles.box}>
            <Text 
              style={[styles.title, { fontSize: fontSize.title }, dynamicStyles.title]} 
              numberOfLines={2}
            >
              {movie.title}
            </Text> 
            {renderSessionInfo()}

          </View>
          <View style={styles.box2}>
              {renderGenreBadges()}
              <View style={[styles.little_ligne, dynamicStyles.littleLigne]}></View>
              <Text style={[styles.duration, { fontSize: fontSize.details }, dynamicStyles.duration]}>
                 {movie.duration} <Text> min </Text>
              </Text>
          </View>
        </View>
      )}
          {/* <View style={styles.meta}>
            {renderRating()}
          </View> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  poster: {
    width: 100,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    elevation: 3,
  },
  box: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box2: {
    flexDirection: 'row'
  },
  little_ligne: {
    width: 1.2,
    height: 20,
    margin: 8,
    marginTop: -2,
  },
  details: {
    padding: 0,
    paddingTop: 6,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 6,
    marginLeft: 8,
    lineHeight: 18,
    textShadowColor: '#00000081',
    textShadowRadius: 80,
  },
  genreBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 4,
    marginLeft: 8,
  },
  genreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    elevation: 3,
  },
  genreBadgeText: {
    fontWeight: '500',
  },
  sessionInfo: {
    marginBottom: 8,
    gap: 4,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
    gap: 4,
    borderWidth: 0.3,
  },
  cinemaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  sessionText: {
    fontWeight: '500',
  },
  meta: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  duration: {
    fontWeight: 600,
    elevation: 12,
    textShadowColor: '#00000081',
    textShadowRadius: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontWeight: '600',
    marginLeft: 2,
  },
});

export default MovieCard;