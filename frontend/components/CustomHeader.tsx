import React from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions,Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppTheme } from "../app/_layout";
import OpenStreetMap from "@/app/(tabs)/OpenStreetMap";

export default function CustomHeader({ title }: { title: string }) {
  const router = useRouter();
  const { isDark } = useAppTheme();

  const handleSearchPress = () => router.push("/search");
  const handleProfilePress = () => router.push("/Profile");
  

    const titles: Record<string, string> = {
    index: "Accueil",
    events: "Événements",
    cinema: "Cinéma",
    calendar: "Calendrier",
    setting: "Paramètres",
    OpenStreetMap : "Map",
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: isDark ? "#2b2b2b" : "#fff",
            shadowColor: isDark ? "#000" : "#999",
          },
        ]}
      >
            {/* Centered title overlay */}
        <View pointerEvents="none" style={styles.centerTitle}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#111" }]} numberOfLines={1}>
            {titles[title] || title}
          </Text>
        </View>
           
        
        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: isDark ? "#3b3b3b" : "#f3f3f3" },
          ]}
          onPress={handleSearchPress}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={isDark ? "#ddd" : "#333"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: isDark ? "#3b3b3b" : "#f3f3f3" },
          ]}
          onPress={handleProfilePress}
        >
          <MaterialCommunityIcons
            name="account"
            size={24}
            color={isDark ? "#ddd" : "#333"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 10, // ✅ just enough to clear status bar
  },
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: Dimensions.get("window").width * 0.9,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
    title: {
    fontSize: 20,
    fontWeight: "600",
  },
  centerTitle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 60,  // leave space for icons + padding
    right: 60, // leave space for icons + padding
    alignItems: "center",
    justifyContent: "center",
  },
});
