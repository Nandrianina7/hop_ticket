// components/GenreBadges.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GenreBadgesProps {
  genres: string;
}

const GenreBadges: React.FC<GenreBadgesProps> = ({ genres }) => {
  if (!genres) return null;

  const genreList = genres.split(',').map(g => g.trim()).filter(g => g.length > 0);

  return (
    <View style={styles.container}>
      {genreList.map((genre, index) => (
        <View key={index} style={styles.badge}>
          <Text style={styles.badgeText}>{genre}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  badgeText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default GenreBadges;