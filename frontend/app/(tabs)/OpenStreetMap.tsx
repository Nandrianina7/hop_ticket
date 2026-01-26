import { getEventLocation } from "@/utils/api";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// 1. Import du router
import { useRouter } from "expo-router";

type EventLoc = {
  id: number;
  name: string;
  venue: string;
  image?: string;
  latitude: number;
  longitude: number;
  location_name: string;
};

export default function OpenStreetMap() {
  const { width, height } = Dimensions.get("window");
  const [events, setEvents] = useState<EventLoc[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventLoc | null>(null);

  // 2. Initialisation du router
  const router = useRouter();

  useEffect(() => {
    const fetchEventLocation = async () => {
      try {
        let response = await getEventLocation();
        if (response?.data) {
          setEvents(response.data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEventLocation();
  }, []);


  const handleMapPress = () => {
    if (selectedEvent) {
      setSelectedEvent(null);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={{ width, height }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: -18.8792,
          longitude: 47.5079,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        showsCompass={true}
        showsTraffic={false}
        onPress={handleMapPress}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedEvent(event);
            }}
          />
        ))}
      </MapView>

      {/* Pop-up Overlay */}
      {selectedEvent && (
        <View style={styles.cardContainer}>
          {/* 3. On rend toute la carte cliquable pour la navigation */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9} // Feedback visuel au clic
            onPress={() => {
              // Navigation vers la page de détails
              console.log(`Navigating to event ${selectedEvent.id}`);
              router.push(`/event/${selectedEvent.id}`);
            }}
          >
            {/* Bouton croix pour fermer uniquement le popup */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={(e) => {
                // 4. Important : Empêche le clic de "traverser" vers le parent (la navigation)
                e.stopPropagation();
                setSelectedEvent(null);
              }}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            <Image
              source={{
                uri: selectedEvent.image
                  ? `${process.env.EXPO_PUBLIC_API_BACK_URL}${selectedEvent.image}`
                  : "https://via.placeholder.com/200",
              }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{selectedEvent.name}</Text>
              <Text style={styles.cardSubtitle}>{selectedEvent.location_name}</Text>
              {/* Ajout d'un petit texte ou icône pour inciter au clic */}
              <Text style={styles.seeMore}>Voir détails ›</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  cardContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  // Nouveau style pour le lien "Voir détails"
  seeMore: {
    fontSize: 12,
    color: "#007AFF", // Bleu classique iOS/Link
    marginTop: 4,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 10,
    zIndex: 20, // Doit être au-dessus du reste
    padding: 5, // Agrandir la zone de clic
  },
  closeButtonText: {
    color: "#aaa",
    fontWeight: "bold",
    fontSize: 16,
  },
});