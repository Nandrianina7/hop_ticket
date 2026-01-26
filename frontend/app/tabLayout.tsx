import { Tabs } from "expo-router";
import React, { useRef } from "react";
import { useTheme } from "react-native-paper";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomBottomBar from "../components/CustomBottomBar";
import CustomHeader from "../components/CustomHeader";
import { useAppTheme } from "./_layout";
import { useRoute } from "@react-navigation/native";

// Création d'un contexte pour gérer les fonctions de rafraîchissement
// Dans _layout.tsx, mettez à jour le RefreshContext
export const RefreshContext = React.createContext<{
  refreshHome: () => void;
  refreshEvents: () => void;
  refreshCinema: () => void;
  refreshTickets: () => void;
  refreshCalendar: () => void;
  setRefreshHome: (fn: () => void) => void;
  setRefreshEvents: (fn: () => void) => void;
  setRefreshCinema: (fn: () => void) => void;
  setRefreshTickets: (fn: () => void) => void;
  setRefreshCalendar: (fn: () => void) => void; 
}>({
  refreshHome: () => {},
  refreshEvents: () => {},
  refreshCinema: () => {},
  refreshTickets: () => {},
  refreshCalendar: () => {},
  setRefreshHome: () => {},
  setRefreshEvents: () => {},
  setRefreshCinema: () => {},
  setRefreshTickets: () => {},
  setRefreshCalendar: () => {}, 
});

export default function TabLayout() {
  const theme = useTheme();
  const { isDark } = useAppTheme(); // Récupération de l'état du thème

  // Références pour les fonctions de rafraîchissement
  const refreshHomeRef = useRef<() => void>(() => {});
  const refreshEventsRef = useRef<() => void>(() => {});
  const refreshCinemaRef = useRef<() => void>(() => {});
  const refreshTicketsRef = useRef<() => void>(() => {});

  // Callbacks setters
  const setRefreshHome = (fn: () => void) => (refreshHomeRef.current = fn);
  const setRefreshEvents = (fn: () => void) => (refreshEventsRef.current = fn);
  const setRefreshCinema = (fn: () => void) => (refreshCinemaRef.current = fn);
  const setRefreshTickets = (fn: () => void) => (refreshTicketsRef.current = fn);

  const refreshCalendarRef = useRef<() => void>(() => {});
  const setRefreshCalendar = (fn: () => void) => (refreshCalendarRef.current = fn);
  const refreshCalendar = () => refreshCalendarRef.current();

  // Triggers
  const refreshHome = () => refreshHomeRef.current();
  const refreshEvents = () => refreshEventsRef.current();
  const refreshCinema = () => refreshCinemaRef.current();
  const refreshTickets = () => refreshTicketsRef.current();

  return (
    <RefreshContext.Provider
      value={{
        refreshHome,
        refreshEvents,
        refreshCinema,
        refreshTickets,
        refreshCalendar,
        setRefreshHome,
        setRefreshEvents,
        setRefreshCinema,
        setRefreshTickets,
        setRefreshCalendar,
      }}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        edges={["top"]}
      >
    {/* <Tabs
  tabBar={(props) => <CustomBottomBar {...props} />}
  screenOptions={{
    headerShown: true,
    headerTransparent: true, // ❌ remove transparency
    headerStyle: {
      backgroundColor:theme.colors.background, // ❌ set background color
      elevation: 0,
      shadowOpacity: 0,
      height: 0, // ✅ reduce the big gray area height
    },
    header: () => <CustomHeader title={route.name} />,           // render your header component  
  }}
> */}
  <Tabs
  tabBar={(props) => <CustomBottomBar {...props} />}
  screenOptions={({ route }) => ({
    headerShown: true,
    headerTransparent: true,
    headerStyle: {
      backgroundColor: theme.colors.background,
      elevation: 0,
      shadowOpacity: 0,
      height: 0,
    },
    header: () => <CustomHeader title={route.name} />, // ✅ pass route name
  })}
>
{/* <Tabs
  screenOptions={{
    headerShown: true,
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTitleAlign: "center",
  }}
> */}
          
          <Tabs.Screen
            name="events"
            options={{ title: "Événements" }}
            listeners={{
              tabPress: () => refreshEvents(),
            }}
          />
         
          <Tabs.Screen
            name="cinema"
            options={{ title: "Cinéma" }}
            listeners={{
              tabPress: () => refreshCinema(),
            }}
          />
          <Tabs.Screen
            name="index"
            options={{ title: "Accueil" }}
            listeners={{
              tabPress: () => refreshHome(),
            }}
          />
           <Tabs.Screen
            name="calendar"
            options={{ title: "Calendrier" }}
            listeners={{
              tabPress: () => {
                // Vous pouvez ajouter une logique de rafraîchissement si nécessaire
                console.log('Calendar tab pressed');
              },
            }}
          />
        
           <Tabs.Screen
            name="OpenStreetMap"
            options={{ title: "Map" }}
          />
        </Tabs>
      </SafeAreaView>
    </RefreshContext.Provider>
  );
}


