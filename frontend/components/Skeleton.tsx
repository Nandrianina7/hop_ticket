// components/Skeleton.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
};

export const Skeleton = ({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) => {
  return (
    <Animatable.View
      animation="pulse"
      duration={0}
      iterationCount="infinite"
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        style
      ]}
    />
  );
};

export const EventCardSkeleton = ({ isLarge = false }: { isLarge?: boolean }) => {
  const cardWidth = isLarge ? width * 0.65 : (width - 48) / 2;
  const imageHeight = isLarge ? 180 : 140;

  return (
    <View style={[styles.cardContainer, { width: cardWidth }]}>
      <Skeleton width="100%" height={imageHeight} borderRadius={12} />
      <View style={styles.content}>
        <Skeleton width="80%" height={16} borderRadius={4} />
        <View style={styles.bottomRow}>
          <Skeleton width="60%" height={14} borderRadius={4} />
          <Skeleton width="30%" height={14} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

export const GridSkeleton = () => {
  const cardWidth = (width - 48) / 2;

  return (
    <View style={[styles.cardContainer, { width: cardWidth, marginBottom: 16 }]}>
      <Skeleton width="100%" height={140} borderRadius={12} />
      <View style={styles.content}>
        <Skeleton width="80%" height={16} borderRadius={4} />
        <View style={styles.bottomRow}>
          <Skeleton width="60%" height={14} borderRadius={4} />
          <Skeleton width="30%" height={14} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e1e1e1',
    overflow: 'hidden',
  },
  cardContainer: {
    marginBottom: 12,
  },
  content: {
    padding: 12,
    gap: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Skeleton;