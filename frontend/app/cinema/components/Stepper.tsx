// components/Stepper.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface StepperProps {
  currentStep: number;
  steps: string[];
  theme: any;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps, theme }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            { 
              backgroundColor: index <= currentStep ? theme.colors.primary : theme.colors.surfaceVariant,
              borderColor: index <= currentStep ? theme.colors.primary : theme.colors.outline
            }
          ]}>
            <Text style={[
              styles.stepNumber,
              { color: index <= currentStep ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }
            ]}>
              {index + 1}
            </Text>
          </View>
          <Text style={[
            styles.stepLabel,
            { color: index <= currentStep ? theme.colors.primary : theme.colors.onSurfaceVariant }
          ]}>
            {step}
          </Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.connector,
              { backgroundColor: index < currentStep ? theme.colors.primary : theme.colors.outline }
            ]} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
    textAlign: 'center',
  },
  connector: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    zIndex: 1,
  },
});

export default Stepper;