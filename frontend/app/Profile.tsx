import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Settings } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInRight, ZoomIn, BounceIn } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "./_layout";
import SettingsScreen from "./setting";

type User = {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  number?: string; // phone
};

const fallbackUser: User = {
  email: "user@gmail.com",
  first_name: "User",
  last_name: "Name",
  id: 1,
  number: "0000000000",
};

export default function Profile() {
  const { isDark } = useAppTheme();
  const [user, setUser] = useState<User>(fallbackUser);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw);
          setUser((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // keep fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "User";
  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

  const rows = [
    { icon: "email-outline", label: "Email", value: user.email || "-" },
    { icon: "phone-outline", label: "Téléphone", value: user.number || "-" },
    // { icon: "identifier", label: "Identifiant", value: String(user.id ?? "-") },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f9f9f9" }]}>
      <Animated.Text
        entering={FadeInRight.duration(700)}
        style={[styles.title, { color: isDark ? "#fff" : "#222" }]}
      >
        Profil
      </Animated.Text>

      {/* Profile header card */}
      <Animated.View
        entering={ZoomIn}
        style={[
          styles.profileCard,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            shadowColor: isDark ? "#000" : "#000",
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { backgroundColor: isDark ? "#3b3b3b" : "#e8e8e8" }]}>
            <Text style={[styles.avatarText, { color: isDark ? "#fff" : "#333" }]}>
              {initials || "U"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: isDark ? "#fff" : "#222" }]}>{fullName}</Text>
            <Text style={[styles.sub, { color: isDark ? "#aaa" : "#666" }]}>{user.email || "-"}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Info rows matching Settings items style */}
      {rows.map((r, index) => (
        <Animated.View key={r.label} entering={ZoomIn.delay((index + 1) * 150)}>
          <View
            style={[
              styles.item,
              {
                backgroundColor: isDark ? "#1e1e1e" : "#fff",
                shadowColor: isDark ? "#000" : "#000",
              },
            ]}
          >
            <Animated.View entering={BounceIn}>
              <MaterialCommunityIcons name={r.icon} size={28} color="#4285F4" />
            </Animated.View>
            <Text style={[styles.itemText, { color: isDark ? "#fff" : "#333" }]}>{r.label}</Text>
            <Text style={[styles.value, { color: isDark ? "#ddd" : "#555" }]} numberOfLines={1}>
              {r.value}
            </Text>
          </View>
        </Animated.View>
      ))}
      <SettingsScreen></SettingsScreen>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 60 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  profileCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700" },
  name: { fontSize: 18, fontWeight: "700" },
  sub: { fontSize: 14 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 16,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  itemText: { fontSize: 16, marginLeft: 14, fontWeight: "500", flex: 1 },
  value: { fontSize: 16, maxWidth: "55%", textAlign: "right" },
});