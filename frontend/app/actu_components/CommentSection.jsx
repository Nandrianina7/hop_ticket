import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchComments, likeComment } from '../../utils/api';
import { useAppTheme } from '../_layout'; // Import du hook pour le thème

const CommentItem = ({ comment, onLike, onReply }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { isDark } = useAppTheme(); // Récupération de l'état du thème

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      await onLike(comment.id);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
    setIsLiking(false);
  };

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplies(false);
    }
  };

  // Styles dynamiques basés sur le thème
  const dynamicStyles = {
    commentItem: {
      backgroundColor: isDark ? '#2a2a2a' : '#f9f9f9',
    },
    commentAuthor: {
      color: isDark ? '#fff' : '#333',
    },
    commentDate: {
      color: isDark ? '#999' : '#888',
    },
    commentContent: {
      color: isDark ? '#ccc' : '#333',
    },
    likeCount: {
      color: isDark ? '#999' : '#666',
    },
    replyText: {
      color: isDark ? '#4a90e2' : '#007AFF',
    },
    replyInputContainer: {
      backgroundColor: isDark ? '#333' : '#fff',
      borderColor: isDark ? '#444' : '#ddd',
    },
    replyInput: {
      color: isDark ? '#fff' : '#000',
    },
  };

  return (
    <View style={[styles.commentItem, dynamicStyles.commentItem]}>
      <View style={styles.commentHeaderRow}>
        <Text style={[styles.commentAuthor, dynamicStyles.commentAuthor]}>
          {comment.user?.first_name} {comment.user?.last_name}
        </Text>
        <Text style={[styles.commentDate, dynamicStyles.commentDate]}>
          {new Date(comment.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={[styles.commentContent, dynamicStyles.commentContent]}>{comment.content}</Text>
      
      <View style={styles.commentActions}>
        <TouchableOpacity onPress={handleLike} disabled={isLiking}>
          <MaterialCommunityIcons
            name={comment.user_liked ? 'heart' : 'heart-outline'}
            size={16}
            color={comment.user_liked ? '#ff375f' : (isDark ? '#999' : '#666')}
          />
        </TouchableOpacity>
        <Text style={[styles.likeCount, dynamicStyles.likeCount]}>{comment.likes_count}</Text>
        
        <TouchableOpacity 
          style={styles.replyButton}
          onPress={() => setShowReplies(!showReplies)}
        >
          <Text style={[styles.replyText, dynamicStyles.replyText]}>Répondre</Text>
        </TouchableOpacity>
      </View>

      {showReplies && (
        <View style={[styles.replyInputContainer, dynamicStyles.replyInputContainer]}>
          <TextInput
            style={[styles.replyInput, dynamicStyles.replyInput]}
            placeholder="Écrivez une réponse..."
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity 
            style={styles.replySubmitButton}
            onPress={handleReplySubmit}
          >
            <MaterialCommunityIcons name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const CommentSection = ({ itemId, itemType, onComment, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useAppTheme(); // Récupération de l'état du thème

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const commentsData = await fetchComments(itemId, itemType);
      // Trier les commentaires par nombre de likes (les plus pertinents en premier)
      const sortedComments = commentsData.sort((a, b) => b.likes_count - a.likes_count);
      setComments(sortedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [itemId, itemType]);

  const handleLikeComment = async (commentId) => {
    try {
      await likeComment(commentId);
      // Recharger les commentaires après like
      loadComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    try {
      await onComment(itemId, itemType, content, parentCommentId);
      // Recharger les commentaires après réponse
      loadComments();
    } catch (error) {
      console.error('Error replying to comment:', error);
    }
  };

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Styles dynamiques basés sur le thème
  const dynamicStyles = {
    commentSection: {
      borderTopColor: isDark ? '#333' : '#eee',
    },
    commentSectionTitle: {
      color: isDark ? '#fff' : '#333',
    },
    loadingText: {
      color: isDark ? '#ccc' : '#666',
    },
    noCommentsText: {
      color: isDark ? '#999' : '#888',
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={isDark ? '#4a90e2' : '#007AFF'} />
        <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Chargement des commentaires...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.commentSection, dynamicStyles.commentSection]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.commentSectionTitle, dynamicStyles.commentSectionTitle]}>Commentaires</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={20} color={isDark ? '#ccc' : '#666'} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            onLike={handleLikeComment}
            onReply={handleReply}
          />
        )}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadComments}
            colors={[isDark ? '#4a90e2' : '#007AFF']}
            tintColor={isDark ? '#4a90e2' : '#007AFF'}
          />
        }
        ListEmptyComponent={
          <Text style={[styles.noCommentsText, dynamicStyles.noCommentsText]}>Aucun commentaire pour le moment</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  commentSection: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 8,
  },
  noCommentsText: {
    textAlign: 'center',
    padding: 20,
  },
  commentItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 12,
  },
  commentContent: {
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 12,
    marginLeft: 4,
    marginRight: 12,
  },
  replyButton: {
    marginLeft: 'auto',
  },
  replyText: {
    fontSize: 12,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  replyInput: {
    flex: 1,
    fontSize: 12,
    maxHeight: 60,
  },
  replySubmitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 6,
    marginLeft: 4,
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#eee',
    paddingLeft: 8,
  },
});

export default CommentSection;