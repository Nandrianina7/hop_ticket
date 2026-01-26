// app/event/venue-plan-fullscreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type VenuePlan = {
  id: number;
  site_name: string;
  elements: any[];
  metadata: any;
  created_at: string;
};

const VenuePlanFullscreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const plan: VenuePlan = params.plan ? JSON.parse(params.plan as string) : null;
  const [scale, setScale] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);

  if (!plan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Plan non disponible</Text>
      </SafeAreaView>
    );
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1));
  };

  const resetZoom = () => {
    setScale(1);
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  const renderPlanElements = () => {
    if (!plan.elements || plan.elements.length === 0) {
      return (
        <View style={styles.noElements}>
          <Text style={styles.noElementsText}>Aucun élément dans ce plan</Text>
        </View>
      );
    }

    const baseSize = Math.min(screenWidth, screenHeight) * 1.5 * scale;
    const scaleFactor = baseSize / (plan.metadata?.stageSize?.width || 800);

    return plan.elements.map((element, index) => {
      let left = (element.x || 0) * scaleFactor;
      let top = (element.y || 0) * scaleFactor;
      let width = (element.width || element.radius * 2 || 40) * scaleFactor;
      let height = (element.height || element.radius * 2 || 40) * scaleFactor;

      // Ajustement pour les cercles
      if (element.type === 'circle') {
        left = (element.x - element.radius) * scaleFactor;
        top = (element.y - element.radius) * scaleFactor;
      }

      // Couleurs selon le type d'élément
      let backgroundColor = '#1976d2';
      if (element.type === 'table') backgroundColor = '#9c27b0';
      if (element.type === 'entrance') backgroundColor = '#4caf50';
      if (element.type === 'rectangle') backgroundColor = '#ff9800';
      if (element.type === 'circle') backgroundColor = '#2e7d32';
      if (element.type === 'restroom') backgroundColor = '#ff9800';
      if (element.type === 'text') backgroundColor = 'transparent';

      const elementStyle = {
        position: 'absolute' as 'absolute',
        left,
        top,
        width: element.type === 'circle' ? width : Math.max(width, 15),
        height: element.type === 'circle' ? height : Math.max(height, 15),
        backgroundColor: element.type === 'text' ? 'transparent' : backgroundColor,
        borderRadius: element.type === 'circle' ? width / 2 : 6,
        borderWidth: element.type === 'text' ? 0 : 3,
        borderColor: element.stroke || '#000',
        justifyContent: 'center' as 'center',
        alignItems: 'center' as 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      };

      // Pour les éléments avec texte
      if ((element.type === 'rectangle' || element.type === 'text') && (element.text || element.label)) {
        return (
          <View key={index} style={elementStyle}>
            {element.type === 'rectangle' && (
              <View 
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor,
                    borderRadius: 6,
                    borderWidth: 3,
                    borderColor: element.stroke || '#000',
                  }
                ]} 
              />
            )}
            
            <Text 
              style={[
                styles.fullscreenPlanText,
                { 
                  fontSize: (element.fontSize || 16) * scaleFactor * 0.8,
                  color: element.fill || '#000',
                  textAlign: 'center',
                  paddingHorizontal: 8,
                }
              ]}
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              {element.text || element.label}
            </Text>
          </View>
        );
      }

      // Pour les autres éléments
      return (
        <View key={index} style={elementStyle}>
          {element.type === 'entrance' && (
            <Text style={[styles.fullscreenPlanText, { fontSize: 14 * scaleFactor, color: '#fff' }]}>
              Entrée
            </Text>
          )}
          {element.type === 'restroom' && (
            <Text style={[styles.fullscreenPlanText, { fontSize: 14 * scaleFactor, color: '#fff' }]}>
              WC
            </Text>
          )}
        </View>
      );
    });
  };

  const planWidth = Math.min(screenWidth, screenHeight) * 1.5 * scale;
  const planHeight = Math.min(screenWidth, screenHeight) * 1.5 * scale;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {plan.site_name || 'Plan de Salle'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={zoomOut}
            disabled={scale <= 1}
          >
            <Ionicons name="remove" size={20} color={scale <= 1 ? '#666' : '#fff'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={resetZoom}
          >
            <Text style={styles.zoomText}>{Math.round(scale * 100)}%</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={zoomIn}
            disabled={scale >= 3}
          >
            <Ionicons name="add" size={20} color={scale >= 3 ? '#666' : '#fff'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Plan avec scroll */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        maximumZoomScale={3}
        minimumZoomScale={1}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
      >
        <View style={[styles.planContainer, { width: planWidth, height: planHeight }]}>
          {renderPlanElements()}
        </View>
      </ScrollView>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Utilisez les boutons +/- pour zoomer • Glissez pour naviguer
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 8,
  },
  zoomText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: screenHeight - 150,
  },
  planContainer: {
    backgroundColor: '#2d2d2d',
    position: 'relative',
    margin: 20,
  },
  fullscreenPlanText: {
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  noElements: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noElementsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  instructions: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  instructionsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default VenuePlanFullscreen;