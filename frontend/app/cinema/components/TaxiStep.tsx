// components/TaxiStep.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TaxiStepProps {
  taxiOption: any;
  setTaxiOption: (option: any) => void;
  theme: any;
}

const TaxiStep: React.FC<TaxiStepProps> = ({ taxiOption, setTaxiOption, theme }) => {
  const options = [
    { type: 'none', label: 'Aucun taxi', price: 0 },
    { type: 'aller', label: 'Aller simple', price: 15 },
    { type: 'retour', label: 'Retour simple', price: 15 },
    { type: 'aller-retour', label: 'Aller-retour', price: 25 },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        Service de taxi
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Choisissez votre option de transport
      </Text>

      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.optionCard,
              { 
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: taxiOption.type === option.type ? theme.colors.primary : 'transparent',
                borderWidth: taxiOption.type === option.type ? 2 : 0,
              }
            ]}
            onPress={() => setTaxiOption(option)}
          >
            <View style={styles.optionHeader}>
              <Text style={[styles.optionLabel, { color: theme.colors.onSurface }]}>
                {option.label}
              </Text>
              {taxiOption.type === option.type && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </View>
            <Text style={[styles.optionPrice, { color: theme.colors.primary }]}>
              {option.price > 0 ? `${option.price} MGA` : 'Gratuit'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TaxiStep;