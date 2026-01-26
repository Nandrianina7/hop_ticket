import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getSavedItems, likeItem, addComment, saveItem } from '../../utils/api';
import FeedItem from './FeedItem';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../_layout'; // IMPORT AJOUTÉ

const SavedScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { isDark } = useAppTheme(); // HOOK AJOUTÉ
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedItems = async () => {
    try {
      setLoading(true);
      const items = await getSavedItems();
      setSavedItems(items);
    } catch (error) {
      console.error('Error loading saved items:', error);
      Alert.alert('Erreur', 'Impossible de charger les éléments enregistrés');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSavedItems();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSavedItems();
  };

  const handleItemPress = (item) => {
    if (item.type === 'event') {
      router.push(`../event/${item.data.id}`);
    } else if (item.type === 'movie') {
      router.push(`../cinema/MovieDetailScreen?movieId=${item.data.id}`);
    }
  };

  const handleLike = async (itemId, itemType) => {
    try {
      const response = await likeItem(itemId, itemType);
      
      setSavedItems(prev => prev.map(item => 
        item.data.id === itemId && item.type === itemType
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

  const handleSave = async (itemId, itemType) => {
    try {
      const response = await saveItem(itemId, itemType);
      
      setSavedItems(prev => prev.map(item => 
        item.data.id === itemId && item.type === itemType
          ? { 
              ...item, 
              data: {
                ...item.data,
                user_saved: response.saved
              }
            }
          : item
      ));
      
      if (!response.saved) {
        setSavedItems(prev => prev.filter(item => 
          !(item.data.id === itemId && item.type === itemType)
        ));
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Erreur', 'Impossible de modifier l\'enregistrement');
    }
  };

  const handleComment = async (itemId, itemType, content, replyTo = null) => {
    try {
      await addComment(itemId, itemType, content, replyTo);
      
      setSavedItems(prev => prev.map(item => 
        item.data.id === itemId && item.type === itemType
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

  const renderSavedItem = ({ item }) => {
    return (
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
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#121212' : '#f9f9f9' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#000000' }]}>
          Chargement des éléments enregistrés...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f9f9f9' }]}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#000000', fontWeight: 'bold' }]}>
          Mes éléments enregistrés
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <FlatList
        data={savedItems}
        renderItem={renderSavedItem}
        keyExtractor={item => `${item.type}-${item.data.id}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDark ? '#cccccc' : '#666666' }]}>
              Aucun élément enregistré
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
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

export default SavedScreen;