// SeatingMap.tsx
import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
} from "react-native";
import Svg, { G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
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
  selectedSeatIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

/* ===========================
   NORMALISATION DU PLAN
=========================== */
function computeNormalizedLayout(
  raw: SeatingLayout,
  width: number,
  height: number,
  padding = 24
) {
  if (!raw?.sections?.length) return { sections: [] as Section[] };

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

  const scale = Math.min(
    (width - padding * 2) / mapW,
    (height - padding * 2) / mapH
  );

  const sections = raw.sections.map((s) => ({
    ...s,
    x: (s.x - minX) * scale + padding,
    y: (s.y - minY) * scale + padding,
    width: s.width * scale,
    height: s.height * scale,
    seats: s.seats.map((seat) => ({
      ...seat,
      x: seat.x * scale,
      y: seat.y * scale,
      seatSize: 8 * scale,
    })),
  }));

  return { sections };
}

const SeatingMap: React.FC<Props> = ({
  rawLayout,
  containerWidth,
  containerHeight,
  reservedSeatIds = [],
  onSeatPress,
  onSectionPress,
  padding = 24,
  selectedSeatIds,
  onSelectionChange,
}) => {
  const normalized = useMemo(
    () =>
      computeNormalizedLayout(
        rawLayout,
        containerWidth,
        containerHeight,
        padding
      ),
    [rawLayout, containerWidth, containerHeight, padding]
  );

  // Zoom level indicator
  const [zoomLevel, setZoomLevel] = useState(1);

  /* ===========================
     TRANSFORM (ZOOM & PAN)
  =========================== */
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastX = useSharedValue(0);
  const lastY = useSharedValue(0);

  // Update zoom level for indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setZoomLevel(Math.round(scale.value * 100) / 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  /* ===========================
     ZOOM & PAN CONTROLS
  =========================== */
  const resetView = () => {
    scale.value = withTiming(1, { duration: 300 });
    translateX.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });
  };

  const zoomIn = () => {
    scale.value = withTiming(Math.min(scale.value * 1.25, 20), { duration: 200 });
  };

  const zoomOut = () => {
    scale.value = withTiming(Math.max(scale.value / 1.25, 0.5), { duration: 200 });
  };

  // Movement controls
  const moveStep = 50;
  const moveUp = () => translateY.value = withTiming(translateY.value + moveStep, { duration: 200 });
  const moveDown = () => translateY.value = withTiming(translateY.value - moveStep, { duration: 200 });
  const moveLeft = () => translateX.value = withTiming(translateX.value + moveStep, { duration: 200 });
  const moveRight = () => translateX.value = withTiming(translateX.value - moveStep, { duration: 200 });

  /* ===========================
     SELECTION STATE
  =========================== */
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

  const toggleSeat = useCallback(
    (id: string) => {
      setSelectedSet((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    },
    []
  );

  const seatState = useCallback(
    (id: string): SeatState => {
      const seat = normalized.sections
        .flatMap(s => s.seats)
        .find(s => s.id === id);
      
      if (seat?.disabled) return "disabled";
      if (reservedSeatIds.includes(id)) return "reserved";
      if (selectedSet.has(id)) return "selected";
      return "available";
    },
    [reservedSeatIds, selectedSet, normalized.sections]
  );

  /* ===========================
     GESTURES (PINCH & PAN)
  =========================== */
  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(
        0.5,
        Math.min(20, savedScale.value * e.scale)
      );
    });

  const pan = Gesture.Pan()
    .minDistance(10)
    .onStart(() => {
      lastX.value = translateX.value;
      lastY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = lastX.value + e.translationX;
      translateY.value = lastY.value + e.translationY;
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  /* ===========================
     SNAP ZOOM SUR SECTION
  =========================== */
  const snapToSection = (sec: Section) => {
    const targetScale = Math.min(
      containerWidth / sec.width,
      containerHeight / sec.height
    );

    scale.value = withTiming(targetScale, { duration: 400 });
    translateX.value = withTiming(
      -sec.x * targetScale + containerWidth / 2 - (sec.width * targetScale) / 2,
      { duration: 400 }
    );
    translateY.value = withTiming(
      -sec.y * targetScale + containerHeight / 2 - (sec.height * targetScale) / 2,
      { duration: 400 }
    );

    onSectionPress?.(sec);
  };

  /* ===========================
     RENDER
  =========================== */
  return (
    <View
      style={[
        styles.container,
        { width: containerWidth, height: containerHeight },
      ]}
    >
      <GestureDetector gesture={composed}>
        <Animated.View style={animatedStyle}>
          <Svg width={containerWidth} height={containerHeight}>
            {normalized.sections.map((sec) => (
              <G key={sec.id}>
                <SectionItem
                  section={sec}
                  scaledX={sec.x}
                  scaledY={sec.y}
                  scaledW={sec.width}
                  scaledH={sec.height}
                  onPress={() => snapToSection(sec)}
                />

                {sec.seats
                  .filter(seat => !seat.disabled)
                  .map((seat) => (
                    <SeatItem
                      key={seat.id}
                      cx={sec.x + seat.x}
                      cy={sec.y + seat.y}
                      r={seat.seatSize}
                      state={seatState(seat.id)}
                    />
                  ))}
              </G>
            ))}
          </Svg>

          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="box-none"
          >
            {normalized.sections.flatMap((sec) =>
              sec.seats
                .filter(seat => !seat.disabled)
                .map((seat) => {
                  const cx = sec.x + seat.x;
                  const cy = sec.y + seat.y;
                  const r = seat.seatSize * 2;
                  const isReserved = reservedSeatIds.includes(seat.id);

                  return (
                    <Pressable
                      key={`sec-${sec.id}-seat-${seat.id}`}
                      style={{
                        position: "absolute",
                        left: cx - r,
                        top: cy - r,
                        width: r * 2,
                        height: r * 2,
                        borderRadius: r,
                      }}
                      disabled={isReserved}
                      onPress={() => {
                        toggleSeat(seat.id);
                        onSeatPress?.(seat);
                      }}
                    />
                  );
                })
            )}
          </View>
        </Animated.View>
      </GestureDetector>
      {/* COMPACT BOTTOM CONTROLS */}
      <View style={styles.compactControls}>
        <View style={styles.compactZoomButtons}>
          <Pressable style={styles.compactButton} onPress={zoomOut}>
            <Text style={styles.compactButtonText}>−</Text>
          </Pressable>
          <Pressable style={styles.compactButton} onPress={resetView}>
            <Text style={styles.compactButtonText}>⟲</Text>
          </Pressable>
          <Pressable style={styles.compactButton} onPress={zoomIn}>
            <Text style={styles.compactButtonText}>+</Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.compactDivider} />

        {/* Drag Section - All in one row as requested */}
        <View style={styles.dragRow}>
          <Pressable style={styles.dragButton} onPress={moveLeft}>
            <Text style={styles.dragButtonText}>←</Text>
          </Pressable>
          <Pressable style={styles.dragButton} onPress={moveRight}>
            <Text style={styles.dragButtonText}>→</Text>
          </Pressable>
          <Pressable style={styles.dragButton} onPress={moveUp}>
            <Text style={styles.dragButtonText}>↑</Text>
          </Pressable>
          <Pressable style={styles.dragButton} onPress={moveDown}>
            <Text style={styles.dragButtonText}>↓</Text>
          </Pressable>
        </View>
      </View>

      {/* Mini Help Text */}
      <View style={styles.miniHelp}>
        <Text style={styles.miniHelpText}>Pinch • Drag</Text>
      </View>
    </View>
  );
};

export default SeatingMap;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f7fa",
    overflow: "hidden",
    position: "relative",
  },
  compactControls: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(30, 35, 48, 0.95)",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
    paddingVertical: 8,
    paddingHorizontal: 3,
    flexDirection: "row",
    alignItems: "center",
  },

  compactZoomLevel: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },

  compactZoomText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  compactZoomButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  compactButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 2,
  },

  compactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
  },

  compactDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 6,
  },

  // Drag row with all four directions
  dragRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  dragButton: {
    width: 27,
    height: 27,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: 1,
  },

  dragButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  // Mini help text
  miniHelp: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 5,
  },

  miniHelpText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});