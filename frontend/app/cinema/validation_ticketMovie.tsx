// app/validation_ticketMovie.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { validateMovieTicket } from '../../utils/api';

export default function ValidationMovieScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { qrData, previewData } = params;
  
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [ticketData, setTicketData] = useState<any>(null);

  useEffect(() => {
    if (previewData) {
      try {
        const data = JSON.parse(previewData as string);
        console.log('Parsed preview data:', data);
        setTicketData(data);
      } catch (error) {
        console.error('Error parsing preview data:', error);
        setValidationResult({
          success: false,
          message: 'Données de ticket invalides'
        });
      }
    }
  }, [previewData]);

  useEffect(() => {
    console.log('QR Data received:', ticketData);
  }, [ticketData]);

  const handleValidateTicket = async () => {
    if (!qrData) return;
    
    setLoading(true);
    try {
      const response = await validateMovieTicket(qrData as string);
      console.log('Validation response:', response);
      setValidationResult(response);
      
      if (response.success) {
        // Alert.alert('Succès', response.message, [
        //   { 
        //     text: 'OK', 
        //     onPress: () => router.replace('./scan_movie') 
        //   }
        // ]);
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      Alert.alert('Erreur', 'Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Si pas de données de ticket (mauvais QR code)
  if (!ticketData || (ticketData && !ticketData.success)) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <MaterialCommunityIcons 
          name="alert-circle" 
          size={40} 
          color="#F44336" 
        />
        <Text style={styles.title}>QR Code Invalide</Text>
        <Text style={styles.message}>
          {ticketData?.message || 'Ce QR code ne correspond pas à un ticket valide'}
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.errorButton]}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>Retour au scanner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Si validation déjà effectuée
  if (validationResult) {
    const isSuccess = validationResult.success;
    
    return (
      <View style={[styles.container, isSuccess ? styles.successContainer : styles.errorContainer]}>
        <MaterialCommunityIcons 
          name={isSuccess ? "check-circle" : "alert-circle"} 
          size={40} 
          color={isSuccess ? "#4CAF50" : "#F44336"} 
        />
        <Text style={styles.title}>
          {isSuccess ? 'Validation Réussie' : 'Échec de Validation'}
        </Text>
        <Text style={styles.message}>{validationResult.message}</Text>
        
        {validationResult && (
          <ScrollView style={styles.ticketInfo}>
            <Text style={styles.infoTitle}>Détails du Ticket Film</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Film:</Text>
              <Text style={styles.infoValue}>{validationResult.reservation.movie_title || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Séance:</Text>
              <Text style={styles.infoValue}>{formatDate(validationResult.reservation.session_time)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cinéma:</Text>
              <Text style={styles.infoValue}>{validationResult.reservation.cinema || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Salle:</Text>
              <Text style={styles.infoValue}>{validationResult.reservation.hall || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Numéro:</Text>
              <Text style={styles.infoValue}>{validationResult.reservation.reservation_code || 'N/A'}</Text>
            </View>

            {validationResult.reservation.customer_name && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Client:</Text>
                <Text style={styles.infoValue}>{validationResult.reservation.customer_name}</Text>
              </View>
            )}
          </ScrollView>
        )}

        <TouchableOpacity 
          style={[styles.button, isSuccess ? styles.successButton : styles.errorButton]}
          onPress={() => router.replace('./scan_movie')}
        >
          <Text style={styles.buttonText}>Retour au choix</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Affichage normal de prévisualisation
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name="ticket-confirmation" 
          size={60} 
          color="#2196F3" 
        />
      </View>

      <Text style={styles.title}>Confirmer la Validation</Text>
      <Text style={styles.subtitle}>Vérifiez les détails du ticket film avant validation</Text>

      {ticketData && (
        <ScrollView style={styles.ticketInfo}>
          <Text style={styles.infoTitle}>Détails du Ticket Film</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Film:</Text>
            <Text style={styles.infoValue}>{ticketData.reservation.movie_title || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Séance:</Text>
            <Text style={styles.infoValue}>{formatDate(ticketData.reservation.session_time)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cinéma:</Text>
            <Text style={styles.infoValue}>{ticketData.reservation.cinema || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Salle:</Text>
            <Text style={styles.infoValue}>{ticketData.reservation.hall || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Siege:</Text>
            <Text style={styles.infoValue}>{ticketData.reservation.seats || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Numéro:</Text>
            <Text style={styles.infoValue}>{ticketData.reservation.reservation_code || 'N/A'}</Text>
          </View>

          {ticketData.reservation.customer_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Client:</Text>
              <Text style={styles.infoValue}>{ticketData.reservation.customer_name}</Text>
            </View>
          )}
        </ScrollView>
      )}

      <Text style={styles.warning}>
        ⚠️ La validation est définitive. Le ticket sera marqué comme utilisé.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.validateButton]}
          onPress={handleValidateTicket}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Valider le Ticket</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  successContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  warning: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
    color: '#FF9800',
    fontStyle: 'italic',
  },
  ticketInfo: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 15,
    maxHeight: 400,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  infoValue: {
    color: '#666',
    textAlign: 'right',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    // flex: 1,
    padding: 15,
    borderRadius: 10,
    height: 10,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  validateButton: {
    backgroundColor: '#4CAF50',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  errorButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});