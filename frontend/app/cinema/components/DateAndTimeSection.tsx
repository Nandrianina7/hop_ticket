// components/DateAndTimeSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MovieSession } from '../types';

// import type { MovieSession } from "@/types/MovieSession";
// import type { MovieSession } from '../types';



const { width } = Dimensions.get('window');

// interface MovieSession {
//   id: number;
//   start_time: string;
//   end_time: string;
//   base_price: number | string; // Peut être number ou string
//   hall: {
//     id: number;
//     name: string;
//     screen_type: string;
//     base_price: number | string; // Peut être number ou string
//     cinema: {
//       id: number;
//       name: string;
//       city: string;
//     };
//   };
// }

interface DateAndTimeSectionProps {
  selectedSession: MovieSession | null;
  setSelectedSession: (session: MovieSession) => void;
  sessions: MovieSession[];
  theme: any;
  isDark?: boolean;
}

const DateAndTimeSection: React.FC<DateAndTimeSectionProps> = ({
  selectedSession,
  setSelectedSession,
  sessions,
  theme,
}) => {
  // Grouper les sessions par date
  const groupSessionsByDate = () => {
    const grouped: {[key: string]: MovieSession[]} = {};
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.start_time);
      const dateKey = sessionDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });
    
    return grouped;
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      isoDate: dateString
    };
  };

  // Formater l'heure pour l'affichage
 const formatTime = (dateString: string) => {
  // Matches either "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DDTHH:MM:SS" (keeps HH:MM)
  const m = dateString.match(/(?:T|\s)(\d{2}):(\d{2})/);
  if (m) return `${m[1]}:${m[2]}`;

  // Fallback: try Date only if regex fails
  const d = new Date(dateString);
  if (!isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return 'N/A';
};

  // CORRECTION : Convertir en nombre avant d'utiliser toFixed
  const calculatePrices = (session: MovieSession) => {
    // S'assurer que basePrice est un nombre
    const basePrice = Number(session.base_price || session.hall.base_price || 0);
    const standardPrice = basePrice;
    const vipPrice = basePrice * 1.5; // Prix VIP avec majoration de 50%
    
    return {
      standard: standardPrice.toFixed(2),
      vip: vipPrice.toFixed(2)
    };
  };

  const groupedSessions = groupSessionsByDate();
  const dates = Object.keys(groupedSessions).sort();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
        Date & Heure
      </Text>
      
      {/* Dates */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScrollView}>
        <View style={styles.datesContainer}>
          {dates.map((dateKey) => {
            const dateInfo = formatDate(dateKey);
            const isSelected = selectedSession && 
              new Date(selectedSession.start_time).toISOString().split('T')[0] === dateKey;
            
            return (
              <TouchableOpacity
                key={dateKey}
                style={[
                  styles.dateItem,
                  { backgroundColor: theme.colors.surfaceVariant },
                  isSelected && [styles.dateItemSelected, { backgroundColor: theme.colors.primary }]
                ]}
                onPress={() => {
                  // Sélectionner la première session de cette date par défaut
                  if (groupedSessions[dateKey].length > 0) {
                    setSelectedSession(groupedSessions[dateKey][0]);
                  }
                }}
              >
                <Text style={[
                  styles.dateDay,
                  { color: theme.colors.onSurfaceVariant },
                  isSelected && [styles.dateTextSelected, { color: theme.colors.onPrimary }]
                ]}>
                  {dateInfo.day}
                </Text>
                <Text style={[
                  styles.dateNumber,
                  { color: theme.colors.onSurfaceVariant },
                  isSelected && [styles.dateTextSelected, { color: theme.colors.onPrimary }]
                ]}>
                  {dateInfo.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      {/* Heures pour la date sélectionnée */}
      {selectedSession && (
        <View style={styles.timesSection}>
          <Text style={[styles.timesLabel, { color: theme.colors.onSurfaceVariant }]}>
            Heures disponibles
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timesScrollView}>
            <View style={styles.timesContainer}>
              {groupedSessions[new Date(selectedSession.start_time).toISOString().split('T')[0]]
                ?.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((session) => {
                  const isSelected = selectedSession.id === session.id;
                  const prices = calculatePrices(session);
                  
                  return (
                    <TouchableOpacity
                      key={session.id}
                      style={[
                        styles.timeItem,
                        { backgroundColor: theme.colors.surfaceVariant },
                        isSelected && [styles.timeItemSelected, { backgroundColor: theme.colors.primary }]
                      ]}
                      onPress={() => setSelectedSession(session)}
                    >
                      <Text style={[
                        styles.timeText,
                        { color: theme.colors.onSurfaceVariant },
                        isSelected && [styles.timeTextSelected, { color: theme.colors.onPrimary }]
                      ]}>
                        {session.start_time ? formatTime(session.start_time) : 'N/A'}
                      </Text>
                      {/* Affichage des prix */}
                      <View style={styles.pricesContainer}>
                        <Text style={[
                          styles.priceText,
                          { color: theme.colors.onSurfaceVariant },
                          isSelected && [styles.priceTextSelected, { color: theme.colors.onPrimary }]
                        ]}>
                          VIP: {prices.vip}MGA
                        </Text>
                        <Text style={[
                          styles.priceText,
                          { color: theme.colors.onSurfaceVariant },
                          isSelected && [styles.priceTextSelected, { color: theme.colors.onPrimary }]
                        ]}>
                          Standard: {prices.standard}MGA
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { 
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 12, 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  datesScrollView: {
    marginBottom: 16,
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateItem: {
    minWidth: 70,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  dateItemSelected: {},
  dateDay: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateTextSelected: {},
  timesSection: {
    marginTop: 8,
  },
  timesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  timesScrollView: {
    marginBottom: 8,
  },
  timesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeItem: {
    minWidth: 120,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  timeItemSelected: {},
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeTextSelected: {},
  pricesContainer: {
    alignItems: 'center',
  },
  priceText: {
    fontSize: 10,
    fontWeight: '400',
  },
  priceTextSelected: {
    fontSize: 10,
  },
});

export default DateAndTimeSection;