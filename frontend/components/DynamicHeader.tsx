// components/DynamicHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface DynamicHeaderProps {
  title: string;
  backgroundColor: string;
  height: Animated.Value | number;
  titleOpacity: Animated.Value | number;
  onBack: () => void;
}

const DynamicHeader: React.FC<DynamicHeaderProps> = ({
  title,
  backgroundColor,
  height,
  titleOpacity,
  onBack,
}) => {
  return (
    <Animated.View style={[styles.header, { height }]}>
      {/* Fond avec flou et couleur */}
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: `${backgroundColor}80` }]} />
      </BlurView>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBack}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </Animated.View>
      
      <View style={styles.headerRight} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 40, // Ajustement pour les encochements
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(95, 75, 75, 0.16)',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
});

export default DynamicHeader;