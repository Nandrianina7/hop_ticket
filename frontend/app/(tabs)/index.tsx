import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { fetchFeed, likeItem, addComment, saveItem, isAuthenticated } from '../../utils/api';
// import { RefreshContext } from './tablayout';
import FeedItem from '../actu_components/FeedItem';
import AdsBanner from '../actu_components/AdsBanner';
import { RefreshContext } from '../tabLayout';

interface FeedItem {
  id: number;
  type: 'event' | 'movie';
  data: any;
}

export default function HomeScreen() {
  const theme = useTheme();
  const { setRefreshHome } = React.useContext(RefreshContext);
  const router = useRouter();
  
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAds, setShowAds] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  // const router = useRouter();
    const [token, setToken] = useState<boolean | null>(null);
    const checkAuth = async () => {
      // await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 secondes

      const tok = await isAuthenticated();
      setToken(tok);
      console.log("IntroScreen - Retrieved token:", token);
      if (tok) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    };


  const loadFeedData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchFeed();
      
      if (response && response.feed) {
        const validatedFeed = response.feed.map((item: any) => ({
          id: Number(item.id) || 0,
          type: item.type || 'event',
          data: item.data || {}
        }));
        
        setFeedItems(validatedFeed);
      } else {
        setFeedItems([]);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
      Alert.alert('Erreur', 'Impossible de charger le fil d\'actualités');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setFirstLoad(false);
    }
  }, []);

  useEffect(() => {
     checkAuth();
    if (token) {
      loadFeedData();
    }
    setRefreshHome(() => loadFeedData);
  }, [token, loadFeedData, setRefreshHome]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeedData();
  }, [loadFeedData]);

  // Fonction pour fermer l'annonce
  const handleCloseAds = () => {
    setShowAds(false);
  };

  const handleItemPress = (item: FeedItem) => {
    if (item.type === 'event') {
      router.push(`/event/${item.id}`);
    } else if (item.type === 'movie') {
      router.push(`/cinema/MovieDetailScreen?movieId=${item.id}`);
    }
  };

  const handleLike = async (itemId: number, itemType: 'event' | 'movie') => {
    try {
      const response = await likeItem(itemId, itemType);
      console.log('Like response:', response);
      
      setFeedItems(prev => prev.map(item => 
        item.id === itemId && item.type === itemType
          ? { 
              ...item, 
              data: {
                ...item.data,
                user_liked: response.liked,
                likes_count: response.likes_count
              }
            }
          : item
      ));
    } catch (error) {
      console.error('Like error:', error);
      Alert.alert('Erreur', 'Impossible de liker cet élément');
    }
  };

  const handleSave = async (itemId: number, itemType: 'event' | 'movie') => {
    try {
      const response = await saveItem(itemId, itemType);
      
      setFeedItems(prev => prev.map(item => 
        item.id === itemId && item.type === itemType
          ? { 
              ...item, 
              data: {
                ...item.data,
                user_saved: response.saved
              }
            }
          : item
      ));
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer cet élément');
    }
  };

  const handleComment = async (itemId: number, itemType: 'event' | 'movie', content: string, replyTo: number | null = null) => {
    try {
      await addComment(itemId, itemType, content, replyTo);
      
      // Mettre à jour le compteur de commentaires
      setFeedItems(prev => prev.map(item => 
        item.id === itemId && item.type === itemType
          ? { 
              ...item, 
              data: {
                ...item.data,
                comments_count: (item.data.comments_count || 0) + 1
              }
            }
          : item
      ));
      
      Alert.alert('Succès', 'Commentaire ajouté');
    } catch (error) {
      console.error('Comment error:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire');
    }
  };

  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    return (
      //   <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
      //   <ActivityIndicator size="large" color={theme.colors.primary} />
      //   <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
      //     Chargement du fil d&#39;actualités...
      //   </Text>
      // </View>
    //  <Text></Text>
      <FeedItem
        item={item}
        onLike={handleLike}
        onComment={handleComment}
        onItemPress={handleItemPress}
        onSave={handleSave}
      />
   );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Chargement du fil d&#39;actualités...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={feedItems}
        renderItem={renderFeedItem}
        keyExtractor={item => `${item.type}-${item.id}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          // Afficher la bannière publicitaire seulement lors du premier chargement
          firstLoad && showAds ? (
            <AdsBanner 
              onClose={handleCloseAds} 
              imageUri={require('../../assets/images/hoplogo.jpeg')} 
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              Aucun contenu à afficher
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  feedList: {
    padding: 16,
    paddingBottom: 32,
  },
});