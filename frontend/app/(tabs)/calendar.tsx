// app/calendar.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Image,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { axiosInstance, fetchCalendarData, fetchDateItems, CalendarItem } from '../../utils/api';

const { width } = Dimensions.get('window');

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasItems: boolean;
  items: CalendarItem[];
}

export default function CalendarScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<{[key: string]: CalendarItem[]}>({});
  const [selectedDayItems, setSelectedDayItems] = useState<CalendarItem[]>([]);
  const [dateItemsLoading, setDateItemsLoading] = useState(false);

  // Local date key helper (no UTC shift)
  const toLocalDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Charger les données du calendrier
  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      // Calculer le début et fin du mois courant pour le filtre
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const data = await fetchCalendarData(
        toLocalDateKey(firstDay),
        toLocalDateKey(lastDay)
      );
      
      if (data.success) {
        setCalendarData(data.calendar_data);
        // Charger les éléments de la date sélectionnée
        loadDateItems(selectedDate);
      } else {
        console.error('API returned error:', data.success);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les éléments d'une date spécifique
  const loadDateItems = async (date: Date) => {
    const dateStr = toLocalDateKey(date);
    setDateItemsLoading(true);
    
    try {
      // Vérifier d'abord si on a les données en cache
      if (calendarData[dateStr]) {
        setSelectedDayItems(calendarData[dateStr]);
      } else {
        // Sinon, faire un appel API
        const data = await fetchDateItems(dateStr);
        if (data.success) {
          setSelectedDayItems(data.items);
          // Mettre à jour le cache
          setCalendarData(prev => ({
            ...prev,
            [dateStr]: data.items
          }));
        }
      }
    } catch (error) {
      console.error('Error loading date items:', error);
      setSelectedDayItems([]);
    } finally {
      setDateItemsLoading(false);
    }
  };

  // Générer les jours du mois avec les données
  const generateMonthDays = (): CalendarDay[] => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay());
    
    const endDay = new Date(lastDay);
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDate = new Date();
    
    for (let day = new Date(startDay); day <= endDay; day.setDate(day.getDate() + 1)) {
      const date = new Date(day);
      const dateKey = toLocalDateKey(date);
      const items = calendarData[dateKey] || [];
      
      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === currentDate.toDateString(),
        hasItems: items.length > 0,
        items
      });
    }
    
    return days;
  };

  // Changer de mois
  const changeMonth = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
    loadCalendarData(); // Recharger les données pour le nouveau mois
  };

  // Sélectionner une date
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    await loadDateItems(date);
  };

  // Naviguer vers le détail
  const handleItemPress = (item: CalendarItem) => {
    if (item.type === 'event') {
      router.push(`/event/${item.id}`);
    } else {
      // Pour les films, on peut utiliser session_id si disponible
      const movieId = item.id;
      router.push(`/cinema/MovieDetailScreen?movieId=${movieId}`);
    }
  };

  // Obtenir l'image de fond pour une date
  const getDateBackgroundImage = (day: CalendarDay): string | null => {
    if (day.hasItems && day.items.length > 0) {
      // Prendre l'image du premier élément
      return day.items[0].image_url || null;
    }
    return null;
  };

  // Formater la date pour l'affichage
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Chargement du calendrier...
        </Text>
      </View>
    );
  }

  const monthDays = generateMonthDays();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête */}
    

      {/* Contrôles du mois */}
      <View style={[styles.monthSelector, styles.responsivePadding]}>
        <TouchableOpacity 
          onPress={() => changeMonth(-1)}
          style={styles.monthButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.monthTitle, { color: theme.colors.onBackground }]}>
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
        
        <TouchableOpacity 
          onPress={() => changeMonth(1)}
          style={styles.monthButton}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Jours de la semaine */}
      <View style={[styles.weekDays, styles.responsivePadding]}>
        {dayNames.map(day => (
          <Text 
            key={day}
            style={[styles.weekDayText, { color: theme.colors.onSurfaceVariant }]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Grille du calendrier */}
      <View style={[styles.calendarGrid, styles.responsivePadding]}>
        {monthDays.map((day, index) => {
          const isSelected = toLocalDateKey(day.date) === toLocalDateKey(selectedDate);
          const backgroundImage = getDateBackgroundImage(day);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.dayCellOtherMonth,
                day.isToday && [styles.dayCellToday, { borderColor: theme.colors.primary }],
                isSelected && [styles.dayCellSelected, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => handleDateSelect(day.date)}
            >
              {backgroundImage ? (
                <ImageBackground
                  source={{ uri: backgroundImage }}
                  style={styles.dayBackground}
                  imageStyle={styles.dayBackgroundImage}
                >
                  <View style={styles.dayOverlay}>
                    <Text style={[
                      styles.dayText,
                      { 
                        color: 'white',
                        fontWeight: 'bold',
                        textShadowColor: 'rgba(0, 0, 0, 0.8)',
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 2,
                      }
                    ]}>
                      {day.date.getDate()}
                    </Text>
                  </View>
                </ImageBackground>
              ) : (
                <Text style={[
                  styles.dayText,
                  { 
                    color: isSelected ? theme.colors.onPrimary : 
                           day.isCurrentMonth ? theme.colors.onBackground : theme.colors.onSurfaceVariant,
                    opacity: day.isCurrentMonth ? 1 : 0.5
                  }
                ]}>
                  {day.date.getDate()}
                </Text>
              )}
              
              {/* Indicateur d'éléments */}
              {day.hasItems && day.isCurrentMonth && !backgroundImage && (
                <View style={[
                  styles.itemsBadge,
                  { 
                    backgroundColor: isSelected ? theme.colors.onPrimary : theme.colors.primary
                  }
                ]}>
                  <Text style={[
                    styles.itemsBadgeText,
                    { 
                      color: isSelected ? theme.colors.primary : theme.colors.onPrimary
                    }
                  ]}>
                    {day.items.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Séparateur */}
      <View style={[styles.separator, { backgroundColor: theme.colors.outline }]} />

      {/* Éléments du jour sélectionné */}
      <View style={styles.itemsSection}>
        <Text style={[styles.itemsTitle, { color: theme.colors.onBackground }]}>
          {selectedDayItems.length} élément(s) pour le {formatDisplayDate(selectedDate)}
        </Text>

        <ScrollView 
          style={styles.itemsList}
          showsVerticalScrollIndicator={false}
        >
          {dateItemsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
                Chargement des événements...
              </Text>
            </View>
          ) : selectedDayItems.length === 0 ? (
            <View style={styles.noItems}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.noItemsText, { color: theme.colors.onSurfaceVariant }]}>
                Aucun événement ou film
              </Text>
              <Text style={[styles.noItemsSubtext, { color: theme.colors.onSurfaceVariant }]}>
                Sélectionnez une date avec du contenu
              </Text>
            </View>
          ) : (
            selectedDayItems.map((item, index) => (
              <TouchableOpacity
                key={`${item.type}-${item.id}-${index}`}
                style={[
                  styles.itemCard,
                  { 
                    backgroundColor: theme.colors.surface, 
                    borderColor: theme.colors.outline,
                    shadowColor: theme.colors.shadow || '#000',
                  }
                ]}
                onPress={() => handleItemPress(item)}
              >
                {/* Image de l'élément */}
                {item.image_url ? (
                  <Image 
                    source={{ uri: item.image_url }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.itemIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Ionicons 
                      name={item.type === 'event' ? 'ticket' : 'film'} 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                  </View>
                )}
                
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  
                  <View style={styles.itemMeta}>
                    <View style={styles.itemTypeBadge}>
                      <Ionicons 
                        name={item.type === 'event' ? 'ticket-outline' : 'film-outline'} 
                        size={12} 
                        color={theme.colors.onPrimary} 
                      />
                      <Text style={[styles.itemTypeText, { color: theme.colors.onPrimary }]}>
                        {item.type === 'event' ? 'Événement' : 'Film'}
                      </Text>
                    </View>
                    
                    {item.venue && (
                      <View style={styles.venueRow}>
                        <Ionicons name="location-outline" size={12} color={theme.colors.onSurfaceVariant} />
                        <Text style={[styles.itemVenue, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                          {item.venue}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={[styles.itemTime, { color: theme.colors.primary }]}>
                    {new Date(item.date).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  
                  {item.description && (
                    <Text 
                      style={[styles.itemDescription, { color: theme.colors.onSurfaceVariant }]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  )}
                </View>
                
                <Ionicons 
                  name="chevron-forward" 
                  size={16} 
                  color={theme.colors.onSurfaceVariant} 
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Bouton de rafraîchissement */}
      <TouchableOpacity 
        style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
        onPress={loadCalendarData}
      >
        <Ionicons name="refresh" size={20} color="white" />
        <Text style={styles.refreshButtonText}>Rafraîchir</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:60,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  
  // Header
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  responsiveHeaderTitle: {
    fontSize: width < 375 ? 20 : 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  responsivePadding: {
    paddingHorizontal: width < 375 ? 12 : 16,
  },
  
  // Month Selector
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  monthButton: {
    padding: 12,
    borderRadius: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Week Days
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginTop: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    opacity: 0.7,
  },
  
  // Calendar Grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    minHeight: 300,
  },
  dayCell: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellToday: {
    borderWidth: 2,
  },
  dayCellSelected: {
    // Style pour la date sélectionnée
  },
  dayBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBackgroundImage: {
    borderRadius: 12,
  },
  dayOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemsBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemsBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  
  // Separator
  separator: {
    height: 1,
    marginVertical: 20,
    marginHorizontal: 16,
    opacity: 0.3,
  },
  
  // Items Section
  itemsSection: {
    flex: 1,
    paddingBottom: 80, // Espace pour le bouton de rafraîchissement
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  
  // Item Card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  itemIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 6,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  itemTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#991d1d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  itemTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  itemVenue: {
    fontSize: 12,
    flex: 1,
  },
  itemTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },
  
  // Loading & Empty States
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  noItems: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 16,
  },
  noItemsText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  noItemsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  
  // Refresh Button
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});