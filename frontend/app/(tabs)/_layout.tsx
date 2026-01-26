import { Tabs, useRouter, Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomBottomBar from "../../components/CustomBottomBar";
import CustomHeader from "../../components/CustomHeader";
import { useAppTheme } from "../_layout";
import TabLayout from "../tabLayout";
import { isAuthenticated } from "@/utils/api";

// Création d'un contexte pour gérer les fonctions de rafraîchissement
// Dans _layout.tsx, mettez à jour le RefreshContext

export default function _LayoutTab() {
  const theme = useTheme();
  const [status, setStatus] = useState<'loading' | 'authed' | 'unauth'>('loading');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tok = await isAuthenticated();
        if (mounted) setStatus(tok ? 'authed' : 'unauth');
      } catch {
        if (mounted) setStatus('unauth');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'loading') {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (status === 'unauth') {
    return <Redirect href="/login" />;
  }

  return <TabLayout />;
}

const styles = StyleSheet.create({
  header: {
    shadowColor: "white",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    height: 0,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
