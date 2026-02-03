// app/event/[id].tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import ZoomableView from 'react-native-zoomable-view'
import ZoomableView from './ZoomableView';
import {
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Paragraph,
  Button,
  useTheme,
  Card,
  ActivityIndicator,
  Text,
  Divider,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { buyTicket, fetchEventById, fetchEventPlans, fetchEventPriceTiers, fetchReservedTickets, fetchVenuePlans, saveEvent } from '../../utils/api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import VenuePlanImage from '../../components/VenuePlanImage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import VenuePlanViewer from '@/components/VenuPlanViewer';
import PriceLegendCompact from './PriceLegendCompact';
import SelectedSeatsBill from './SelectedSeatsBill';
import SeatingMap from '@/components/SeatMap';
import { SeatingLayout } from '@/components/type';

type PriceTier = {
  id: number;
  tier_type: string;
  price: number;
  available_quantity: number;
};

type EventType = {
  id: number;
  name: string;
  date: string;
  venue: string;
  description: string;
  price_tiers?: PriceTier[];
  image_url?: string;
  location_name:string;
};

type VenuePlans= {
  id: number;
  site_name: string;
  elements: any[];
  metadata: any;
  created_at: string;
};

type SeatBillItem = {
  id: string | number;
  categoryName?: string;
  label?: string;
  row?: string | number;
  number?: string | number;
  price?: string | number;
  status?: string;
};

// type Tier = { id: number; tier_type: string; price: number; available_quantity: number };
type LabelItem = { id: string; name: string; color?: string; textColor?: string; x: number; y: number; width: number; height: number; rotation: number; type: string; seats: any[] };
type Category = { id: string; name: string; color: string; textColor?: string };


function parseSeatId(id: string) {
  // Split on '-' and trim parts
  const parts = id.split('-').map(p => p.trim());
  // Expected: [label, row, number] OR [label, block, row, number]
  // Common case here: ["VIP", "A", "1"] or ["VIP", "A", "A", "1"]
  const label = parts[0];
  const maybeRow = parts[parts.length - 2] ?? '';
  const maybeNum = parts[parts.length - 1] ?? '';

  return {
    label,
    row: maybeRow,
    number: maybeNum,
  };
}

function priceForLabel(label: string, tiers: PriceTier[]) {
  const lcl = label.toLowerCase();
  const matched = tiers.find(t => lcl.includes((t.tier_type || '').toLowerCase()));
  return matched ? { categoryName: matched.tier_type, price: matched.price } : { categoryName: undefined, price: undefined };
}

function toSeatBillItems(selectionIds: string[], tiers: PriceTier[], status?: string): SeatBillItem[] {
  return (selectionIds || []).map((idStr) => {
    const { label, row, number } = parseSeatId(idStr);
    const { categoryName, price } = priceForLabel(label, tiers);

    return {
      id: idStr,
      categoryName,      // e.g., "VIP", "ARGENT"
      label,             // e.g., "VIP"
      row,               // e.g., "A"
      number,            // e.g., "1"
      price,             // numeric price from tier
      status,            // optional (e.g., "Selected")
    } as SeatBillItem;
  });
}

function buildCategories(labels: LabelItem[], tiers: PriceTier[]): Category[] {
  // fallback palette per tier
  const palette: Record<string, string> = {
    vip: '#D32F2F',
    premium: '#1976D2',
    standard: '#2E7D32',
    economy: '#6D4C41',
  };

  // Collect colors per tier_type from labels that contain the tier name
  const tierColors = new Map<string, string>();
  for (const lbl of labels) {
    const nameLc = (lbl.name || '').toLowerCase();
    for (const t of tiers) {
      const tierKey = (t.tier_type || '').toLowerCase();
      if (!tierKey) continue;
      if (nameLc.includes(tierKey)) {
        // prefer the first explicit label color for that tier
        if (lbl.color && !tierColors.has(tierKey)) {
          tierColors.set(tierKey, lbl.color);
        }
      }
    }
  }

  // Build unique categories by tier_type
  const categories: Category[] = [];
  const seenTier = new Set<string>();
  for (const t of tiers) {
    const tierKey = (t.tier_type || '').toLowerCase();
    if (!tierKey || seenTier.has(tierKey)) continue;

    const color = tierColors.get(tierKey) || palette[tierKey] || '#999';
    categories.push({
      id: `tier-${tierKey}`,
      name: t.tier_type,           // Category name is the tier_type (e.g., "VIP")
      color,
      textColor: '#fff',
    });
    seenTier.add(tierKey);
  }

  return categories;
}





export default function EventDetail() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const theme = useTheme();

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [venuePlans, setVenuePlans] = useState<VenuePlans[]>([]);
  const [reservedSeatIds, setReservedSeatIds] = useState<string[]>([]);
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [selection, setSelection] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);

  const handleSelectionChange = useCallback((ids: string[]) => {
  const billItems = toSeatBillItems(ids, priceTiers, "Selected");
  setSelection(billItems);
}, [priceTiers]);

  function filterMetadataSeats(metadata: any,seats: any): any[] {
    const seat: any[]= [];
    if (!metadata) return [];
    seats.forEach((element: { id: any; }) => {
      const found = metadata.seats.find((el: any) => el.id === element.id);
      if (found) {
        found.status="Unavailable"
        seat.push(found)
      }
    });
    setMetadata(metadata);
    console.log("metaData modifier :",metadata.seats)
    return seat;
  }

 

  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = 20 * 2;
  const cardWidth = screenWidth - horizontalPadding;
  const maxImageHeight = 420;

  const priceMap = React.useMemo(() => {
  const map: Record<string, number> = {};
  (priceTiers ?? []).forEach(t => {
    if (t?.tier_type) map[t.tier_type] = t.price;
  });
  return map;
}, [priceTiers]);
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const id =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id) && params.id.length > 0
      ? params.id[0]
      : undefined;

  
   useEffect(() => {
    if (!id) return;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return;
    fetchReservedTickets(idNum).then((data) => {
      console.log('Seat IDs already reserved:', data.seat_ids);
      setReservedSeatIds(data.seat_ids);
    });

  }, [id]);

    const handleBilling = async () => {
      let sum=0;
      const counts: Record<string, number> = selection.reduce(
        (acc: Record<string, number>, item: any) => {
          const key = item?.categoryName ?? 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Object.entries(counts).forEach(async ([categoryName, count]) => {
      //   const tier = priceTiers.find((tier) => tier.tier_type === categoryName);
      //   if (tier) {
      //     const price = tier.price;
      //     const totalPrice = price * count;
      //     sum=sum+count;
      //     if (count > tier.available_quantity) {
      //       Alert.alert('Erreur', `Seulement ${tier.available_quantity} tickets disponibles`);
      //       return;
      //     }
      //     // Convert the route param id (string | undefined) to a number and validate it
      //     const eventIdNum = id ? Number(id) : undefined;
      //     if (!eventIdNum || Number.isNaN(eventIdNum)) {
            
      //     }
      //     else{

      //       await buyTicket(eventIdNum, tier.id);
      //       // await saveEvent(metadata);
      //     }
      //     console.log(
      //       `tier_id ${tier.id} Catégorie: ${categoryName}, Prix unitaire: ${price}, Quantité: ${count} sur ${tier.available_quantity}, Prix total: ${totalPrice}`
      //     );
      //   } else {
      //     console.log(`Catégorie: ${categoryName} (no tier), Quantité: ${count}`);
      //   }
      // });
      

 for (const [categoryName, count] of Object.entries(counts)) {
  const tier = priceTiers.find((t) => t.tier_type === categoryName);
  if (!tier) continue;
  if (count > tier.available_quantity) {
    Alert.alert('Erreur', `Seulement ${tier.available_quantity} tickets disponibles`);
    return;
  }
  const eventIdNum = id ? Number(id) : undefined;

  // Buy per selected seat in this category
  const seatsInCategory = selection.filter(s => s.categoryName === categoryName);
  for (const seat of seatsInCategory) {
    await buyTicket(eventIdNum!, tier.id, String(seat.id)); // pass seat id
    sum += 1;
  }
}

       Alert.alert(
              'Succès',
              `${sum} ticket(s) acheté(s) avec succès!`,
              [
                {
                  text: 'Voir mes tickets',
                  onPress: () => router.replace('/event/myticket_events'),
                },
                {
                  text: 'Continuer',
                  onPress: () => router.back(),
                },
              ]
            );

      // console.log(counts);
    };
 

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchEventById(id);
        console.log('Événement chargé:', data);
        setEvent(data);

        // Start animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();

        // Charger les plans de salle
        const loadVenuePlans = async () => {
          try {
            const plans = await fetchEventPlans(data.venue);
            console.log('Venue plans found:', plans);
            setVenuePlans(plans);
            console.log('Plans de salle chargés:', venuePlans);
            
          } catch (error) {
            console.log('Aucun plan de salle trouvé:', error);
          }
        };

        if (data && data.venue) {
          loadVenuePlans();
        }

        const uri = data?.image_url;
        if (uri) {
          Image.getSize(
            uri,
            (width, height) => {
              if (width && height) {
                const ratio = height / width;
                const computed = Math.round(cardWidth * ratio);
                const finalHeight = Math.min(computed, maxImageHeight);
                setImageHeight(finalHeight);
              } else {
                setImageHeight(180);
              }
            },
            (err) => {
              console.warn('Image.getSize failed for', uri, err);
              setImageFailed(true);
              setImageHeight(180);
            }
          );
        } else {
          setImageHeight(null);
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'événement:', err);
        Alert.alert('Erreur', "Impossible de charger l'événement.");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  useEffect(() => {
    const loadPriceTiers = async () => {
      if (!id) return;
      try {
        // Utilisez la fonction importée fetchEventPriceTiers
        const eventData = await fetchEventPriceTiers(id);
        console.log('Types de tickets chargés:', eventData?.price_tiers);
        setPriceTiers(eventData?.price_tiers || []);
      } catch (error) {
        console.error('Erreur lors du chargement des types de tickets:', error);
        Alert.alert('Erreur', 'Impossible de charger les types de tickets');
      }
    };
  
    loadPriceTiers();
  }, [id]);
  
  const handleSelectTicketType = () => {
    if (venuePlans.length > 0) {
      router.push({
        pathname: '/event/confirm-purchase',
        params: {
          event: JSON.stringify(event),
          venuePlans: JSON.stringify(venuePlans)
        }
      });
    } else {
      router.push({
        pathname: '/event/confirm-purchase',
        params: {
          event: JSON.stringify(event)
        }
      });
    }
  };

  useEffect(() => {
  console.log('Plans de salle chargés (state updated):', venuePlans);
}, [venuePlans]);

  const formatDateLong = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return iso;
    }
  };

  const formatDateShort = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return iso;
    }
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return '';
    }
  };

  const daysRemaining = (iso?: string | null) => {
    if (!iso) return null;
    try {
      const now = new Date();
      const target = new Date(iso);
      const diffMs = target.getTime() - now.getTime();
      const day = 1000 * 60 * 60 * 24;
      return Math.ceil(diffMs / day);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator animating size="large" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Paragraph style={{ marginTop: 40, textAlign: 'center' }}>
          Événement non trouvé
        </Paragraph>
      </SafeAreaView>
    );
  }
const time = formatTime(event.date);
const dateLong = formatDateLong(event.date);
  const dateShort = formatDateShort(event.date);
  // const days = daysRemaining(event.date);
  // const daysLabel =
  // days == null
  //     ? null
  //     : days > 1
  //     ? `${days} jours`
  //     : days === 1
  //     ? `Demain`
  //     : days === 0
  //     ? "Aujourd'hui"

  //     : 'Terminé';
      // Calcul du label des jours restants
        const days = daysRemaining(event.date);

        let daysLabel: string | null = null;

        if (days !== null) {
          if (days > 1) daysLabel = `${days} jours`;
          else if (days === 1) daysLabel = 'Demain';
          else if (days === 0) daysLabel = "Aujourd'hui";
          else daysLabel = 'Terminé';
        }

      

      return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header avec bouton retour et titre */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
        >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {event.name}
        </Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        >
        {/* Carte principale de l'événement */}
        <Animated.View 
          style={[
            { width: cardWidth },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
          >
          <Card style={[styles.card, { width: cardWidth }]} elevation={4}>
            {event.image_url && (
              <View style={{ overflow: 'hidden', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <Image
                  source={{ uri: event.image_url }}
                  style={[
                    styles.image,
                    { width: cardWidth },
                    imageHeight ? { height: imageHeight } : { height: 200 },
                  ]}
                  resizeMode="cover"
                  onError={() => {
                    setImageFailed(true);
                    setImageHeight(180);
                  }}
                  />
                <View style={styles.imageOverlay} />
                
                {/* Badge jours restants
                {daysLabel && (
                  <View style={[
                    styles.daysBadge,
                    days === 0 && styles.todayBadge,
                    days < 0 && styles.expiredBadge
                  ]}>
                    <Text style={styles.daysBadgeText}>{daysLabel}</Text>
                  </View>
                )}
              </View> */}
              {/* Badge jours restants */}
              {daysLabel && (
                <View
                  style={[
                    styles.daysBadge,
                    days !== null && days === 0 && styles.todayBadge,
                    days !== null && days < 0 && styles.expiredBadge,
                  ]}
                >
                  <Text style={styles.daysBadgeText}>{daysLabel}</Text>
                </View>
              )}
            </View>
            )}

            <Card.Content style={styles.cardContent}>
              <View style={styles.titleRowMain}>
                <View style={styles.titleLeft}>
                  <Text variant="titleLarge" style={styles.eventName}>
                    {event.name}
                  </Text>
                  {/* <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="calendar-month" size={16} color="#666" />
                    <Text style={styles.metaText}>{dateShort}</Text>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={16}
                      color="#666"
                      style={{ marginLeft: 12 }}
                    />
                    
                  </View> */}
                </View>
                <View style={styles.timePill}>
                  <MaterialCommunityIcons name="clock-time-four-outline" size={14} color="#fff" />
                  <Text style={styles.timePillText}>{time}</Text>
                </View>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Paragraph style={styles.description}>{event.description}</Paragraph>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="calendar-clock" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{dateLong}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailLabel}>Heure</Text>
                  <Text style={styles.detailValue}>{time}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailLabel}>Lieu</Text>
                  <Text style={styles.detailValue}>{event.location_name}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Section Plan de Salle - SEULEMENT L'IMAGE */}
        {venuePlans.length > 0 && (
  <Animatable.View
    animation="fadeInUp"
    duration={600}
    delay={200}
    style={{ width: cardWidth, marginBottom: 20 }}
  >
    <Card style={[styles.pricingCard, { width: cardWidth }]} elevation={3}>
      <Card.Content style={styles.cardContentNoPadding}> 
        {/* Added specific style to remove padding for the map if desired, or keep standard padding */}
        
        <View style={[styles.venuePlanSectionHeader, { marginTop: 20 }]}>
          <MaterialCommunityIcons name="map" size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.pricingTitle}>
            Plan de Salle
          </Text>
        </View>

        {venuePlans.slice(venuePlans.length - 1).map((plan) => {
          const metaRaw = plan.metadata ?? plan;
          // specific parsing logic
          const meta = typeof metaRaw === 'string' 
            ? (() => { try { return JSON.parse(metaRaw); } catch { return null; } })() 
            : metaRaw;
          
          const layout = metaRaw as unknown as SeatingLayout;

          // Define fixed dimensions for the map container
          const CONTAINER_HEIGHT = 450; 
          // Adjust width to account for Card padding if necessary, or use full cardWidth
          const MAP_WIDTH = cardWidth; 

//           const labelSections = useMemo(
//           () => (Array.isArray(layout?.sections) ? layout.sections.filter(s => s.type === 'label') : []),
//           [layout?.sections]
//         );

//           const categoriesMemo = useMemo(
//   () => buildCategories(labelSections as LabelItem[], priceTiers),
//   [labelSections, priceTiers]
// );

          return (
            <View key={plan.id} style={{ width: '100%' }}>
              
              {/* CONTAINER VIEW: Must have fixed height */}
              <View style={{ 
                height: CONTAINER_HEIGHT, 
                width: '100%',
                backgroundColor: '#f5f5f5', // Light background to see boundaries
                overflow: 'hidden', // Ensures map doesn't bleed out of card radius
                borderRadius: 8,
                marginVertical: 10
              }}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <SeatingMap
                      rawLayout={layout}
                      containerWidth={MAP_WIDTH}
                      containerHeight={CONTAINER_HEIGHT}
                      reservedSeatIds={reservedSeatIds}
                      onSeatPress={(seat) => console.log("seat pressed", seat.id)}
                     onSelectionChange={handleSelectionChange}
                    />
                </GestureHandlerRootView>
              </View>

              {/* Legend and Bill */}
              <View style={{ paddingHorizontal: 10 }}>
                
                <PriceLegendCompact tiers={priceTiers} categories={ buildCategories(layout?.sections, priceTiers)  ?? []} />
                <SelectedSeatsBill
                  seats={selection}
                  currency="MGA"
                  feeRate={0}
                  taxRate={0}
                  onCheckout={handleBilling}
                />
              </View>
            </View>
          );
        })}
      </Card.Content>
    </Card>
  </Animatable.View>
)}

        {/* Section Réservation */}
        {/* <Animatable.View 
          animation="fadeInUp" 
          duration={600} 
          delay={300} 
          style={{ width: cardWidth, marginBottom: 30 }}
        >
          <Card style={[styles.pricingCard, { width: cardWidth }]} elevation={3}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.pricingTitle}>
                Réserver des places
              </Text>
              <Paragraph style={styles.bookingDescription}>
                Choisissez le type de ticket et la quantité lors de la réservation
              </Paragraph>
              
              <Button
                mode="contained"
                onPress={handleSelectTicketType}
                style={styles.bookButton}
                icon="ticket-confirmation"
                contentStyle={styles.bookButtonContent}
              >
                Choisir les tickets
              </Button>
            </Card.Content>
          </Card>
        </Animatable.View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  cardContentNoPadding: {
    padding: 0, // Optional: if you want the map to touch the edges of the card
    paddingBottom: 20,
  },
   safe: { flex: 1, backgroundColor: "#fff" },
  center: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 40,
    flexGrow: 1, // CORRECTION IMPORTANTE: Permet au contenu de s'étendre
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerSpacer: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 20,
  },
  image: {
    backgroundColor: '#eee',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  daysBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  todayBadge: {
    backgroundColor: '#FF6B6B',
  },
  expiredBadge: {
    backgroundColor: '#95a5a6',
  },
  daysBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  titleRowMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleLeft: {
    flex: 1,
    paddingRight: 12,
  },
  eventName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    color: '#666',
    marginLeft: 6,
    fontSize: 14,
  },
  timePill: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  timePillText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  description: {
    color: '#555',
    lineHeight: 22,
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#ecf0f1',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
    textAlign: 'center',
  },
  pricingCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  venuePlanSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 15,
  },
  venuePlanImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingDescription: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  bookButton: {
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  bookButtonContent: {
    paddingVertical: 6,
  },
});