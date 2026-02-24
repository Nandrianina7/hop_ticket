
// SeatingMap.tsx
import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import Svg, { Circle, G, Rect } from "react-native-svg";
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
  // 🎯 Recentre le plan
    const resetView = () => {
      scale.value = withTiming(1);
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
    };

    // ➕ Zoom +
    const zoomIn = () => {
      scale.value = withTiming(Math.min(scale.value * 1.25, 20));
    };

    // ➖ Zoom -
    const zoomOut = () => {
      scale.value = withTiming(Math.max(scale.value / 1.25, 0.5));
    };
   
  /* ===========================
     TRANSFORM (ZOOM / PAN)
  =========================== */
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastX = useSharedValue(0);
  const lastY = useSharedValue(0);

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
      if (reservedSeatIds.includes(id)) return "reserved";
      if (selectedSet.has(id)) return "selected";
      return "available";
    },
    [reservedSeatIds, selectedSet]
  );

  /* ===========================
     GESTURES (PAN / PINCH)
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

    scale.value = withTiming(targetScale);
    translateX.value = withTiming(
      -sec.x * targetScale + containerWidth / 2 - (sec.width * targetScale) / 2
    );
    translateY.value = withTiming(
      -sec.y * targetScale + containerHeight / 2 - (sec.height * targetScale) / 2
    );

    onSectionPress?.(sec);
  };
  // ===========================
  // BOUTONS GUIDE (déplacement du plan)
  // ===========================
  const moveStep = 50; // px par clic

  const moveUp = () => {
    translateY.value = withTiming(translateY.value + moveStep);
  };
  const moveDown = () => {
    translateY.value = withTiming(translateY.value - moveStep);
  };
  const moveLeft = () => {
    translateX.value = withTiming(translateX.value + moveStep);
  };
  const moveRight = () => {
    translateX.value = withTiming(translateX.value - moveStep);
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
          {/* ===== SVG (VISUEL SEULEMENT) ===== */}
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

                {sec.seats.map((seat) => (
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

          {/* ===== OVERLAY TACTILE (LA CLÉ 🔥) ===== */}
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="box-none"
          >
            {normalized.sections.flatMap((sec) =>
              sec.seats.map((seat) => {
                const cx = sec.x + seat.x;
                const cy = sec.y + seat.y;
                const r = seat.seatSize * 2;
                const isReserved = reservedSeatIds.includes(seat.id);

                return (
                  <Pressable
                    // key={seat.id}
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
      {/* ===== CONTROLES ZOOM ===== */}
      <View style={styles.controls}>
        <Pressable style={styles.controlBtn} onPress={zoomIn}>
          <Animated.Text style={styles.controlText}>＋</Animated.Text>
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={zoomOut}>
          <Animated.Text style={styles.controlText}>－</Animated.Text>
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={resetView}>
          <Animated.Text style={styles.controlText}>🎯</Animated.Text>
        </Pressable>
      </View>
      {/* Bouton <><> */}
      <View style={styles.guideControls}>
        <Pressable style={styles.guideBtn} onPress={moveUp}>
          <Animated.Text style={styles.guideText}>⬆️</Animated.Text>
        </Pressable>

        <View style={{ flexDirection: "row" }}>
          <Pressable style={styles.guideBtn} onPress={moveLeft}>
            <Animated.Text style={styles.guideText}>⬅️</Animated.Text>
          </Pressable>

          <Pressable style={styles.guideBtn} onPress={moveRight}>
            <Animated.Text style={styles.guideText}>➡️</Animated.Text>
          </Pressable>
        </View>

        <Pressable style={styles.guideBtn} onPress={moveDown}>
          <Animated.Text style={styles.guideText}>⬇️</Animated.Text>
        </Pressable>
      </View>


    </View>
  );
};

export default SeatingMap;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7fbff",
    overflow: "hidden",
  },
  controls: {
  position: "absolute",
  right: 35,
  bottom: 20,
  alignItems: "center",
},

controlBtn: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "rgba(0,0,0,0.65)",
  justifyContent: "center",
  alignItems: "center",
  marginVertical: 6,
},

controlText: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "bold",
},
guideControls: {
  position: "absolute",
  left: 0,
  bottom: 22,
  alignItems: "center",
  justifyContent: "center",
},

guideBtn: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "rgba(0,0,0,0.65)",
  justifyContent: "center",
  alignItems: "center",
  margin: 6,
},

guideText: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "bold",
},


   mapContainer: {},
});
