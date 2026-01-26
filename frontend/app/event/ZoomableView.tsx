import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDecay,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

interface ZoomableViewProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
}

/**
 * Modern pinch-to-zoom + pan + double-tap zoom view for Expo / RN 0.74+
 */
export default function ZoomableView({
  children,
  minScale = 1,
  maxScale = 3,
}: ZoomableViewProps) {
  // Shared animated values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // --- Gestures ---

  // Pinch to zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(
        Math.max(event.scale, minScale),
        maxScale
      );
    });

  // Pan (drag)
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      translateX.value = withDecay({ velocity: event.velocityX });
      translateY.value = withDecay({ velocity: event.velocityY });
    });

  // Double tap to zoom in/out
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(scale.value > 1 ? 1 : 2, { duration: 200 });
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(
    doubleTapGesture,
    pinchGesture,
    panGesture
  );

  // --- Animated style ---
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
