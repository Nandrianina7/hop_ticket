import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
} from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler, State } from 'react-native-gesture-handler';

type Seat = {
  x: number;
  y: number;
  id: string;
  label: string;
  square: boolean;
  status: 'Available' | 'Occupied' | 'Selected' | string;
  category: string | null;
  rotation: number;
};

type TextElement = {
  x: number;
  y: number;
  id: string;
  color: string;
  label: string;
  fontSize: number;
  rotation: number;
  fontWeight: number;
  embraceOffset?: boolean;
  letterSpacing?: number;
};

type Shape = {
  x: number;
  y: number;
  id: string;
  rx: number;
  name: string;
  color: string;   // fill
  width: number;
  height: number;
  stroke: string;
  rotation: number;
};

type Category = {
  id: string;
  name: string;
  color: string;
  textColor: string;
};

type PlanData = {
  name?: string;
  seats?: Seat[];
  text?: TextElement[];
  shapes?: Shape[];
  categories?: Category[];
};

// type Props = {
//   plan: PlanData;                         // Pass your SeatToolkit export (or plan.metadata)
//    onSelectSeats?: (selections: { id: string; status: 'Available' | 'Reserved'; categoryName: string | null }[]) => void;
//   minScale?: number;
//   maxScale?: number;
//   initialScale?: number;
// };

type Props = {
  plan: PlanData;
  onSelectSeats?: (selections: { id: string; status: 'Available' | 'Reserved'; categoryName: string | null; price: number | null }[]) => void;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;

  priceByCategory?: Record<string, number>; // NEW: map category name -> price
};

const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 900;
const SEAT_SIZE = 28;

const VenuePlanViewer: React.FC<Props> = ({
  plan,
  onSelectSeats,
  minScale = 0.35,
  maxScale = 3,
  initialScale = 0.6,
  priceByCategory = {}
}) => {
  const seats = plan.seats ?? [];
  const shapes = plan.shapes ?? [];
  const texts = plan.text ?? [];
  const categories = plan.categories ?? [];

    // Helpers to resolve category name
  const resolveCategoryName = (raw: any): string | null => {
    if (!raw) return null;
    const byName = categories.find(c => c.name === raw);
    if (byName) return byName.name;
    const byId = categories.find(c => c.id === raw);
    return byId?.name ?? String(raw);
  };
const priceFor = (catName: string | null): number | null => {
    if (!catName) return null;
    const key = Object.keys(priceByCategory).find(k => k.toLowerCase() === catName.toLowerCase());
    return key ? priceByCategory[key] ?? null : null;
  };
  const fmt = (n: number | null) => (n == null ? '' : `${n.toLocaleString(undefined, { minimumFractionDigits: 0 })} FCFA`);
  // Compute bounds from shapes + seats
  const { planWidth, planHeight } = useMemo(() => {
    let maxX = 0;
    let maxY = 0;

    for (const s of shapes) {
      maxX = Math.max(maxX, s.x + s.width);
      maxY = Math.max(maxY, s.y + s.height);
    }
    for (const seat of seats) {
      maxX = Math.max(maxX, seat.x + SEAT_SIZE);
      maxY = Math.max(maxY, seat.y + SEAT_SIZE);
    }

    return {
      planWidth: Math.max(maxX + 40, DEFAULT_WIDTH),
      planHeight: Math.max(maxY + 40, DEFAULT_HEIGHT),
    };
  }, [shapes, seats]);

  
  const [selected, setSelected] = useState<string[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, 'Available' | 'Reserved'>>({});
  // const screen = Dimensions.get('window');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });


  // Zoom & Pan
  const initialAutoScale =
  containerSize.width && containerSize.height
    ? Math.min(
        containerSize.width / planWidth,
        containerSize.height / planHeight
      )
    : initialScale;

const scale = useRef(new Animated.Value(initialAutoScale)).current;

// const scale = useRef(new Animated.Value(initialScale)).current;
const translateX = useRef(new Animated.Value(0)).current;
const translateY = useRef(new Animated.Value(0)).current;
const lastTranslate = useRef({ x: 0, y: 0 });
const currentScale = useRef(initialAutoScale);
const effectiveStatus = (seat: Seat): string => statusOverrides[seat.id] ?? (seat.status || 'Available');
// const currentScale = useRef(initialScale);

  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], {
    useNativeDriver: false,
  });

  const onPinchStateChange = (e: any) => {
    if (e.nativeEvent.oldState === State.ACTIVE) {
      const nextScale = clamp(currentScale.current * e.nativeEvent.scale, minScale, maxScale);
      currentScale.current = nextScale;
      scale.setValue(nextScale);
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 2,
        onPanResponderMove: (_, g) => {
          translateX.setValue(lastTranslate.current.x + g.dx);
          translateY.setValue(lastTranslate.current.y + g.dy);
        },
        onPanResponderRelease: (_, g) => {
          lastTranslate.current = {
            x: lastTranslate.current.x + g.dx,
            y: lastTranslate.current.y + g.dy,
          };
        },
      }),
    []
  );

  const toggleSeat = (id: string, disabled: boolean) => {
    if (disabled) return;
    setStatusOverrides((prev: Record<string, 'Available' | 'Reserved'>) => {
      const nextStatus = (prev[id] === 'Reserved' ? 'Available' : 'Reserved') as 'Available' | 'Reserved';
      const nextOverrides: Record<string, 'Available' | 'Reserved'> = { ...prev, [id]: nextStatus };

      setSelected(prevSel => {
        const isReserved = nextStatus === 'Reserved';
        const nextSel = isReserved ? Array.from(new Set([...prevSel, id])) : prevSel.filter(x => x !== id);

        const payload = seats
          .map(s => {
            const status = nextOverrides[s.id] ?? (s.status || 'Available');
            const catName = resolveCategoryName(s.category);
            if (status !== 'Reserved') return null;
            return {
              id: s.id,
              status: 'Reserved' as const,
              categoryName: catName,
              price: priceFor(catName),
            };
          })
          .filter(Boolean) as { id: string; status: 'Reserved'; categoryName: string | null; price: number | null }[];

        onSelectSeats?.(payload);
        return nextSel;
      });

      return nextOverrides;
    });
  };

  const getSeatFill = (seat: Seat) => {
    const status = effectiveStatus(seat).toLowerCase();
    if (status === 'reserved') return '#ff7043';
    if (status === 'occupied') return '#9e9e9e';
    if (seat.category) {
      const c = categories.find(cat => cat.name === seat.category || cat.id === seat.category);
      if (c?.color) return c.color;
    }
    return '#1976d2';
  };

   const getSeatTextColor = (seat: Seat) => {
    const c = categories.find(cat => cat.name === seat.category || cat.id === seat.category);
    return c?.textColor ?? '#fff';
  };


  const resetView = () => {
    currentScale.current = initialScale;
    scale.setValue(initialScale);
    lastTranslate.current = { x: 0, y: 0 };
    translateX.setValue(0);
    translateY.setValue(0);
  };
  

  return (
    <GestureHandlerRootView
  style={[styles.root, { width: '100%', height: '100%' }]}
  onLayout={(e) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  }}
>

      <View style={styles.header}>
        <Text style={styles.title}>{plan.name ?? 'Venue plan'}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.count}>Selected: {selected.length}</Text>
          <TouchableOpacity onPress={resetView} style={styles.resetBtn}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {categories.length > 0 && (
        <View style={styles.legend}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((c) => (
              <View key={c.id} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: c.color }]} />
                <Text style={styles.legendLabel}>{c.name}</Text>
              </View>
            ))}
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: '#9e9e9e' }]} />
              <Text style={styles.legendLabel}>Occupied</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: '#ff7043' }]} />
              <Text style={styles.legendLabel}>Selected</Text>
            </View>
          </ScrollView>
        </View>
      )}

      <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange}>
        <Animated.View  style={[styles.canvasWrap, { width: '100%', height: '100%' }]}
              {...panResponder.panHandlers}>
          <Animated.View
            style={{
              width: planWidth,
              height: planHeight,
              transform: [{ scale }, { translateX }, { translateY }],
              backgroundColor: '#fff',
            }}
          >
            {/* Shapes (e.g., stage) */}
            {shapes.map((s) => (
              <View
                key={s.id}
                style={{
                  position: 'absolute',
                  left: s.x,
                  top: s.y,
                  width: s.width,
                  height: s.height,
                  backgroundColor: s.color,
                  borderColor: s.stroke,
                  borderWidth: 2,
                  borderRadius: s.rx,
                  transform: [{ rotate: `${s.rotation}deg` }],
                }}
              />
            ))}

            {/* Text labels */}
            {texts.map((t) => (
              <View
                key={t.id}
                style={{
                  position: 'absolute',
                  left: t.x,
                  top: t.y - 50,
                  transform: [{ rotate: `${t.rotation}deg` }],
                }}
              >
                <Text
                  style={{
                    color: t.color,
                    fontSize: t.fontSize,
                    fontWeight: String(t.fontWeight) as any,
                    letterSpacing: t.letterSpacing ?? 0,
                  }}
                >
                  {t.label}
                </Text>
              </View>
            ))}

            {/* Seats */}
            {seats.map((seat) => {
           const status = effectiveStatus(seat).toLowerCase();
    const isReserved = status === 'reserved';
    const isOccupied = status.toLowerCase() === 'unavailable';
    const catName = resolveCategoryName(seat.category);
    const price = priceFor(catName);
    return (
      <TouchableOpacity
        key={seat.id}
        activeOpacity={0.8}
        onPress={() => toggleSeat(seat.id, isOccupied)}
        disabled={isOccupied}
        style={{
          position: 'absolute',
          left: seat.x - 14,
          top: seat.y - 14,
          width: 28,
          height: 28,
          borderRadius: seat.square ? 6 : 14,
          backgroundColor: getSeatFill(seat),
          borderWidth: isReserved ? 3 : 1,
          borderColor: isReserved ? '#d32f2f' : '#000',
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ rotate: `${seat.rotation}deg` }],
          opacity: isOccupied ? 0.55 : 1,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{seat.label}</Text>

        {/* Tiny price badge when Reserved (keeps UI compact) */}
        {/* {isReserved && price != null && (
          // <View
          //   style={{
          //     position: 'absolute',
          //     top: -14,
          //     left: '50%',
          //     transform: [{ translateX: -18 }],
          //     backgroundColor: '#111',
          //     paddingHorizontal: 6,
          //     paddingVertical: 2,
          //     borderRadius: 10,
          //   }}
          // >
          //   <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
          //     {fmt(price)}
          //   </Text>
          // </View>
        )} */}
      </TouchableOpacity>
              );
            })}
          </Animated.View>
        </Animated.View>
      </PinchGestureHandler>
    </GestureHandlerRootView>
  );
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const styles = StyleSheet.create({
  root: {
  flex: 1,
  width: '100%',
  height: '100%',
  backgroundColor: '#f5f5f5',
},
canvasWrap: {
  flex: 1,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  justifyContent: 'center',
  alignItems: 'center',
},
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#333' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  count: { color: '#666', fontWeight: '600' },
  resetBtn: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetText: { color: '#fff', fontWeight: '700' },
  legend: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 6,
  },
  legendLabel: { fontSize: 12, color: '#666' },
  // canvasWrap: { flex: 1, overflow: 'hidden' },
});

export default VenuePlanViewer;