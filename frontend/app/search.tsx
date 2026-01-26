// search.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { 
  Searchbar, 
  Text, 
  Card, 
  Avatar,
  IconButton,
  useTheme
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { searchEvents, SearchResult } from '../utils/api';
import { useAppTheme } from '../app/_layout'; 

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const theme = useTheme();
  const { isDark } = useAppTheme(); // Récupération de l'état du thème
  const router = useRouter();

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchEvents(searchQuery);
      setResults(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'event') {
      router.push(`./event/${result.id}`);
    } else if (result.type === 'movie') {
      router.push(`/cinema/MovieDetailScreen?movieId=${result.id}`);
    } else {
      router.push(`/search-results?query=${encodeURIComponent(query)}&type=${result.type}`);
    }
    setShowSuggestions(false);
    setQuery('');
  };

  // const handleCancel = () => {
  //   router.back();
  // };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'event': return 'calendar';
      case 'movie': return 'movie';
      case 'venue': return 'map-marker';
      case 'cinema': return 'theater';
      case 'date': return 'calendar-range';
      case 'year': return 'calendar-year';
      case 'movie_date': return 'calendar-clock';
      case 'movie_year': return 'calendar-star';
      default: return 'magnify';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return 'Événement';
      case 'movie': return 'Film';
      case 'venue': return 'Lieu';
      case 'cinema': return 'Cinéma';
      case 'date': return 'Date';
      case 'year': return 'Année';
      case 'movie_date': return 'Date de film';
      case 'movie_year': return 'Année de film';
      default: return 'Recherche';
    }
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity onPress={() => handleResultPress(item)}>
      <Card style={[
        styles.resultCard, 
        { backgroundColor: isDark ? theme.colors.surface : '#fff' }
      ]} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <Avatar.Icon 
            size={40} 
            icon={getIconForType(item.type)} 
            style={[
              styles.avatar,
              { backgroundColor: isDark ? '#333' : '#f0f0f0' }
            ]}
          />
          <View style={styles.cardText}>
            <Text variant="titleMedium" numberOfLines={1} style={{ color: isDark ? theme.colors.text : '#000' }}>
              {item.name}
            </Text>
            {item.venue && (
              <Text variant="bodyMedium" style={[
                styles.secondaryText,
                { color: isDark ? '#ccc' : '#666' }
              ]}>
                {item.venue}
              </Text>
            )}
            {item.date && (
              <Text variant="bodySmall" style={[
                styles.secondaryText,
                { color: isDark ? '#ccc' : '#666' }
              ]}>
                {formatDate(item.date)}
              </Text>
            )}
            <Text variant="labelSmall" style={[
              styles.typeLabel,
              { color: isDark ? '#888' : '#999' }
            ]}>
              {getTypeLabel(item.type)}
            </Text>
          </View>
          <IconButton 
            icon="chevron-right" 
            size={20} 
            style={styles.chevron}
            iconColor={isDark ? '#fff' : '#000'}
          />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header avec Searchbar */}
      <View style={[
        styles.header,
        { backgroundColor: isDark ? '#1e1e1e' : '#fff' }
      ]}>
        <Searchbar
          placeholder="Rechercher événements, films, lieux, dates..."
          value={query}
          onChangeText={setQuery}
          style={[
            styles.searchbar,
            { backgroundColor: isDark ? '#333' : '#f1f3f6' }
          ]}
          inputStyle={[
            styles.searchInput,
            { color: isDark ? '#fff' : '#000' }
          ]}
          iconColor={theme.colors.primary}
          placeholderTextColor={isDark ? '#888' : '#666'}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          autoFocus
          theme={{
            colors: {
              onSurfaceVariant: isDark ? '#fff' : '#000',
            }
          }}
        />
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
            Annuler
          </Text>
        </TouchableOpacity>
      </View>

      {/* Suggestions de recherche */}
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text variant="bodyMedium" style={[
                styles.loadingText,
                { color: isDark ? '#ccc' : '#666' }
              ]}>
                Recherche en cours...
              </Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              renderItem={renderResultItem}
              contentContainerStyle={styles.resultsList}
              ItemSeparatorComponent={() => (
                <View style={[
                  styles.separator,
                  { backgroundColor: isDark ? '#333' : '#f0f0f0' }
                ]} />
              )}
            />
          ) : (
            <View style={styles.noResults}>
              <Avatar.Icon 
                size={64} 
                icon="magnify" 
                style={[
                  styles.noResultsIcon,
                  { backgroundColor: 'transparent' }
                ]}
                color={isDark ? '#888' : '#666'}
              />
              <Text variant="bodyLarge" style={[
                styles.noResultsText,
                { color: isDark ? '#ccc' : '#666' }
              ]}>
                Aucun résultat trouvé pour &quot;{query}&quot;
              </Text>
              <Text variant="bodyMedium" style={[
                styles.noResultsSubtext,
                { color: isDark ? '#888' : '#999' }
              ]}>
                Essayez avec d&apos;autres mots-clés
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Historique/résultats récents */}
      {!showSuggestions && query === '' && (
        <View style={styles.recentSearches}>
          <Text variant="titleMedium" style={[
            styles.sectionTitle,
            { color: isDark ? '#fff' : '#000' }
          ]}>
            Recherches récentes
          </Text>
          {/* Ici vous pourriez ajouter un système de stockage local pour les recherches récentes */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    gap: 12,
  },
  searchbar: {
    flex: 1,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  cancelButton: {
    padding: 8,
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultCard: {
    marginVertical: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  secondaryText: {
    opacity: 0.7,
    marginTop: 2,
  },
  typeLabel: {
    marginTop: 4,
    opacity: 0.5,
  },
  chevron: {
    margin: 0,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  recentSearches: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
});