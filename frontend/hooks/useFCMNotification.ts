import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// 1. Configuration du handler (comment l'app réagit quand une notif arrive app ouverte)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Afficher l'alerte même si l'app est ouverte
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: false,
  }),
});

export function useFcmNotification() {
  const [fcmToken, setFcmToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setFcmToken(token);
      if (token) {
        console.log("✅ Token FCM récupéré :", token);
        // TODO : C'est ici que vous appelez votre API Django pour sauvegarder le token
        // await saveTokenToBackend(user.id, token);
      }
    });

    // Listener : Notification reçue (App au premier plan)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log("🔔 Notification reçue :", notification);
    });

    // Listener : Utilisateur clique sur la notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("👉 Notification cliquée :", response);
      // Ici vous pouvez gérer la navigation (ex: aller vers une page spécifique)
      // const data = response.notification.request.content.data;
      // router.push(data.screen);
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  return { fcmToken, notification };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Permission refusée pour les notifications !');
      return;
    }

    // ⚠️ POINT CRITIQUE ⚠️
    // Nous demandons le DevicePushToken, pas le ExpoPushToken.
    // C'est ce token que Firebase comprend.
    try {
        const tokenData = await Notifications.getDevicePushTokenAsync();
        token = tokenData.data;
    } catch (e) {
        console.error("Erreur récupération Device Token:", e);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}