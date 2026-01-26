// components/LegendSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface LegendSectionProps {
  theme: any;
  isDark?: boolean;
}

const LegendSection: React.FC<LegendSectionProps> = ({ theme }) => {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendIcon, { backgroundColor: theme.colors.surfaceVariant }]} />
        <Text style={[styles.legendText, { color: theme.colors.onBackground }]}>Disponible</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendIcon, { backgroundColor: theme.colors.primary }]} />
        <Text style={[styles.legendText, { color: theme.colors.onBackground }]}>Sélectionné</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendIcon, { backgroundColor: '#119fe0ff' }]} />
        <Text style={[styles.legendText, { color: theme.colors.onBackground }]}>VIP</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendIcon, { backgroundColor: '#FF6B35' }]} />
        <Text style={[styles.legendText, { color: theme.colors.onBackground }]}>Réservé</Text>
      </View>
      {/* SUPPRIMER LA LÉGENDE POUR INDISPONIBLE */}
    </View>
  );
};

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 8,
  },
  legendIcon: { 
    width: 20, 
    height: 20, 
    borderRadius: 4, 
    marginRight: 8,
  },
  legendText: { 
    fontSize: 12 
  },
});

export default LegendSection;