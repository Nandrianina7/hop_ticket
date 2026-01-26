import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

type Tier = { id: number; tier_type: string; price: number; available_quantity: number };
type Category = { id: string; name: string; color: string; textColor?: string };
type LabelItem = { id: string; name: string; color?: string; textColor?: string; x: number; y: number; width: number; height: number; rotation: number; type: string; seats: any[] };

type Props = {
  tiers: Tier[];
  categories?: Category[]; // optional: to display color dots by category name
};



const PriceLegendCompact: React.FC<Props> = ({ tiers, categories = [] }) => {
  const fmt = (n: number) => `${n.toLocaleString(undefined, { minimumFractionDigits: 0 })} MGA`;

  
  



  const colorFor = (name: string) => {
    const c = categories.find(cat => cat.name?.toLowerCase() === name?.toLowerCase());
    return c?.color ?? '#999';
  };

    useEffect(() => {
      console.log(categories)
    }, []);
  

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {tiers.map(t => (
        <View key={t.id} style={styles.chip}>
          <View style={[styles.dot, { backgroundColor: colorFor(t.tier_type) }]} />
          <Text style={styles.text}>{t.tier_type} • {fmt(t.price)}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { paddingVertical: 6, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f2f3f5',
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6, borderWidth: 1, borderColor: '#0003' },
  text: { fontSize: 12, color: '#334', fontWeight: '600' },
});

export default PriceLegendCompact;