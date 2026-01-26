import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Card, useTheme } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../app/_layout'; // Import du hook de thème

type EventCardProps = {
  id: number;
  title: string;
  image_url?: string;
  venue?: string;
  date?: string;
  average_rating?: number;
  is_liked?: boolean;
  likes_count?: number;
  isLarge?: boolean;
  onPress?: () => void;
  onLikePress?: (eventId: number) => void;
};

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  image_url,
  venue,
  date,
  average_rating,
  is_liked,
  likes_count,
  isLarge = false,
  onPress,
  onLikePress
}) => {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const theme = useTheme();

  const handlePress = () => {
    if (onPress) onPress();
    else router.push(`/event/${id}`);
  };

  const handleLikePress = (e: any) => {
    e.stopPropagation();
    if (onLikePress) onLikePress(id);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.card}>
      {/* Image */}
      <View style={styles.imageWrapper}>
        {image_url ? (
          <Image source={{ uri: image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>NO IMAGE</Text>
          </View>
        )}

        {/* Like button */}
        {likes_count !== undefined && (
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLikePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={is_liked ? 'heart' : 'heart-outline'}
              size={20}
              color={is_liked ? '#E91E63' : '#fff'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Date */}
        {date && <Text style={styles.date}>{formatDate(date)}</Text>}

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          {venue && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {venue}
              </Text>
            </View>
          )}

          {average_rating !== undefined && (
            <View style={styles.detailRow}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.detailText}>{average_rating.toFixed(1)}</Text>
            </View>
          )}

          {likes_count !== undefined && (
            <Text style={styles.likesText}>{likes_count} j’aime</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 220,
  },
  placeholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontWeight: '600',
  },
  likeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 6,
  },
  content: {
    paddingVertical: 10,
  },
  date: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#111',
    marginBottom: 8,
  },
  descriptionContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 4,
    flexShrink: 1,
  },
  likesText: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
});

export default EventCard;