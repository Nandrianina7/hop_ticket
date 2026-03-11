import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Divider, Button } from 'react-native-paper';

type SeatBillItem = {
  id: string | number;
  categoryName?: string;
  label?: string;
  row?: string | number;
  number?: string | number;
  price?: string | number;
  status?: string;
  tier?: string;
};

type Props = {
  seats: SeatBillItem[];
  currency?: string;
  feeRate?: number;
  taxRate?: number;
  onCheckout?: () => void;
  showSeatList?: boolean;
  priceTiers?: [];
};

const toNumber = (v: unknown) => {
  if (v === undefined || v === null) return 0;
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : 0;
  return Number.isFinite(n) ? n : 0;
};

const SelectedSeatsBill: React.FC<Props> = ({
  seats,
  currency = 'MGA',
  feeRate = 0,
  taxRate = 0,
  onCheckout,
  showSeatList = true,
}) => {
  if (!seats || seats.length === 0) return null;

  // Group by categoryName and keep seat list per group (no hooks)
  const groupMap = new Map<string, { count: number; total: number; seats: SeatBillItem[] }>();
  for (const s of seats) {
    const key = s.categoryName ?? 'Inconnu';
    const price = toNumber(s.price);
    const agg = groupMap.get(key) ?? { count: 0, total: 0, seats: [] };
    agg.count += 1;
    agg.total += price;
    agg.seats.push(s);
    groupMap.set(key, agg);
  }

  const groups = Array.from(groupMap.entries()).map(([category, g]) => ({
    category,
    count: g.count,
    total: g.total,
    seats: g.seats,
  }));

  const subtotal = groups.reduce((acc, g) => acc + g.total, 0);
  const fees = subtotal * (feeRate || 0);
  const tax = subtotal * (taxRate || 0);
  const total = subtotal + fees + tax;

  // Avoid Intl hooks; create formatter per render
  const nf = new Intl.NumberFormat('fr-FR', { style: 'currency', currency });

  return (
    <Card style={styles.card} elevation={3}>
      <Card.Title title="Récapitulatif des places" />
      <Card.Content>
        {groups.map((g) => (
          <View key={g.category} style={{ marginBottom: 8 }}>
            <View style={styles.row}>
              <Text style={styles.seatText}>{`${g.category} × ${g.count}`}</Text>
              <Text style={styles.priceText}>{nf.format(g.total)}</Text>
            </View>

            {showSeatList && (
              <View style={styles.seatList}>
                {g.seats.map((s) => (
                  <View key={String(s.id)} style={styles.seatLine}>
                    <Text
                      style={styles.seatLabel}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {(s.label ?? '')}
                      {s.row !== undefined ? `-${s.row}` : ''}
                      {s.number !== undefined ? `- ${s.number}` : ''}
                      
                    </Text>
                    <Text style={styles.muted}>{nf.format(toNumber(s.price))}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <Divider style={styles.divider} />

        {feeRate > 0 && (
          <View style={styles.row}>
            <Text style={styles.muted}>Frais ({Math.round(feeRate * 100)}%)</Text>
            <Text>{nf.format(fees)}</Text>
          </View>
        )}
        {taxRate > 0 && (
          <View style={styles.row}>
            <Text style={styles.muted}>Taxes ({Math.round(taxRate * 100)}%)</Text>
            <Text>{nf.format(tax)}</Text>
          </View>
        )}

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{nf.format(total)}</Text>
        </View>
      </Card.Content>

      {onCheckout && (
        <Card.Actions>
          <Button mode="contained" icon="cart" onPress={onCheckout}>
            Continuer
          </Button>
        </Card.Actions>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, marginTop: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  seatText: { fontWeight: '600', color: '#2c3e50' },
  priceText: { fontWeight: '600' },
  divider: { marginVertical: 10 },
  muted: { color: '#7f8c8d' },
  totalRow: { marginTop: 4 },
  totalLabel: { fontWeight: '700', fontSize: 16 },
  totalAmount: { fontWeight: '700', fontSize: 16 },
  seatList: { marginTop: 4, gap: 2 },
  seatLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  seatLabel: { color: '#7f8c8d', flexShrink: 1, flex: 1, minWidth: 0, marginRight: 8 },
});

export default SelectedSeatsBill;