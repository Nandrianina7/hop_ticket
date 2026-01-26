// app/cinema/CalendarScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { axiosInstance } from '../../utils/api';
import { API_BASE_URL } from '../../utils/api';

interface Cinema {
  id: number;
  name: string;
  city: string;
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
    poster?: string;
    genre?: string;
    rating?: string;
  };
}

interface MovieDetails {
  id: number;
  title: string;
  poster: string;
  genre: string;
  rating: string;
  duration: number;
  description: string;
  director: string;
  release_date: string;
}

const { width } = Dimensions.get('window');

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasSessions: boolean;
  sessionsCount: number;
  isToday: boolean;
  sessions?: MovieSession[];
}

export default function CalendarScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { movieId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  const [selectedDaySessions, setSelectedDaySessions] = useState<MovieSession[]>([]);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [imageError, setImageError] = useState(false);

  // Charger les détails du film
  const fetchMovieDetails = async () => {
    try {
      if (!movieId) return;
      
      const response = await axiosInstance.get(`/cinema/movies/${movieId}/`);
      setMovieDetails(response.data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  // Charger les sessions du film
  const fetchMovieSessions = async () => {
    try {
      setLoading(true);
      
      if (!movieId) {
        console.error('ID de film manquant');
        return;
      }

      const response = await axiosInstance.get(`/cinema/movies/${movieId}/sessions/`);
      setSessions(response.data);
      generateCalendar(selectedDate, response.data);
    } catch (error) {
      console.error('Error fetching movie sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Générer le calendrier
  const generateCalendar = (month: Date, sessionsList: MovieSession[]) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, monthIndex, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Premier jour à afficher (peut être du mois précédent)
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay());
    
    // Dernier jour à afficher (peut être du mois suivant)
    const endDay = new Date(lastDay);
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDate = new Date();
    
    for (let day = new Date(startDay); day <= endDay; day.setDate(day.getDate() + 1)) {
      const date = new Date(day);
      const isCurrentMonth = date.getMonth() === monthIndex;
      const isToday = date.toDateString() === currentDate.toDateString();
      
      // Vérifier les sessions pour cette date
      const daySessions = sessionsList.filter(session => {
        const sessionDate = new Date(session.start_time);
        return sessionDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date: new Date(date),
        isCurrentMonth,
        hasSessions: daySessions.length > 0,
        sessionsCount: daySessions.length,
        isToday,
        sessions: daySessions,
      });
    }
    
    setCalendarDays(days);
    
    // Afficher les sessions du jour sélectionné par défaut
    const todaySessions = sessionsList.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate.toDateString() === selectedDate.toDateString();
    });
    setSelectedDaySessions(todaySessions);
  };

  // Changer de mois
  const changeMonth = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
    generateCalendar(newDate, sessions);
  };

  // Sélectionner une date - REDIRECTION AUTOMATIQUE VERS LE BOOKING
  const handleDateSelect = (date: Date, daySessions: MovieSession[]) => {
    setSelectedDate(date);
    
    // Si la date a des sessions, rediriger automatiquement vers le booking
    if (daySessions.length > 0) {
      // Prendre la première session de la journée pour la redirection
      const firstSession = daySessions[0];
      router.push(`/cinema/booking?sessionId=${firstSession.id}&movieId=${movieId}`);
    } else {
      // Si pas de sessions, juste mettre à jour l'affichage
      setSelectedDaySessions([]);
    }
  };

  // Sélectionner une session (pour la liste détaillée)
  const handleSessionSelect = (session: MovieSession) => {
    router.push(`/cinema/booking?sessionId=${session.id}&movieId=${movieId}`);
  };

  const getImageSource = () => {
    if (movieDetails?.poster && !imageError) {
      if (movieDetails.poster.startsWith('http')) {
        return { uri: movieDetails.poster };
      } else {
        return { uri: `${API_BASE_URL}${movieDetails.poster}` };
      }
    }
    return require('../../assets/images/hoplogo.jpeg');
  };

  const getGenreBadges = () => {
    if (!movieDetails?.genre) return null;
    
    const genres = movieDetails.genre.split(',').map(genre => genre.trim());
    return (
      <View style={styles.genreContainer}>
        {genres.slice(0, 3).map((genre, index) => (
          <View key={index} style={[styles.genreBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[styles.genreText, { color: theme.colors.onSurfaceVariant }]}>
              {genre}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  useEffect(() => {
    fetchMovieDetails();
    fetchMovieSessions();
  }, [movieId]);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Chargement du calendrier...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête avec informations du film */}
      <View style={[styles.header, styles.responsivePadding]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.responsiveHeaderTitle, { color: theme.colors.onBackground }]}>
            Calendrier des séances
          </Text>
          {movieDetails && (
            <Text style={[styles.movieTitle, { color: theme.colors.onSurfaceVariant }]}>
              {movieDetails.title}
            </Text>
          )}
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Section informations du film */}
      {movieDetails && (
        <View style={[styles.movieInfoSection, styles.responsivePadding]}>
          <Image
            source={getImageSource()}
            onError={() => setImageError(true)}
            style={styles.moviePoster}
            resizeMode="cover"
          />
          <View style={styles.movieDetails}>
            <Text style={[styles.movieTitleLarge, { color: theme.colors.onBackground }]}>
              {movieDetails.title}
            </Text>
            <View style={styles.movieMetadata}>
              <Text style={[styles.movieMeta, { color: theme.colors.onSurfaceVariant }]}>
                {movieDetails.rating} • {Math.floor(movieDetails.duration / 60)}h{movieDetails.duration % 60}
              </Text>
            </View>
            {getGenreBadges()}
            <Text 
              style={[styles.movieDescription, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {movieDetails.description}
            </Text>
          </View>
        </View>
      )}

      {/* Contrôles du mois */}
      <View style={[styles.monthSelector, styles.responsivePadding]}>
        <TouchableOpacity 
          onPress={() => changeMonth(-1)}
          style={styles.monthButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.monthTitle, { color: theme.colors.onBackground }]}>
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
        
        <TouchableOpacity 
          onPress={() => changeMonth(1)}
          style={styles.monthButton}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Jours de la semaine */}
      <View style={[styles.weekDays, styles.responsivePadding]}>
        {dayNames.map(day => (
          <Text 
            key={day}
            style={[styles.weekDayText, { color: theme.colors.onSurfaceVariant }]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Grille du calendrier */}
      <View style={[styles.calendarGrid, styles.responsivePadding]}>
        {calendarDays.map((day, index) => {
          const isSelected = day.date.toDateString() === selectedDate.toDateString();
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.dayCellOtherMonth,
                day.isToday && [styles.dayCellToday, { borderColor: theme.colors.primary }],
                isSelected && [styles.dayCellSelected, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => handleDateSelect(day.date, day.sessions || [])}
            >
              {/* Background du poster pour les jours avec sessions */}
              {day.hasSessions && movieDetails?.poster && !imageError ? (
                <ImageBackground
                  source={getImageSource()}
                  style={styles.dayBackground}
                  imageStyle={styles.dayBackgroundImage}
                >
                  <View style={styles.dayOverlay} />
                  <Text style={[
                    styles.dayText,
                    styles.dayTextWithBackground,
                    { color: 'white' }
                  ]}>
                    {day.date.getDate()}
                  </Text>
                </ImageBackground>
              ) : (
                <Text style={[
                  styles.dayText,
                  { 
                    color: day.isCurrentMonth 
                      ? theme.colors.onBackground 
                      : theme.colors.onSurfaceVariant,
                    opacity: day.isCurrentMonth ? 1 : 0.5
                  }
                ]}>
                  {day.date.getDate()}
                </Text>
              )}
              
              {/* Indicateur de sessions (badge) */}
              {day.hasSessions && day.isCurrentMonth && (
                <View style={[
                  styles.sessionBadge,
                  { 
                    backgroundColor: isSelected ? theme.colors.onPrimary : theme.colors.primary
                  }
                ]}>
                  <Text style={[
                    styles.sessionBadgeText,
                    { 
                      color: isSelected ? theme.colors.primary : theme.colors.onPrimary
                    }
                  ]}>
                    {day.sessionsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Légende */}
      <View style={[styles.legend, styles.responsivePadding]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
            Aujourd'hui
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotPoster]} />
          <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
            Sessions disponibles
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.surfaceVariant }]} />
          <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
            Autre mois
          </Text>
        </View>
      </View>

      {/* Séparateur */}
      <View style={[styles.separator, { backgroundColor: theme.colors.outline }]} />

      {/* Sessions du jour sélectionné */}
      <View style={styles.sessionsSection}>
        <Text style={[styles.sessionsTitle, { color: theme.colors.onBackground }]}>
          Séances du {selectedDate.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </Text>

        <ScrollView style={styles.sessionsList}>
          {selectedDaySessions.length === 0 ? (
            <View style={styles.noSessions}>
              <Ionicons name="film-outline" size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.noSessionsText, { color: theme.colors.onSurfaceVariant }]}>
                Aucune séance programmée
              </Text>
              <Text style={[styles.noSessionsSubtext, { color: theme.colors.onSurfaceVariant }]}>
                Sélectionnez une date avec des sessions disponibles
              </Text>
            </View>
          ) : (
            selectedDaySessions.map(session => (
              <TouchableOpacity
                key={session.id}
                style={[
                  styles.sessionCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }
                ]}
                onPress={() => handleSessionSelect(session)}
              >
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionTime, { color: theme.colors.onSurface }]}>
                    {new Date(session.start_time).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  <Text style={[styles.sessionHall, { color: theme.colors.onSurfaceVariant }]}>
                    {session.hall?.name} • {session.hall?.screen_type}
                  </Text>
                  <Text style={[styles.sessionCinema, { color: theme.colors.onSurfaceVariant }]}>
                    {session.cinema_name || session.hall?.cinema?.name} - {session.cinema_city || session.hall?.cinema?.city}
                  </Text>
                </View>
                
                <View style={styles.sessionPrice}>
                  <Text style={[styles.price, { color: theme.colors.primary }]}>
                    {session.base_price?.toFixed(2) || session.hall?.base_price?.toFixed(2) || '0.00'} MGA
                  </Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={16} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  responsiveHeaderTitle: {
    fontSize: width < 375 ? 16 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  movieTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  responsivePadding: {
    paddingHorizontal: width < 375 ? 12 : 16,
  },
  
  // Movie Info Section
  movieInfoSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  moviePoster: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  movieDetails: {
    flex: 1,
    gap: 8,
  },
  movieTitleLarge: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  movieMetadata: {
    flexDirection: 'row',
  },
  movieMeta: {
    fontSize: 14,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  genreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '500',
  },
  movieDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  
  // Month Selector
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Week Days
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  
  // Calendar Grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25, // Forme ronde
    marginVertical: 2,
    position: 'relative',
  },
  dayCellOtherMonth: {
    opacity: 0.4,
  },
  dayCellToday: {
    borderWidth: 2,
  },
  dayCellSelected: {
    // Style pour la date sélectionnée
  },
  dayBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    overflow: 'hidden',
  },
  dayBackgroundImage: {
    borderRadius: 25,
  },
  dayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dayTextWithBackground: {
    fontWeight: 'bold',
  },
  sessionBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    marginHorizontal: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendDotPoster: {
    backgroundColor: '#666',
    borderWidth: 2,
    borderColor: '#999',
  },
  legendText: {
    fontSize: 12,
  },
  
  // Separator
  separator: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  
  // Sessions Section
  sessionsSection: {
    flex: 1,
  },
  sessionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sessionsList: {
    flex: 1,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTime: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionHall: {
    fontSize: 14,
    marginBottom: 2,
  },
  sessionCinema: {
    fontSize: 12,
  },
  sessionPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // No Sessions
  noSessions: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noSessionsText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  noSessionsSubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});