// components/SeatGrid.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import { Theme } from 'react-native-paper';
import { MD3Theme } from 'react-native-paper';

const { width } = Dimensions.get('window');

interface Seat {
  id: number | string;
  rows: string;
  cols: string;
  is_available: boolean;
  is_vip?: boolean;
  is_disabled?: boolean;
  is_reserved?: boolean;
}

interface SeatGridProps {
  seats: Seat[];
  selectedSeats: string[]; // ids en string
  onSeatSelect: (seatId: string) => void;
  // theme: Theme;
   theme: MD3Theme;
  loading?: boolean;
  basePrice?: number;
}

const SeatGrid: React.FC<SeatGridProps> = ({
  seats,
  selectedSeats,
  onSeatSelect,
  theme,
  loading = false,
  basePrice = 0,
}) => {
  const getSeatSize = () => {
    if (width < 375) return 28;
    if (width < 414) return 32;
    return 36;
  };
  const seatSize = getSeatSize();
  const seatFontSize = seatSize * 0.35;

  // Couleurs fixes pour éviter dépendance totale au thème
  const COLORS = {
    reservedBg: '#FF6B35',
    reservedText: '#FFFFFF',
    vipBg: '#119fe0ff',
    primaryBg: (theme.colors as any).primary ?? '#1976D2',
    primaryText: (theme.colors as any).onPrimary ?? '#FFFFFF',
    availableBg: (theme.colors as any).surfaceVariant ?? '#f2f2f2',
    availableText: (theme.colors as any).onSurfaceVariant ?? '#444444',
    unavailableBg: 'transparent',
    unavailableBorder: '#999999',
    unavailableText: '#9E9E9E',
  };

  const [selectingSeats, setSelectingSeats] = useState<Set<string>>(new Set());

  const organizeSeatsByRows = () => {
    const rows: { [key: string]: Seat[] } = {};
    seats.forEach((seat) => {
      if (!rows[seat.rows]) rows[seat.rows] = [];
      rows[seat.rows].push(seat);
    });
    return Object.keys(rows)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((row) => ({
        row,
        seats: rows[row].sort((a, b) => parseInt(a.cols) - parseInt(b.cols)),
      }));
  };

  const handleSeatPress = (seat: Seat) => {
    const idStr = String(seat.id);
    // Bloquer si en cours de sélection ou indisponible ou réservé
    if (selectingSeats.has(idStr) || !seat.is_available || seat.is_disabled || seat.is_reserved) return;

    setSelectingSeats((p) => new Set(p).add(idStr));
    try {
      onSeatSelect(idStr);
    } catch (err) {
      console.error('select seat error:', err);
    } finally {
      setTimeout(() => {
        setSelectingSeats((p) => {
          const s = new Set(p);
          s.delete(idStr);
          return s;
        });
      }, 300);
    }
  };

  const organized = organizeSeatsByRows();

  const getLabel = (row: string, col: string) => {
    const rowLetter = String.fromCharCode(65 + parseInt(row));
    return `${rowLetter}${parseInt(col) + 1}`;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { padding: 20 }]}>
        <ActivityIndicator size="large" color={COLORS.primaryBg} />
        <Text style={[styles.loadingText, { color: COLORS.availableText }]}>Chargement des sièges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* header prix */}
      <View style={[styles.pricesHeader, { backgroundColor: (theme.colors as any).surface ?? '#fff' }]}>
        <View style={styles.priceInfo}>
          <View style={[styles.priceIndicator, { backgroundColor: COLORS.availableBg }]} />
          <View>
            <Text style={[styles.priceLabel, { color: (theme.colors as any).onSurface }]}>Standard</Text>
            <Text style={[styles.priceValue, { color: COLORS.primaryBg }]}>{Number(basePrice).toFixed(2)} MGA</Text>
          </View>
        </View>
        <View style={styles.priceInfo}>
          <View style={[styles.priceIndicator, { backgroundColor: COLORS.vipBg }]} />
          <View>
            <Text style={[styles.priceLabel, { color: (theme.colors as any).onSurface }]}>VIP</Text>
            <Text style={[styles.priceValue, { color: COLORS.primaryBg }]}>{(Number(basePrice) * 1.5).toFixed(2)} MGA</Text>
          </View>
        </View>
      </View>

      {/* grille */}
      <View style={styles.center}>
        <View style={styles.grid}>
          {organized.map((rowData) => (
            <View key={rowData.row} style={styles.row}>
              <Text style={[styles.rowLabel, { color: (theme.colors as any).onBackground ?? '#000' }]}>
                {String.fromCharCode(65 + parseInt(rowData.row))}
              </Text>

              <View style={styles.rowSeats}>
                {rowData.seats.map((seat) => {
                  const idStr = String(seat.id);
                  const isDisabled = !!seat.is_disabled;

                  // Si le siège est désactivé, afficher un espace vide
                  if (isDisabled) {
                    return (
                      <View
                        key={idStr}
                        style={[
                          styles.seat,
                          {
                            width: seatSize,
                            height: seatSize,
                            backgroundColor: 'transparent',
                          },
                        ]}
                      />
                    );
                  }

                  const isSelecting = selectingSeats.has(idStr);
                  const isSelected = selectedSeats.includes(idStr);
                  const isAvailable = !!seat.is_available;
                  const isReserved = !!seat.is_reserved || 
                  (!seat.is_available && !seat.is_disabled && !selectedSeats.includes(idStr));

                  // PRIORITÉ RENDU: reserved > selected > vip > available
                  let bg = COLORS.availableBg;
                  let txt = COLORS.availableText;
                  let bColor = 'transparent';
                  let bWidth = 1;

                  if (isReserved) {
                    bg = COLORS.reservedBg;
                    txt = COLORS.reservedText;
                    bColor = '#E55A2E';
                    bWidth = 2;
                  } else if (isSelected) {
                    bg = COLORS.primaryBg;
                    txt = COLORS.primaryText;
                    bColor = COLORS.primaryBg;
                    bWidth = 1;
                  } else if (seat.is_vip) {
                    bg = COLORS.vipBg;
                    txt = COLORS.primaryText;
                    bColor = '#0D8BC7';
                    bWidth = 1;
                  }

                  return (
                    <TouchableOpacity
                      key={idStr}
                      onPress={() => handleSeatPress(seat)}
                      disabled={isSelecting || isReserved}
                      activeOpacity={0.85}
                      style={[
                        styles.seat,
                        {
                          width: seatSize,
                          height: seatSize,
                          backgroundColor: bg,
                          borderColor: bColor,
                          borderWidth: bWidth,
                        },
                      ]}
                    >
                      {isSelecting ? (
                        <ActivityIndicator size="small" color={txt} />
                      ) : (
                        <>
                          {/* === icone uniquement pour les réservés === */}
                          {isReserved ? (
                            <MaterialIcons name="bookmark" size={Math.round(seatSize * 0.45)} color={COLORS.reservedText} />
                          ) : null}

                          {/* Label toujours affiché */}
                          <Text
                            style={[
                              styles.seatText,
                              { color: txt, fontSize: seatFontSize },
                              isReserved && styles.bold,
                              // si réservé on met marginTop pour espacer du bookmark
                              isReserved ? { marginTop: 4 } : undefined,
                            ]}
                          >
                            {getLabel(rowData.row, seat.cols)}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* légende - removed "Indisponible" since disabled seats are now empty */}
      <View style={[styles.legend, { backgroundColor: (theme.colors as any).surface ?? '#fff' }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.availableBg }]} />
          <Text style={styles.legendText}>Disponible</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.vipBg }]} />
          <Text style={styles.legendText}>VIP</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.primaryBg }]} />
          <Text style={styles.legendText}>Sélectionné</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.reservedBg }]} />
          <Text style={styles.legendText}>Réservé</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 16, fontSize: 16 },
  pricesHeader: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, borderRadius: 12, marginBottom: 20 },
  priceInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceIndicator: { width: 20, height: 20, borderRadius: 4 },
  priceLabel: { fontSize: 14, fontWeight: '500' },
  priceValue: { fontSize: 16, fontWeight: 'bold' },

  center: { alignItems: 'center', justifyContent: 'center' },
  grid: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowLabel: { width: 30, textAlign: 'center', marginRight: 8, fontWeight: '600' },
  rowSeats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },

  seat: { borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 4, marginBottom: 4 },
  seatText: { fontWeight: '700' },
  bold: { fontWeight: '900' },

  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', padding: 12, borderRadius: 12, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  legendBox: { width: 16, height: 16, borderRadius: 4, marginRight: 8, borderWidth: 1, borderColor: '#CCC' },
  legendText: { fontSize: 12, fontWeight: '500' },
});

export default SeatGrid;