// components/RatingStars.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingStarsProps {
  rating: number;
  size?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating / 2);
  const hasHalfStar = rating % 2 >= 1;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {[...Array(fullStars)].map((_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={size} color="#FFD700" />
        ))}
        {hasHalfStar && (
          <Ionicons name="star-half" size={size} color="#FFD700" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#FFD700" />
        ))}
      </View>
      <Text style={[styles.ratingValue, { fontSize: size }]}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingValue: {
    color: '#666',
    fontWeight: '600',
  },
});

export default RatingStars;