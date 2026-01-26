// components/VenuePlanImage.tsx
'use client';
import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';

type VenuePlan = {
  id: number;
  site_name: string;
  elements: any[];
  metadata: any;
  created_at: string;
};

type VenuePlanImageProps = {
  plan: VenuePlan;
  onPress?: () => void;
};

const VenuePlanImage: React.FC<VenuePlanImageProps> = ({ plan, onPress }) => {
  const cardWidth = Dimensions.get('window').width - 40;
  const imageSize = cardWidth - 40;
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const toggleSeatSelection = (seatId: string) => {
  setSelectedSeats((prev) =>
    prev.includes(seatId)
      ? prev.filter((id) => id !== seatId)
      : [...prev, seatId]
  );
};



  const renderPlanVisual = () => {
    if (!plan.elements || plan.elements.length === 0) return null;

    return (
      <View style={[styles.planImageContainer, { width: imageSize, height: imageSize }]}>
        <View style={styles.planBackground}>
          {plan.elements.map((element, index) => {
            const scale = imageSize / (plan.metadata?.stageSize?.width || 800);
            
            let left = (element.x || 0) * scale;
            let top = (element.y || 0) * scale;
            let width = (element.width || element.radius * 2 || 40) * scale;
            let height = (element.height || element.radius * 2 || 40) * scale;

            // Ajustement pour les cercles
            if (element.type === 'circle') {
              left = (element.x - element.radius) * scale;
              top = (element.y - element.radius) * scale;
            }

            // Couleurs selon le type d'élément
            let backgroundColor = '#1976d2';
            if (element.type === 'table') backgroundColor = '#9c27b0';
            if (element.type === 'entrance') backgroundColor = '#4caf50';
            if (element.type === 'rectangle') backgroundColor = '#ff9800';
            if (element.type === 'circle') backgroundColor = '#2e7d32';
            if (element.type === 'restroom') backgroundColor = '#ff9800';
            if (element.type === 'text') backgroundColor = 'transparent';

            // Style de base pour tous les éléments
            const elementStyle = {
              position: 'absolute' as 'absolute',
              left,
              top,
              width: element.type === 'circle' ? width : Math.max(width, 8),
              height: element.type === 'circle' ? height : Math.max(height, 8),
              backgroundColor: element.type === 'text' ? 'transparent' : backgroundColor,
              borderRadius: element.type === 'circle' ? width / 2 : 4,
              borderWidth: element.type === 'text' ? 0 : 2,
              borderColor: element.stroke || '#000',
              opacity: 0.8,
              justifyContent: 'center' as 'center',
              alignItems: 'center' as 'center',
            };

            if (element.type === 'seat') {
            const isSelected = selectedSeats.includes(element.id);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    elementStyle,
                    {
                      backgroundColor: isSelected ? '#ff5722' : element.fill || '#1976d2',
                      borderColor: isSelected ? '#d32f2f' : element.stroke || '#000',
                      opacity: isSelected ? 1 : 0.8,
                    },
                  ]}
                  onPress={() => toggleSeatSelection(element.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 12 * scale,
                    }}
                  >
                    {element.label}
                  </Text>
                </TouchableOpacity>
              );
            }

            // Pour les rectangles avec texte, afficher le rectangle ET le texte à l'intérieur
            if ((element.type === 'rectangle' || element.type === 'text') && (element.text || element.label)) {
              return (
                <View key={index} style={elementStyle}>
                  {/* Rectangle de fond */}
                  {element.type === 'rectangle' && (
                    <View 
                      style={[
                        StyleSheet.absoluteFill,
                        {
                          backgroundColor,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: element.stroke || '#000',
                          opacity: 0.8,
                        }
                      ]} 
                    />
                  )}
                  
                  {/* Texte au centre */}
                  <Text 
                    style={[
                      styles.planText,
                      { 
                        fontSize: (element.fontSize || 14) * scale * 0.8,
                        color: element.fill || '#000',
                        textAlign: 'center',
                        paddingHorizontal: 4,
                      }
                    ]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                  >
                    {element.text || element.label}
                  </Text>
                </View>
              );
            }

            // Pour les autres éléments sans texte
            return (
              <View key={index} style={elementStyle}>
                {element.type === 'entrance' && (
                  <Text style={[styles.planText, { fontSize: 10 * scale, color: '#fff' }]}>
                    Entrée
                  </Text>
                )}
                {element.type === 'restroom' && (
                  <Text style={[styles.planText, { fontSize: 10 * scale, color: '#fff' }]}>
                    WC
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const content = renderPlanVisual();

  if (onPress) {
    return (
      <TouchableOpacity 
        style={styles.venuePlanImageWrapper}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
        <View style={styles.overlayHint}>
          <Text style={styles.overlayHintText}>Appuyez pour agrandir</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.venuePlanImageWrapper}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  venuePlanImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  planImageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  planBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  planText: {
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  overlayHint: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  overlayHintText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default VenuePlanImage;