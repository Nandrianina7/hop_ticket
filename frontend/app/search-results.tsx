// search-results.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { 
  Appbar, 
  Text, 
  useTheme,
  Card,
  Chip
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { searchEvents, SearchResult } from '../utils/api';
import EventCard from '../components/events';
import MovieCard from './cinema/movie_card';
import { useAppTheme } from '../app/_layout'; // Import du hook de thème

const screenWidth = Dimensions.get('window').width;
const gridMargin = 8;
const cardWidth = Math.floor((screenWidth - 32 - gridMargin) / 2);

export default function SearchResultsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { isDark } = useAppTheme(); // Récupération de l'état du thème
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = params.query as string;
  const type = params.type as string;

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        const data = await searchEvents(query);
        const filteredResults = type 
          ? data.filter(item => item.type === type)
          : data;
        setResults(filteredResults);
      } catch (err) {
        console.error('Search results error:', err);
        setError('Erreur lors de la recherche');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      loadResults();
    }
  }, [query, type]);

  const handleEventPress = (eventId: number) => {
    router.push(`./event/${eventId}`);
  };

  const handleMoviePress = (movieId: number) => {
    router.push(`./cinema/${movieId}`);
  };

  const getTitle = () => {
    const typeLabels: Record<string, string> = {
      'venue': 'Lieux',
      'cinema': 'Cinémas',
      'date': 'Dates',
      'year': 'Années',
      'event': 'Événements',
      'movie': 'Films',
      'movie_date': 'Dates de films',
      'movie_year': 'Années de films'
    };
    
    return `${typeLabels[type] || 'Résultats'} : &quot;${query}&quot;`;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'event': 'calendar',
      'movie': 'movie',
      'venue': 'map-marker',
      'cinema': 'theater',
      'date': 'calendar-range',
      'year': 'calendar-year',
      'movie_date': 'calendar-clock',
      'movie_year': 'calendar-star'
    };
    return icons[type] || 'magnify';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'event': 'Événement',
      'movie': 'Film',
      'venue': 'Lieu',
      'cinema': 'Cinéma',
      'date': 'Date',
      'year': 'Année',
      'movie_date': 'Date de film',
      'movie_year': 'Année de film'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <View style={[
        styles.loadingContainer, 
        { backgroundColor: theme.colors.background }
      ]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={[
          styles.loadingText,
          { color: isDark ? '#ccc' : '#666' }
        ]}>
          Recherche en cours...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[
        styles.errorContainer, 
        { backgroundColor: theme.colors.background }
      ]}>
        <Text variant="bodyLarge" style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header theme={{ colors: { primary: isDark ? '#1e1e1e' : '#fff' } }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content 
          title={getTitle()} 
          titleStyle={{ color: isDark ? '#fff' : '#000' }}
        />
      </Appbar.Header>

      {results.length === 0 ? (
        <View style={styles.noResults}>
          <Card style={[
            styles.noResultsCard,
            { backgroundColor: isDark ? '#333' : '#fff' }
          ]}>
            <Card.Content style={styles.noResultsContent}>
              <Text variant="displaySmall" style={styles.noResultsIcon}>
                🔍
              </Text>
              <Text variant="titleMedium" style={[
                styles.noResultsText,
                { color: isDark ? '#fff' : '#000' }
              ]}>
                Aucun résultat trouvé
              </Text>
              <Text variant="bodyMedium" style={[
                styles.noResultsSubtext,
                { color: isDark ? '#ccc' : '#666' }
              ]}>
                Essayez avec d&apos;autres mots-clés
              </Text>
            </Card.Content>
          </Card>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.resultsContainer}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              {item.type === 'event' ? (
                <EventCard
                  id={item.id}
                  title={item.name}
                  image_url={item.image_url}
                  venue={item.venue}
                  onPress={() => handleEventPress(item.id)}
                />
              ) : item.type === 'movie' ? (
                <MovieCard
                  id={item.id}
                  title={item.name}
                  image_url={item.image_url}
                  onPress={() => handleMoviePress(item.id)}
                />
              ) : (
                <Card style={{ backgroundColor: isDark ? '#333' : '#fff' }}>
                  <Card.Content>
                    <Text variant="titleMedium" style={{ color: isDark ? '#fff' : '#000' }}>
                      {item.name}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: isDark ? '#ccc' : '#666' }}>
                      {getTypeLabel(item.type)}
                    </Text>
                  </Card.Content>
                </Card>
              )}
              <Chip 
                icon={getTypeIcon(item.type)}
                style={[
                  styles.typeChip,
                  { backgroundColor: isDark ? '#444' : '#f0f0f0' }
                ]}
                textStyle={{ color: isDark ? '#fff' : '#000' }}
                compact
              >
                {getTypeLabel(item.type)}
              </Chip>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsCard: {
    width: '80%',
    alignItems: 'center',
  },
  noResultsContent: {
    alignItems: 'center',
    padding: 32,
  },
  noResultsIcon: {
    marginBottom: 16,
  },
  noResultsText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    textAlign: 'center',
  },
  resultsContainer: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  gridItem: {
    width: cardWidth,
  },
  typeChip: {
    marginTop: 8,
    alignSelf: 'center',
  },
});