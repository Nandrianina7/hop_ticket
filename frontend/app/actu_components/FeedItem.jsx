import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CommentSection from './CommentSection';
import { useAppTheme } from '../_layout'; // Import du hook pour le thème

const FeedItem = ({ item, onLike, onRate, onComment, onItemPress, onSave  }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const router = useRouter();
  const { isDark } = useAppTheme(); // Récupération de l'état du thème

  const handlePress = () => {
    onItemPress(item);
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      onComment(item.id, item.type, commentText);
      setCommentText('');
      Keyboard.dismiss();
    }
  };

  const handleCommentButtonPress = () => {
    setShowComments(!showComments);
    if (showComments) {
      Keyboard.dismiss();
    }
  };

  const renderStars = (rating, onPress = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress?.(star)}
            disabled={!onPress}
          >
            <MaterialCommunityIcons
              name={star <= rating ? 'star' : 'star-outline'}
              size={20}
              color={star <= rating ? '#FFD700' : '#ccc'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSave = async () => {
    try {
      const response = await onSave(item.id, item.type);
      // Vous pouvez mettre à jour l'état local si nécessaire
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  // Styles dynamiques basés sur le thème
  const dynamicStyles = {
    feedItem: {
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
      borderColor: isDark ? '#333' : '#eee',
    },
    feedTitle: {
      color: isDark ? '#fff' : '#333',
    },
    feedDescription: {
      color: isDark ? '#ccc' : '#666',
    },
    feedMeta: {
      color: isDark ? '#999' : '#888',
    },
    statText: {
      color: isDark ? '#ccc' : '#666',
    },
    commentInputContainer: {
      backgroundColor: isDark ? '#2a2a2a' : '#fff',
      borderColor: isDark ? '#444' : '#ddd',
    },
    commentInput: {
      color: isDark ? '#fff' : '#000',
    },
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      if (showComments) {
        setShowComments(false);
        Keyboard.dismiss();
      }
    }}>
      <View style={[styles.feedItem, dynamicStyles.feedItem]}>
        {/* Partie clicable - Titre et image seulement */}
        <TouchableOpacity onPress={handlePress}>
          <Image
            source={{ uri: item.data.image || item.data.poster || 'https://via.placeholder.com/300' }}
            style={styles.feedImage}
            resizeMode="cover"
          />
          
          <View style={styles.feedContent}>
            <Text style={[styles.feedTitle, dynamicStyles.feedTitle]}>{item.data.name || item.data.title}</Text>
            <Text style={[styles.feedDescription, dynamicStyles.feedDescription]} numberOfLines={2}>
              {item.data.description}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Métadonnées non cliquables */}
        <View style={styles.metaSection}>
          {item.data.venue && (
            <Text style={[styles.feedMeta, dynamicStyles.feedMeta]}>
              <MaterialCommunityIcons name="map-marker" size={14} color={isDark ? '#999' : '#888'} />
              {item.data.location_name}
            </Text>
          )}
          
          <Text style={[styles.feedMeta, dynamicStyles.feedMeta]}>
            <MaterialCommunityIcons name="calendar" size={14} color={isDark ? '#999' : '#888'} />
            {new Date(item.data.date || item.data.release_date).toLocaleDateString()}
          </Text>
        </View>

        {/* Actions (like, comment, rating) */}
        <View style={styles.feedStats}>
          <View style={styles.statItem}>
            <TouchableOpacity onPress={() => onLike(item.id, item.type)}>
              <MaterialCommunityIcons
                name={item.data.user_liked ? 'heart' : 'heart-outline'}
                size={20}
                color={item.data.user_liked ? '#ff375f' : (isDark ? '#ccc' : '#666')}
              />
            </TouchableOpacity>
            <Text style={[styles.statText, dynamicStyles.statText]}>{item.data.likes_count}</Text>
          </View>

          <View style={styles.statItem}>
            <TouchableOpacity onPress={handleCommentButtonPress}>
              <MaterialCommunityIcons 
                name="comment-outline" 
                size={20} 
                color={isDark ? '#ccc' : '#666'} 
              />
            </TouchableOpacity>
            <Text style={[styles.statText, dynamicStyles.statText]}>{item.data.comments_count}</Text>
          </View>

          <View style={styles.statItem}>
            <TouchableOpacity onPress={handleSave}>
              <MaterialCommunityIcons
                name={item.data.user_saved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={item.data.user_saved ? '#007AFF' : (isDark ? '#ccc' : '#666')}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section de commentaires */}
        {showComments && (
          <CommentSection 
            itemId={item.id}
            itemType={item.type}
            onComment={onComment}
            onClose={() => setShowComments(false)}
          />
        )}

        {/* Input pour nouveau commentaire */}
        <View style={[styles.commentInputContainer, dynamicStyles.commentInputContainer]}>
          <TextInput
            style={[styles.commentInput, dynamicStyles.commentInput]}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity 
            style={styles.commentButton}
            onPress={handleCommentSubmit}
          >
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  feedItem: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  feedImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginBottom: 8,
  },
  feedContent: {
    padding: 8,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  feedDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  metaSection: {
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  feedMeta: {
    fontSize: 12,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    marginLeft: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 80,
  },
  commentButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
});

export default FeedItem;