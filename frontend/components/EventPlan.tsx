'use client';
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Dimensions, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  PanResponder,
  Animated
} from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler, State } from 'react-native-gesture-handler';

type Seat = {
  x: number;
  y: number;
  id: string;
  label: string;
  square: boolean;
  status: 'Available' | 'Occupied' | 'Selected';
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
  embraceOffset: boolean;
  letterSpacing: number;
};

type Shape = {
  x: number;
  y: number;
  id: string;
  rx: number;
  name: string;
  color: string;
  width: number;
  height: number;
  stroke: string;
  rotation: number;
};

type Section = {
  id: string;
  name: string;
  color: string;
  stroke: string;
  freeSeating: boolean;
};

type Category = {
  id: string;
  name: string;
  color: string;
  textColor: string;
};

type VenuePlanData = {
  name: string;
  text: TextElement[];
  seats: Seat[];
  images: any[];
  shapes: Shape[];
  sections: Section[];
  polylines: any[];
  workspace: any;
  categories: Category[];
};

interface InteractiveVenuePlanProps {
  planData: VenuePlanData;
  onSeatSelect?: (seatIds: string[]) => void;
}

const InteractiveVenuePlan: React.FC<InteractiveVenuePlanProps> = ({ 
  planData, 
  onSeatSelect 
}) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [scale, setScale] = useState(0.5);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  
  const scaleValue = useRef(new Animated.Value(0.5)).current;
  const translateXValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(0)).current;

  // Calculate plan boundaries
  const planWidth = 1600; // Based on your data
  const planHeight = 800;
  const scaledWidth = planWidth * scale;
  const scaledHeight = planHeight * scale;

  const toggleSeatSelection = (seatId: string) => {
    setSelectedSeats((prev) => {
      const newSelection = prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId];
      
      if (onSeatSelect) {
        onSeatSelect(newSelection);
      }
      
      return newSelection;
    });
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.includes(seat.id)) return '#ff5722'; // Selected
    if (seat.status === 'Occupied') return '#757575'; // Occupied
    if (seat.category) {
      const category = planData.categories.find(cat => cat.name === seat.category);
      return category?.color || '#1976d2';
    }
    return '#1976d2'; // Default available
  };

  const getSeatTextColor = (seat: Seat) => {
    if (seat.category) {
      const category = planData.categories.find(cat => cat.name === seat.category);
      return category?.textColor || '#fff';
    }
    return '#fff';
  };

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: scaleValue } }],
    { useNativeDriver: false }
  );

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const newScale = Math.max(0.3, Math.min(3, scale * event.nativeEvent.scale));
      setScale(newScale);
      scaleValue.setValue(newScale);
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const newTranslateX = Math.max(
        -(scaledWidth - screenWidth),
        Math.min(0, translateX + gestureState.dx)
      );
      const newTranslateY = Math.max(
        -(scaledHeight - screenHeight + 200),
        Math.min(0, translateY + gestureState.dy)
      );
      
      translateXValue.setValue(newTranslateX);
      translateYValue.setValue(newTranslateY);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const newTranslateX = Math.max(
        -(scaledWidth - screenWidth),
        Math.min(0, translateX + gestureState.dx)
      );
      const newTranslateY = Math.max(
        -(scaledHeight - screenHeight + 200),
        Math.min(0, translateY + gestureState.dy)
      );
      
      setTranslateX(newTranslateX);
      setTranslateY(newTranslateY);
    },
  });

  const resetView = () => {
    setScale(0.5);
    setTranslateX(0);
    setTranslateY(0);
    scaleValue.setValue(0.5);
    translateXValue.setValue(0);
    translateYValue.setValue(0);
  };

  const renderSeat = (seat: Seat, index: number) => {
    const seatSize = 30;
    const isSelected = selectedSeats.includes(seat.id);
    const isOccupied = seat.status === 'Occupied';
    
    return (
      <TouchableOpacity
        key={seat.id}
        style={[
          styles.seat,
          {
            left: seat.x - seatSize / 2,
            top: seat.y - seatSize / 2,
            width: seatSize,
            height: seatSize,
            backgroundColor: getSeatColor(seat),
            borderRadius: seat.square ? 4 : seatSize / 2,
            borderWidth: isSelected ? 3 : 1,
            borderColor: isSelected ? '#d32f2f' : '#000',
            opacity: isOccupied ? 0.5 : 1,
            transform: [{ rotate: `${seat.rotation}deg` }],
          },
        ]}
        onPress={() => !isOccupied && toggleSeatSelection(seat.id)}
        disabled={isOccupied}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.seatLabel,
            {
              color: getSeatTextColor(seat),
              fontSize: 10,
            },
          ]}
        >
          {seat.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTextElement = (textElement: TextElement, index: number) => (
    <View
      key={textElement.id}
      style={[
        styles.textElement,
        {
          left: textElement.x,
          top: textElement.y,
          transform: [{ rotate: `${textElement.rotation}deg` }],
        },
      ]}
    >
      <Text
        style={[
          styles.planText,
          {
            fontSize: textElement.fontSize,
            color: textElement.color,
            fontWeight: textElement.fontWeight.toString() as any,
            letterSpacing: textElement.letterSpacing,
          },
        ]}
      >
        {textElement.label}
      </Text>
    </View>
  );

  const renderShape = (shape: Shape, index: number) => (
    <View
      key={shape.id}
      style={[
        styles.shape,
        {
          left: shape.x,
          top: shape.y,
          width: shape.width,
          height: shape.height,
          backgroundColor: shape.color,
          borderColor: shape.stroke,
          borderWidth: 2,
          borderRadius: shape.rx,
          transform: [{ rotate: `${shape.rotation}deg` }],
        },
      ]}
    />
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{planData.name}</Text>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={resetView}>
            <Text style={styles.controlButtonText}>Reset View</Text>
          </TouchableOpacity>
          <Text style={styles.selectedCount}>
            Selected: {selectedSeats.length}
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {planData.categories.map((category) => (
            <View key={category.id} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: category.color },
                ]}
              />
              <Text style={styles.legendText}>{category.name}</Text>
            </View>
          ))}
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#757575' }]} />
            <Text style={styles.legendText}>Occupied</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ff5722' }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </ScrollView>
      </View>

      <PinchGestureHandler
        onGestureEvent={onPinchEvent}
        onHandlerStateChange={onPinchStateChange}
      >
        <Animated.View style={styles.planContainer} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.plan,
              {
                width: planWidth,
                height: planHeight,
                transform: [
                  { scale: scaleValue },
                  { translateX: translateXValue },
                  { translateY: translateYValue },
                ],
              },
            ]}
          >
            {/* Render shapes first (background elements) */}
            {planData.shapes.map(renderShape)}
            
            {/* Render text elements */}
            {planData.text.map(renderTextElement)}
            
            {/* Render seats on top */}
            {planData.seats.map(renderSeat)}
          </Animated.View>
        </Animated.View>
      </PinchGestureHandler>

      {selectedSeats.length > 0 && (
        <View style={styles.selectionSummary}>
          <Text style={styles.summaryText}>
            {selectedSeats.length} seat(s) selected
          </Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSelectedSeats([])}
          >
            <Text style={styles.clearButtonText}>Clear Selection</Text>
          </TouchableOpacity>
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  legend: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  planContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  plan: {
    backgroundColor: '#fff',
    position: 'relative',
  },
  seat: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  seatLabel: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textElement: {
    position: 'absolute',
  },
  planText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shape: {
    position: 'absolute',
  },
  selectionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default InteractiveVenuePlan;'use client';
// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   Dimensions,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   PanResponder,
//   Animated,
// } from 'react-native';
// import {
//   GestureHandlerRootView,
//   Gesture,
//   GestureDetector,
// } from 'react-native-gesture-handler';

// /* ===================== TYPES ===================== */

// type Seat = {
//   x: number;
//   y: number;
//   id: string;
//   label: string;
//   square: boolean;
//   status: 'Available' | 'Occupied' | 'Selected';
//   category: string | null;
//   rotation: number;
// };

// type TextElement = {
//   x: number;
//   y: number;
//   id: string;
//   color: string;
//   label: string;
//   fontSize: number;
//   rotation: number;
//   fontWeight: number;
//   letterSpacing: number;
// };

// type Shape = {
//   x: number;
//   y: number;
//   id: string;
//   rx: number;
//   name: string;
//   color: string;
//   width: number;
//   height: number;
//   stroke: string;
//   rotation: number;
// };

// type Category = {
//   id: string;
//   name: string;
//   color: string;
//   textColor: string;
// };

// type VenuePlanData = {
//   name: string;
//   text: TextElement[];
//   seats: Seat[];
//   shapes: Shape[];
//   categories: Category[];
// };

// interface Props {
//   planData: VenuePlanData;
//   onSeatSelect?: (seatIds: string[]) => void;
// }

// /* ===================== COMPONENT ===================== */

// const InteractiveVenuePlan: React.FC<Props> = ({
//   planData,
//   onSeatSelect,
// }) => {
//   const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

//   const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
//   const [scale, setScale] = useState(0.5);
//   const [translateX, setTranslateX] = useState(0);
//   const [translateY, setTranslateY] = useState(0);

//   const scaleValue = useRef(new Animated.Value(0.5)).current;
//   const translateXValue = useRef(new Animated.Value(0)).current;
//   const translateYValue = useRef(new Animated.Value(0)).current;

//   const planWidth = 1600;
//   const planHeight = 800;

//   /* ===================== SEAT LOGIC ===================== */

//   const toggleSeatSelection = (seatId: string) => {
//     setSelectedSeats((prev) => {
//       const next = prev.includes(seatId)
//         ? prev.filter((id) => id !== seatId)
//         : [...prev, seatId];

//       onSeatSelect?.(next);
//       return next;
//     });
//   };

//   const getSeatColor = (seat: Seat) => {
//     if (selectedSeats.includes(seat.id)) return '#ff5722';
//     if (seat.status === 'Occupied') return '#757575';

//     if (seat.category) {
//       const cat = planData.categories.find((c) => c.name === seat.category);
//       return cat?.color ?? '#1976d2';
//     }
//     return '#1976d2';
//   };

//   const getSeatTextColor = (seat: Seat) => {
//     if (seat.category) {
//       const cat = planData.categories.find((c) => c.name === seat.category);
//       return cat?.textColor ?? '#fff';
//     }
//     return '#fff';
//   };

//   /* ===================== GESTURES ===================== */

//   const pinchGesture = Gesture.Pinch()
//     .onUpdate((e) => {
//       const nextScale = Math.max(0.3, Math.min(3, scale * e.scale));
//       scaleValue.setValue(nextScale);
//     })
//     .onEnd((e) => {
//       const nextScale = Math.max(0.3, Math.min(3, scale * e.scale));
//       setScale(nextScale);
//       scaleValue.setValue(nextScale);
//     });

//   const panResponder = PanResponder.create({
//     onMoveShouldSetPanResponder: (_, g) =>
//       Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,

//     onPanResponderMove: (_, g) => {
//       translateXValue.setValue(translateX + g.dx);
//       translateYValue.setValue(translateY + g.dy);
//     },

//     onPanResponderRelease: (_, g) => {
//       setTranslateX(translateX + g.dx);
//       setTranslateY(translateY + g.dy);
//     },
//   });

//   /* ===================== RENDER ===================== */

//   // const renderSeat = (seat: Seat) => {
//   //   const size = 30;
//   //   const isOccupied = seat.status === 'Occupied';

//   //   return (
//   //     <TouchableOpacity
//   //       key={seat.id}
//   //       activeOpacity={0.8}
//   //       disabled={isOccupied}
//   //       hitSlop={8}
//   //       onPress={() => !isOccupied && toggleSeatSelection(seat.id)}
//   //       style={[
//   //         styles.seat,
//   //         {
//   //           left: seat.x - size / 2,
//   //           top: seat.y - size / 2,
//   //           width: size,
//   //           height: size,
//   //           backgroundColor: getSeatColor(seat),
//   //           borderRadius: seat.square ? 4 : size / 2,
//   //           transform: [{ rotate: `${seat.rotation}deg` }],
//   //           opacity: isOccupied ? 0.5 : 1,
//   //         },
//   //       ]}
//   //     >
//   //       <Text style={[styles.seatLabel, { color: getSeatTextColor(seat) }]}>
//   //         {seat.label}
//   //       </Text>
//   //     </TouchableOpacity>
//   //   );
//   // };
//   const renderSeat = (seat: Seat) => {
//   const size = 30;
//   const isOccupied = seat.status === 'Occupied';

//   return (
//     <TouchableOpacity
//       key={seat.id}
//       activeOpacity={0.8}
//       disabled={isOccupied}
//       hitSlop={8}
//       onPress={() => {
//         console.log('🪑 Seat pressed:', {
//           id: seat.id,
//           label: seat.label,
//           status: seat.status,
//           occupied: isOccupied,
//         });

//         if (!isOccupied) {
//           toggleSeatSelection(seat.id);
//         } else {
//           console.log('⛔ Seat is occupied, press ignored');
//         }
//       }}
//       style={[
//         styles.seat,
//         {
//           left: seat.x - size / 2,
//           top: seat.y - size / 2,
//           width: size,
//           height: size,
//           backgroundColor: getSeatColor(seat),
//           borderRadius: seat.square ? 4 : size / 2,
//           transform: [{ rotate: `${seat.rotation}deg` }],
//           opacity: isOccupied ? 0.5 : 1,
//         },
//       ]}
//     >
//       <Text style={[styles.seatLabel, { color: getSeatTextColor(seat) }]}>
//         {seat.label}
//       </Text>
//     </TouchableOpacity>
//   );
// };


//   return (
//     <GestureHandlerRootView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>{planData.name}</Text>
//         <Text style={styles.count}>{selectedSeats.length} sélectionné(s)</Text>
//       </View>

//       <GestureDetector gesture={pinchGesture}>
//         <Animated.View style={styles.planContainer} {...panResponder.panHandlers}>
//           <Animated.View
//             style={[
//               styles.plan,
//               {
//                 width: planWidth,
//                 height: planHeight,
//                 transform: [
//                   { scale: scaleValue },
//                   { translateX: translateXValue },
//                   { translateY: translateYValue },
//                 ],
//               },
//             ]}
//             pointerEvents="box-none"  
//           >
//             {planData.shapes.map((s) => (
//               <View
//                 key={s.id}
//                 style={[
//                   styles.shape,
//                   {
//                     left: s.x,
//                     top: s.y,
//                     width: s.width,
//                     height: s.height,
//                     backgroundColor: s.color,
//                     borderColor: s.stroke,
//                     borderRadius: s.rx,
//                     transform: [{ rotate: `${s.rotation}deg` }],
//                   },
//                 ]}
//               />
//             ))}

//             {planData.text.map((t) => (
//               <Text
//                 key={t.id}
//                 style={[
//                   styles.text,
//                   {
//                     left: t.x,
//                     top: t.y,
//                     color: t.color,
//                     fontSize: t.fontSize,
//                     letterSpacing: t.letterSpacing,
//                     transform: [{ rotate: `${t.rotation}deg` }],
//                   },
//                 ]}
//               >
//                 {t.label}
//               </Text>
//             ))}

//             {planData.seats.map(renderSeat)}
//           </Animated.View>
//         </Animated.View>
//       </GestureDetector>
//     </GestureHandlerRootView>
//   );
// };

// /* ===================== STYLES ===================== */

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f5f5' },
//   header: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   title: { fontSize: 18, fontWeight: '700' },
//   count: { marginTop: 4, color: '#666' },

//   planContainer: { flex: 1, overflow: 'hidden' },
//   plan: { backgroundColor: '#fff', position: 'relative' },

//   seat: {
//     position: 'absolute',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#000',
//   },
//   seatLabel: { fontSize: 10, fontWeight: '700' },

//   shape: {
//     position: 'absolute',
//     borderWidth: 2,
//   },
//   text: {
//     position: 'absolute',
//     fontWeight: '700',
//   },
// });

// export default InteractiveVenuePlan;
