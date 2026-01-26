// components/PaymentStep.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PaymentStepProps {
  totalPrice: number;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  theme: any;
  taxiOption: any;
  foodItems: any[];
}

const PaymentStep: React.FC<PaymentStepProps> = ({ 
  totalPrice, 
  paymentMethod, 
  setPaymentMethod, 
  theme,
  taxiOption,
  foodItems
}) => {
  const paymentMethods = [
    { id: 'card', name: 'MVOLA', icon: 'card' as const },
    { id: 'paypal', name: 'Airtel Money', icon: 'logo-paypal' as const },
    { id: 'applepay', name: 'Orange Money', icon: 'logo-apple' as const },
  ];

  const foodPrice = foodItems.reduce((total, item) => 
    total + ((item.price_at_time || item.price) * item.quantity), 0);

   const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        Paiement
      </Text>
      {/* <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Choisissez votre méthode de paiement
      </Text> */}

      {/* <View style={styles.paymentMethods}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              { 
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: paymentMethod === method.id ? theme.colors.primary : 'transparent',
                borderWidth: paymentMethod === method.id ? 2 : 0,
              }
            ]}
            onPress={() => { setPaymentMethod(method.id); router.push("/MvolaPage"); }}
          >
            <Ionicons 
              name={method.icon} 
              size={24} 
              color={paymentMethod === method.id ? theme.colors.primary : theme.colors.onSurfaceVariant} 
            />
            <Text style={[
              styles.methodName,
              { color: paymentMethod === method.id ? theme.colors.primary : theme.colors.onSurfaceVariant }
            ]}>
              {method.name}
            </Text>
            {paymentMethod === method.id && (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View> */}

      <View style={[styles.summary, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>
          Récapitulatif de commande
        </Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.onSurface }]}>
            Places de cinéma
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
            {totalPrice.toFixed(2)} MGA
          </Text>
        </View>
        {/* <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.onSurface }]}>
            Service taxi
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
            {taxiOption.price.toFixed(2)} MGA
          </Text>
        </View> */}
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.onSurface }]}>
            Restauration ({foodItems.reduce((total, item) => total + item.quantity, 0)} article{foodItems.reduce((total, item) => total + item.quantity, 0) > 1 ? 's' : ''})
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
            {foodPrice.toFixed(2)} MGA
          </Text>
        </View>
        <View style={[styles.totalRow, { borderTopColor: theme.colors.outline }]}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
            Total
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
            {(totalPrice + taxiOption.price + foodPrice).toFixed(2)} MGA
          </Text>
        </View>
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
  paymentMethods: {
    gap: 16,
    marginBottom: 24,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  summary: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentStep;