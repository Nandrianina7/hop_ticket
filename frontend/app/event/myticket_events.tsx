// app/myticket.tsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  Card,
  Button,
  Portal,
  Modal,
  ActivityIndicator,
  Text,
  List,
  Divider,
  useTheme,
  Avatar,
} from 'react-native-paper';
import { Tabs, TabScreen } from 'react-native-paper-tabs';
import QRCode from 'react-native-qrcode-svg';
import { fetchMyTickets, fetchUsedTickets } from '../../utils/api';
import { useRouter } from 'expo-router';
// import { RefreshContext } from '../(tabs)/_layout';
import { Ionicons } from '@expo/vector-icons';      
import { RefreshContext } from '../tabLayout';

type TicketAPI = {
  id: number;
  title?: string | null;
  event_date?: string | null;
  ticket_number?: string | string;
  seat_id?: string | null;
  event_detail_url?: string | null;
  qr_data?: string | null;
  event_id?: number | null;
  event_name?: string | null;
  event_image?: string | null;
  venue?: string | null;
  event_venue?: string | null;
  location?: string | null;
  place?: string | null;
  lieu?: string | null;
  seat?: string | null;
  gate?: string | null;
  is_used?: boolean;
};

export default function MyTicketsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { setRefreshTickets } = useContext(RefreshContext);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Actifs, 1: Historique

  const [tickets, setTickets] = useState<TicketAPI[]>([]);
  const [usedTickets, setUsedTickets] = useState<TicketAPI[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUsed, setLoadingUsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [expandedUsedIds, setExpandedUsedIds] = useState<Record<string, boolean>>({});

  // Fonction pour rafraîchir les tickets actifs
  const refreshTickets = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const data = await fetchMyTickets();
      const list = Array.isArray(data) ? data : data?.results ?? [];
      setTickets(list);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erreur lors du chargement des tickets');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Fonction pour charger les tickets utilisés (historique)
  const loadUsedTickets = async () => {
    setLoadingUsed(true);
    try {
      const data = await fetchUsedTickets();
      const list = Array.isArray(data) ? data : data?.results ?? [];
      setUsedTickets(list);
    } catch (err: any) {
      console.error('Erreur historique:', err);
    } finally {
      setLoadingUsed(false);
    }
  };

  // Enregistrer la fonction de rafraîchissement dans le contexte
  useEffect(() => {
    setRefreshTickets(() => refreshTickets);
  }, [setRefreshTickets]);

  useEffect(() => {
    refreshTickets();
  }, []);

  useEffect(() => {
    console.log('Tickets actifs:', tickets);
  }, [tickets]);

  // Charger les tickets utilisés quand on change d'onglet
  useEffect(() => {
    if (activeTab === 1 && usedTickets.length === 0) {
      loadUsedTickets();
    }
  }, [activeTab, usedTickets.length]);

  // Groupement des tickets actifs
  const grouped = useMemo(() => {
    const map: Record<string, {
      key: string;
      eventId?: number | null;
      eventName?: string | null;
      eventImage?: string | null;
      tickets: TicketAPI[];
    }> = {};

    tickets.forEach((t, idx) => {
      const key = t.event_id != null
        ? `event_${t.event_id}`
        : t.event_name
          ? `ename_${t.event_name}`
          : `other_${idx}`;
      const name = t.event_name ?? t.title ?? 'Événement';
      if (!map[key]) {
        map[key] = {
          key,
          eventId: t.event_id,
          eventName: name,
          eventImage: t.event_image,
          tickets: [],
        };
      }
      map[key].tickets.push(t);
    });
    return Object.values(map);
  }, [tickets]);

  // Groupement des tickets utilisés
  const groupedUsed = useMemo(() => {
    const map: Record<string, {
      key: string;
      eventId?: number | null;
      eventName?: string | null;
      eventImage?: string | null;
      tickets: TicketAPI[];
    }> = {};

    usedTickets.forEach((t, idx) => {
      const key = t.event_id != null
        ? `used_event_${t.event_id}`
        : t.event_name
          ? `used_ename_${t.event_name}`
          : `used_other_${idx}`;
      const name = t.event_name ?? t.title ?? 'Événement';
      if (!map[key]) {
        map[key] = {
          key,
          eventId: t.event_id,
          eventName: name,
          eventImage: t.event_image,
          tickets: [],
        };
      }
      map[key].tickets.push(t);
    });
    return Object.values(map);
  }, [usedTickets]);

  const toggleAccordion = (key: string) =>
    setExpandedIds((p) => ({ ...p, [key]: !p[key] }));

  const toggleUsedAccordion = (key: string) =>
    setExpandedUsedIds((p) => ({ ...p, [key]: !p[key] }));

  // formatage date en français
  const formatDate = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return iso;
    }
  };

  const daysRemaining = (iso?: string | null) => {
    if (!iso) return null;
    try {
      const now = new Date();
      const target = new Date(iso);
      const diffMs = target.getTime() - now.getTime();
      const day = 1000 * 60 * 60 * 24;
      const days = Math.ceil(diffMs / day);
      return days;
    } catch {
      return null;
    }
  };

  // police cible : "French Script MT"
  const titleFontFamily = Platform.select({
    ios: 'FrenchScriptMT',
    android: 'FrenchScriptMT',
    default: 'System',
  });

  const renderTicketCard = ({ item, isUsed = false }: { item: TicketAPI, isUsed?: boolean }) => {
    const bgUri = item.event_image ?? undefined;
    const venue = item.event_venue ?? item.venue ?? item.location ?? item.place ?? item.lieu ?? 'Lieu non précisé';
    const formattedDate = formatDate(item.event_date);
    const days = daysRemaining(item.event_date);
    const daysLabel =
      days == null ? null : days > 1 ? `${days} j` : days === 1 ? `1 j` : days === 0 ? `Aujourd'hui` : `Terminé`;

    return (
      <Card style={[styles.ticketCard, isUsed && styles.usedTicketCard]} elevation={3}>
        <View style={styles.ticketRow}>
          {/* LEFT: decorative image only */}
          <ImageBackground
            source={bgUri ? { uri: bgUri } : undefined}
            style={styles.leftDecor}
            resizeMode="cover"
          >
            <View style={[styles.leftDecorOverlay, isUsed && styles.usedOverlay]} />
            {isUsed && (
              <View style={styles.usedBadge}>
                <Text style={styles.usedBadgeText}>UTILISÉ</Text>
              </View>
            )}
          </ImageBackground>

          {/* separator with "perforation" */}
          <View style={styles.separatorContainer}>
            <View style={styles.notches}>
              {Array.from({ length: 10 }).map((_, i) => (
                <View key={i} style={styles.notch} />
              ))}
            </View>
            <View style={styles.dashedLine} />
          </View>

          {/* RIGHT: infos */}
          <View style={styles.rightSection}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.eventTitle, { fontFamily: titleFontFamily } as any]}
                numberOfLines={2}
              >
                {item.event_name ?? item.title ?? `Ticket #${item.ticket_number ?? item.id}`}
              </Text>
              {daysLabel && !isUsed ? (
                <View style={styles.daysBadge}>
                  <Text style={styles.daysBadgeText}>{daysLabel}</Text>
                </View>
              ) : null}
              {isUsed && (
                <View style={styles.usedIndicator}>
                  <Text style={styles.usedIndicatorText}>✓ Utilisé</Text>
                </View>
              )}
            </View>

            <Text style={styles.eventDate}>{formattedDate}</Text>
            <Text >
              {item.seat_id ? `Siège : ${item.seat_id}` : ''}
            </Text>

            <Text style={styles.eventVenue} numberOfLines={1}>
               📌 {venue}
            </Text>

            <View style={styles.rightBottomRow}>
              <View style={styles.numberAndArea}>
                <Text style={styles.ticketNumberBig}>TICKET N° : {item.ticket_number ?? item.id}</Text>
              </View>

              {!isUsed && (
                <Button
                  style={styles.qrButton}
                  mode="contained"
                  compact
                  onPress={() => setSelectedTicket(item)}
                >
                  Voir le QR
                </Button>
              )}
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderTicketsList = (ticketGroups: any[], isUsed = false) => (
    
    <ScrollView 
      contentContainerStyle={styles.ticketsContainer}
      refreshControl={
        !isUsed ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshTickets}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
    >
      {ticketGroups.map((g) => (
        <View key={g.key} style={styles.groupWrapper}>
          <List.Section>
            <List.Accordion
              title={`${g.eventName ?? 'Événement'} (${g.tickets.length})`}
              left={(props) =>
                g.eventImage ? (
                  <Avatar.Image
                    size={40}
                    source={{ uri: g.eventImage }}
                    style={{ marginRight: 6 }}
                  />
                ) : (
                  <List.Icon {...props} icon="ticket-outline" />
                )
              }
              expanded={!!(isUsed ? expandedUsedIds[g.key] : expandedIds[g.key])}
              onPress={() => isUsed ? toggleUsedAccordion(g.key) : toggleAccordion(g.key)}
            >
              <View style={styles.groupActions}>
                {g.eventId && (
                  <Button
                    mode="text"
                    onPress={() => router.push(`/event/${g.eventId}`)}
                  >
                    Voir l&lsquo;événement
                  </Button>
                )}
                {!isUsed && g.tickets.length > 0 && (
                  <Button
                    mode="text"
                    onPress={() => setSelectedTicket(g.tickets[0])}
                  >
                    Ouvrir QR du 1er
                  </Button>
                )}
              </View>

              <Divider />
              <FlatList
                data={g.tickets}
                keyExtractor={(t) => String(t.id)}
                renderItem={({ item }) => renderTicketCard({ item, isUsed })}
                scrollEnabled={false}
                contentContainerStyle={{ paddingTop: 8 }}
              />
            </List.Accordion>
          </List.Section>
        </View>
      ))}
      
      {ticketGroups.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {isUsed ? 'Aucun ticket utilisé' : 'Aucun ticket actif'}
          </Text>
        </View>
      )}
    </ScrollView>
  );

  // Afficher le loader seulement si c'est le chargement initial ET pas de refresh en cours
  if (loading && !refreshing && activeTab === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  if (error && activeTab === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ textAlign: 'center', color: theme.colors.error, marginBottom: 16 }}>
          {error}
        </Text>
        <Button mode="contained" onPress={refreshTickets}>
          Réessayer
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.onBackground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>Mes Tickets</Text>
          <View style={{ width: 24 }} />
        </View>
      <Tabs
        style={styles.tabsContainer}
        // Utilisez stateIndex et onChangeIndex selon la version de react-native-paper-tabs
        // Certaines versions utilisent des props différentes
        // Essayez ces différentes options selon votre version :
        // stateIndex={activeTab}
        // onIndexChange={setActiveTab}
        // Ou :
        // selectedIndex={activeTab}
        // onSelect={setActiveTab}
        // Ou :
        // value={activeTab}
        // onChange={setActiveTab}
        mode="scrollable"
      >
        <TabScreen label="Mes Tickets" icon="ticket">
          <View style={{ flex: 1 }}>
            {renderTicketsList(grouped, false)}
          </View>
        </TabScreen>
        <TabScreen label="Historique" icon="history">
          <View style={{ flex: 1 }}>
            {loadingUsed ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
              </View>
            ) : (
              renderTicketsList(groupedUsed, true)
            )}
          </View>
        </TabScreen>
      </Tabs>

      <Portal>
        <Modal
          visible={!!selectedTicket}
          onDismiss={() => setSelectedTicket(null)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {selectedTicket && (
            <View style={styles.qrWrapper}>
              <Text style={{ marginBottom: 12, fontWeight: '700' }}>
                {selectedTicket.event_name ??
                  selectedTicket.title ??
                  `Ticket ${selectedTicket.ticket_number ?? selectedTicket.id}`}
              </Text>

              <View style={styles.modalDetails}>
                <Text style={styles.modalDetailText}>
                  {formatDate(selectedTicket.event_date)}
                </Text>

                <Text style={styles.modalDetailText}>
                  {selectedTicket.seat_id ? `Siège : ${selectedTicket.seat_id}` : 'Siège : Non précisé'}
                </Text>
               
                <Text style={styles.modalDetailText}>
                  {selectedTicket.event_venue ?? selectedTicket.venue ?? selectedTicket.location ?? selectedTicket.place ?? selectedTicket.lieu ?? ''}
                </Text>
                <Text style={styles.modalDetailSmall}>Numéro : {selectedTicket.ticket_number ?? selectedTicket.id}</Text>
              </View>

              <View style={styles.qrBox}>
                <QRCode
                  value={String(selectedTicket.qr_data ?? selectedTicket.id)}
                  size={220}
                />
              </View>

              <Button
                mode="contained"
                style={styles.closeButton}
                onPress={() => setSelectedTicket(null)}
              >
                Fermer
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },  
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
  },

  tabsContainer: {
    flex: 1,
  },
  ticketsContainer: { 
    padding: 12, 
    paddingBottom: 32,
    flexGrow: 1,
  },
  groupWrapper: { 
    marginBottom: 12, 
    borderRadius: 10, 
    overflow: 'hidden' 
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },

  ticketCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  usedTicketCard: {
    opacity: 0.8,
    backgroundColor: '#f5f5f5',
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 120,
  },

  // LEFT decorative image column
  leftDecor: {
    flex: 1,
    minHeight: 120,
    position: 'relative',
  },
  leftDecorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  usedOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  usedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  usedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // separator perforation container
  separatorContainer: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  notches: {
    width: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
  },
  notch: {
    width: 8,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 1,
  },
  dashedLine: {
    flex: 1,
    height: '75%',
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    marginLeft: 6,
  },

  // RIGHT info column
  rightSection: {
    flex: 2,
    padding: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  eventTitle: {
    color: '#111',
    fontWeight: '800',
    fontSize: 20,
    flex: 1,
    marginRight: 8,
  },
  daysBadge: {
    marginLeft: 8,
    backgroundColor: '#2c1217ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  daysBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  usedIndicator: {
    marginLeft: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usedIndicatorText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  eventDate: {
    color: '#444',
    fontSize: 13,
    marginTop: 6,
  },
  eventVenue: {
    color: '#302828ff',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '900',
    maxWidth: width - 100,
  },

  rightBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  numberAndArea: {
    flex: 1,
    marginRight: 8,
    alignItems: 'flex-start',
  },
  ticketNumberBig: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111',
  },

  qrButton: {
    backgroundColor: '#000000ff',
  },

  // Modal
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  qrWrapper: { alignItems: 'center' },
  modalDetails: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDetailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  modalDetailSmall: {
    fontSize: 12,
    color: '#444',
    marginBottom: 8,
  },
  qrBox: { 
    padding: 16, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 12 
  },
  closeButton: { 
    marginTop: 12 
  },
});