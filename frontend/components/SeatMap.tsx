// SeatingMap.tsx
import React, { useMemo, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import SeatItem, { SeatState } from "./SeatItem";
import { Seat, SeatingLayout, Section } from "./type";
import SectionItem from "./SectionItem";

interface Props {
  rawLayout: SeatingLayout;
  containerWidth: number;
  containerHeight: number;
  reservedSeatIds?: string[];
  onSeatPress?: (seat: Seat) => void;
  onSectionPress?: (section: Section) => void;
  padding?: number;
  // NEW: controlled selection support (optional)
  selectedSeatIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

function computeNormalizedLayout(raw: SeatingLayout, width: number, height: number, padding = 24) {
  if (!raw?.sections?.length) return { scale: 1, sections: [] as Section[] };

  const allX: number[] = [];
  const allY: number[] = [];

  raw.sections.forEach((s) => {
    allX.push(s.x, s.x + s.width);
    allY.push(s.y, s.y + s.height);
  });

  const minX = Math.min(...allX);
  const minY = Math.min(...allY);
  const maxX = Math.max(...allX);
  const maxY = Math.max(...allY);

  const mapW = maxX - minX || 1;
  const mapH = maxY - minY || 1;

  const availW = width - padding * 2;
  const availH = height - padding * 2;

  const scale = Math.min(availW / mapW, availH / mapH);

  const sections = raw.sections.map((s) => {
    const scaledX = (s.x - minX) * scale + padding;
    const scaledY = (s.y - minY) * scale + padding;
    const scaledW = s.width * scale;
    const scaledH = s.height * scale;

    return {
      ...s,
      x: scaledX,
      y: scaledY,
      width: scaledW,
      height: scaledH,

      seats: s.seats.map((seat) => ({
        ...seat,
        x: seat.x * scale,
        y: seat.y * scale,
        seatSize: 8 * scale, 
      })),
    };
  });

  return { scale, sections };
}

const SeatingMap: React.FC<Props> = ({
  rawLayout,
  containerWidth,
  containerHeight,
  reservedSeatIds = [],
  onSeatPress,
  onSectionPress,
  padding = 24,
   selectedSeatIds,                 // NEW
  onSelectionChange, 
}) => {

  const normalized = useMemo(
    () => computeNormalizedLayout(rawLayout, containerWidth, containerHeight, padding),
    [rawLayout, containerWidth, containerHeight, padding]
  );

  // --- ZOOM & PAN STATE ---
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1); // NEW: Remembers previous zoom level
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastX = useSharedValue(0); // Remembers previous X position
  const lastY = useSharedValue(0); // Remembers previous Y position

  // Center normalized map on load
  useEffect(() => {
    if (!normalized.sections.length) return;

    const minX = Math.min(...normalized.sections.map((s) => s.x));
    const minY = Math.min(...normalized.sections.map((s) => s.y));
    const maxX = Math.max(...normalized.sections.map((s) => s.x + s.width));
    const maxY = Math.max(...normalized.sections.map((s) => s.y + s.height));

    const mapW = maxX - minX;
    const mapH = maxY - minY;

    const cx = (containerWidth - mapW) / 2 - minX;
    const cy = (containerHeight - mapH) / 2 - minY;

    translateX.value = withTiming(cx);
    translateY.value = withTiming(cy);
    // Reset stored values on new layout
    lastX.value = cx; 
    lastY.value = cy;
    scale.value = withTiming(1);
    savedScale.value = 1;
  }, [normalized]);

  // --- UPDATED GESTURES ---
  const pinch = Gesture.Pinch()
    .onStart(() => {
      // Snapshot the current scale when pinch starts
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      // Multiply the snapshot by the gesture scale
      // Min: 0.5 (zoom out a bit)
      // Max: 20 (EXTREME ZOOM - Changed from 3)
      scale.value = Math.max(0.5, Math.min(20, savedScale.value * e.scale));
    });

  const pan = Gesture.Pan()
    .averageTouches(true) // Smoother when using multiple fingers (while pinching)
    .onStart(() => {
      lastX.value = translateX.value;
      lastY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = lastX.value + e.translationX;
      translateY.value = lastY.value + e.translationY;
    });

  // Simultaneous allows zooming and panning at the same time
  const composed = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

   const [selectedSet, setSelectedSet] = useState<Set<string>>(
    () => new Set(selectedSeatIds || [])
  );

  useEffect(() => {
    if (selectedSeatIds) {
      setSelectedSet(new Set(selectedSeatIds));
    }
  }, [selectedSeatIds]);

   useEffect(() => {
    onSelectionChange?.(Array.from(selectedSet));
  }, [selectedSet, onSelectionChange]);

  const toggleSeat = (id: string) => {
    setSelectedSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      // onSelectionChange?.(Array.from(next));
      return next;
    });
  };

  const seatState = (id: string): SeatState => {
    if (selectedSet.has(id)) return "selected";
    if (reservedSeatIds.includes(id)) return "reserved";
    return "available";
  };

  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[animatedStyle, styles.mapContainer]}>
          <Svg width={containerWidth} height={containerHeight}>
            {normalized.sections.map((sec) => (
              <G key={sec.id}>
                <SectionItem
                  section={sec}
                  scaledX={sec.x}
                  scaledY={sec.y}
                  scaledW={sec.width}
                  scaledH={sec.height}
                  onPress={() => onSectionPress?.(sec)}
                />

                {sec.seats.map((seat) => {
                  const cx = sec.x + (seat.x);
                  const cy = sec.y + (seat.y);
                  const r = seat.seatSize;

                  return (
                    <G key={seat.id}>
                      {/* Big invisible tap hitbox for easier pressing */}
                      <Circle
                        cx={cx}
                        cy={cy}
                        r={r * 3} // Increased hitbox size
                        fill="transparent"
                        onPress={() => {
                          toggleSeat(seat.id);  
                          onSeatPress?.(seat);
                        }}
                      />
                      <SeatItem cx={cx} cy={cy} r={r} state={seatState(seat.id)} />
                    </G>
                  );
                })}
              </G>
            ))}
          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default SeatingMap;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7fbff",
    overflow: 'hidden', // Ensures the map doesn't fly outside the view boundaries
  },
  mapContainer: {
    // Optional: add a pivot point if you want, but center (default) is usually fine
  }
});