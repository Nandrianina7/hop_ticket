// components/CustomBottomBar.tsx
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from '../app/_layout'; // Import du hook de thème

interface Props extends BottomTabBarProps {}

export default function CustomBottomBar({ state, descriptors, navigation }: Props) {
  const { isDark } = useAppTheme(); // Récupération de l'état du thème
  
  // Références pour les animations de chaque onglet
  const scaleAnims = useRef(state.routes.map(() => new Animated.Value(1))).current;
  const translateYAnims = useRef(state.routes.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Animer l'onglet actif
    const activeIndex = state.index;
    
    state.routes.forEach((_, index) => {
      if (index === activeIndex) {
        // Animation pour l'onglet actif : scale up + translation vers le haut
        Animated.parallel([
          Animated.spring(scaleAnims[index], {
            toValue: 1.2,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.spring(translateYAnims[index], {
            toValue: -15,
            friction: 4,
            useNativeDriver: true,
          })
        ]).start();
      } else {
        // Animation pour les onglets inactifs : retour à l'état normal
        Animated.parallel([
          Animated.spring(scaleAnims[index], {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.spring(translateYAnims[index], {
            toValue: 0,
            friction: 4,
            useNativeDriver: true,
          })
        ]).start();
      }
    });
  }, [state.index]);

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: isDark ? '#1e1e1e' : '#fff',
        shadowColor: isDark ? '#000' : '#000',
      }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        // Dans la partie où vous définissez iconName, ajoutez :
        const iconName =
          route.name === "index"
            ? "home"
            : route.name === "events"
            ? "calendar"
            : route.name === "cinema"
            ? "film"
            : route.name === "calendar" // NOUVEL ONGLET
            ? "calendar-month" // Icône pour le calendrier unifié
            : route.name === "OpenStreetMap"
            ? "map"
            : "cog";

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            onPress={onPress}
            style={styles.tabItem}
          >
            <Animated.View 
              style={[
                isFocused ? styles.floatingIcon : undefined,
                {
                  transform: [
                    { scale: scaleAnims[index] },
                    { translateY: translateYAnims[index] }
                  ]
                }
              ]}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={isFocused ? 30 : 24}
                color={isFocused ? "#fff" : isDark ? "#888" : "#666"}
              />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    height: 70,
    justifyContent: "space-around",
    alignItems: "center",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  floatingIcon: {
    width: 45,
    height: 45,
    backgroundColor: "#ff0022ff",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
    elevation: 5,
  },
});