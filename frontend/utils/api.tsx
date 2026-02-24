// utils/api.tsx
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// export const API_BASE_URL = 'http://10.252.50.94:8090';
// export const API_BASE_URL = 'http://127.0.0.1:8000';// Types pour les résultats de recherche
// export const API_BASE_URL = 'http://192.168.1.140:8000';// Types pour les résultats de recherche
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BACK_URL;

export type SearchResult = {
  id: number;
  name: string;
  venue?: string;
  date?: string;
  image_url?: string;
  type: 'event' | 'venue' | 'date' | 'year';
};

export type RegisterData = {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  password: string;
};

// Type pour les plans de salle
export type VenuePlan = {
  id: number;
  name: string;
  venue: string;
  image_url?: string;
  capacity?: number;
};

export type VenuePlans = {
  id: number;
  site_name: string;
  elements: any[];
  metadata: any;
  created_at: string;
};

// Création de l'instance Axios
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEventLocation = async () =>{

    try {
    const response = await axios.get(`${API_BASE_URL}/api/future/event-locations/`);
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }

}

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/accounts/mobile/login/`, {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};
export const fcmTokenInsertion = async (customer_id: string, fcmToken: string) => {
  try {
   const response =await axiosInstance.post("/api/save-fcm-token/",
    {
      user_id: customer_id,
     token: fcmToken,
     device_type: Platform.OS
    }
  
);
    return response.data;
  } catch (error: any) {
    console.error('FCM Token error:', error.response?.data || error.message);
    throw error;
  }
};

// export const fcmTokenInsertion =

export interface CalendarItem {
  id: number;
  name: string;
  date: string;
  venue?: string;
  image_url?: string;
  type: 'event' | 'movie';
  description?: string;
  session_id?: number;
}

export interface CalendarData {
  [date: string]: CalendarItem[];
}

export const registerUser = async (userData: {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  password: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/accounts/mobile/register/`, userData);
    return response.data;
  } catch (error: any) {
    console.error('Register error:', error.response?.data || error.message);
    throw error;
  }
};


// Fonction pour obtenir le token d'accès
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('access_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Fonction pour rafraîchir le token
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.log('No refresh token found');
      return null;
    }

    console.log('Attempting token refresh with:', refreshToken);
    
    const { data } = await axios.post('http://192.168.1.149:8000/accounts/mobile/token/refresh/', {
      refresh_token: refreshToken,
    });

    console.log("Refresh response:", data);

    if (data.access_token) {
      await AsyncStorage.setItem('access_token', data.access_token);
      console.log('New access token stored');
      return data.access_token;
    }
    return null;
  } catch (e: any) {
    console.error('Refresh failed:', e.response?.data || e.message);
    // Clear invalid tokens
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    return null;
  }
};

// Intercepteur de requête amélioré
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with token:', token.substring(0, 20) + '...');
      console.log('Request URL:', config.url);
      console.log('Request headers:', config.headers);
    } else {
      console.log('No access token available for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse amélioré
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    console.error('Response error:', error.response?.status, error.config?.url);
    console.error('Error details:', error.response?.data);
    
    const originalReq = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;
      console.log('401 detected, attempting token refresh...');
      
      const newToken = await refreshAccessToken();

      if (newToken) {
        console.log('Retrying original request with new token');
        originalReq.headers = originalReq.headers || {};
        originalReq.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalReq);
      } else {
        console.warn("Refresh failed, redirecting to login");
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        return Promise.reject(new Error("Session expirée, veuillez vous reconnecter."));
      }
    }

    return Promise.reject(error);
  }
);

// --- Fonctions API exportées ---

export const fetchHomeEvents = async () => {
  const { data } = await axiosInstance.get(`/api/mobile/home-events/`);
  return data || { recent: [], old: [] };
};

export const fetchEvents = async (type: 'recent' | 'old' = 'recent', page: number = 1, pageSize: number = 10) => {
  const { data } = await axiosInstance.get(`/api/mobile/events/`, {
    params: { 
      type, 
      page,
      page_size: pageSize
    },
  });
  
  return data || { events: [], page: 1, has_more: false };
};

export const fetchEventById = async (id: number | string) => {
  const { data } = await axiosInstance.get(`/api/mobile/events/${id}/`);
  return data;
};

export const fetchMyTickets = async () => {
  const { data } = await axiosInstance.get('/api/mobile/my-tickets/');
  return data;
};

export const buyTicket = async (event_id: number, tier_id: number, seat_id: string, quantity: number = 1) => {
  const { data } = await axiosInstance.post('/api/mobile/buy-ticket/', {
    event_id,
    tier_id,
    quantity,
    seat_id
  });
  return data;
};

export const fetchReservedTickets = async (event_id: number) => {
  const { data } = await axiosInstance.get(`/api/mobile/tickets/seat-ids/${event_id}/`);
  return data;
}

export const checkDualUser = async () => {
  try {
    const res = await axiosInstance.get('/accounts/mobile/check_dual_user/');
    return res.data; 
  } catch (err: any) {
    console.error('checkDualUser error:', err?.response?.data ?? err.message ?? err);
    return { allowed: false, admin_exists: false, customer_exists: false, error: true };
  }
};

// Fonction de recherche corrigée
export const searchEvents = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await axiosInstance.get(`/cinema/mobile/search/?q=${encodeURIComponent(query)}`);
    return response.data.results || [];
  } catch (error: any) {
    console.error('Search API error:', error.response?.data || error.message);
    throw error;
  }
};
export const storeUser = async (user:{id:string,email:string,first_name:string,last_name:string,number:string}) =>
  {
    await AsyncStorage.setItem('user',JSON.stringify(user));
  }

export const getUser = async (): Promise<{id:string,email:string,first_name:string,last_name:string,number:string}| null> => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

// Fonctions supplémentaires utiles
export const storeAuthTokens = async (accessToken: string, refreshToken: string) => {
  try {
    await AsyncStorage.multiSet([
      ['access_token', accessToken],
      ['refresh_token', refreshToken]
    ]);
    console.log('Tokens stored successfully');
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw error;
  }
};

export const clearAuthTokens = async () => {
  try {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    console.log('Tokens cleared successfully');
  } catch (error) {
    console.error('Error clearing tokens:', error);
    throw error;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const previewTicket = async (qrData: string): Promise<any> => {
  try {
    const response = await axiosInstance.post('/api/mobile/preview-ticket/', {
      qr_data: qrData
    });
    return response.data;
  } catch (error: any) {
    console.error('Preview ticket error:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction existante modifiée pour la validation finale
export const validateTicket = async (qrData: string): Promise<any> => {
  try {
    const response = await axiosInstance.post('/api/mobile/validate-ticket/', {
      qr_data: qrData
    });
    return response.data;
  } catch (error: any) {
    console.error('Validate ticket error:', error.response?.data || error.message);
    throw error;
  }
};

export const likeEvent = async (eventId: number): Promise<{liked: boolean, likes_count: number}> => {
  try {
    const response = await axiosInstance.post(`/api/mobile/like-event/${eventId}/`);
    return response.data;
  } catch (error: any) {
    console.error('Like event error:', error.response?.data || error.message);
    throw error;
  }
};

export const rateEvent = async (eventId: number, rating: number): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/api/mobile/rate-event/${eventId}/`, {
      rating
    });
    return response.data;
  } catch (error: any) {
    console.error('Rate event error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchUsedTickets = async () => {
  const { data } = await axiosInstance.get('/api/mobile/used-tickets/');
  return data;
};

// Fonctions pour les tickets films
export const previewMovieTicket = async (qrData: string) => {
  const response = await axiosInstance.post('/cinema/preview-movie-ticket/', {
    qr_data: qrData
  });
  return response.data;
};

export const validateMovieTicket = async (qrData: string) => {
  const response = await axiosInstance.post('/cinema/validate-movie-ticket/', {
    qr_data: qrData
  });
  return response.data;
};

// Fonction pour récupérer le feed
export const fetchFeed = async (): Promise<{feed: any[], count: number}> => {
  try {
    const response = await axiosInstance.get('/cinema/feed/');
    return response.data;
  } catch (error: any) {
    console.error('Feed fetch error:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour liker un élément
export const likeItem = async (itemId: number, itemType: 'event' | 'movie'): Promise<{liked: boolean, likes_count: number}> => {
  try {
    const response = await axiosInstance.post(`/cinema/like/${itemType}/${itemId}/`);
    return response.data;
  } catch (error: any) {
    console.error('Like error:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour noter un événement
export const rateItem = async (itemId: number, rating: number): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/cinema/rate/${itemId}/`, {
      rating
    });
    return response.data;
  } catch (error: any) {
    console.error('Rating error:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour ajouter un commentaire
export const addComment = async (itemId: number, itemType: 'event' | 'movie', content: string, replyTo: number | null = null): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/cinema/${itemType}s/${itemId}/comments/`, {
      content,
      reply_to: replyTo
    });
    return response.data;
  } catch (error: any) {
    console.error('Comment error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchComments = async (itemId: number, itemType: 'event' | 'movie'): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(`/cinema/${itemType}s/${itemId}/comments/`);
    return response.data;
  } catch (error: any) {
    console.error('Fetch comments error:', error.response?.data || error.message);
    throw error;
  }
};

export const likeComment = async (commentId: number): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/cinema/comments/${commentId}/like/`);
    return response.data;
  } catch (error: any) {
    console.error('Like comment error:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour enregistrer/désenregistrer un élément
export const saveItem = async (itemId: number, itemType: 'event' | 'movie'): Promise<{saved: boolean}> => {
  try {
    const response = await axiosInstance.post(`/cinema/save/${itemType}/${itemId}/`);
    return response.data;
  } catch (error: any) {
    console.error('Save error:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour récupérer les éléments enregistrés
export const getSavedItems = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get('/cinema/saved-items/');
    return response.data.saved_items || [];
  } catch (error: any) {
    console.error('Get saved items error:', error.response?.data || error.message);
    throw error;
  }
};

// Fonctions pour les réservations de cinéma
export const createReservation = async (reservationData: {
  session: number;
  seats: string[];
  taxi_option?: any;
  food_items?: any[];
  payment_method?: string;
}) => {
  try {
    const response = await axiosInstance.post('/cinema/tickets/create/', reservationData);
    return response.data;
  } catch (error: any) {
    console.error('Create reservation error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchMovieSessions = async (movieId: string | number) => {
  try {
    const response = await axiosInstance.get(`/cinema/movies/${movieId}/sessions/`);
    return response.data;
  } catch (error: any) {
    console.error('Fetch movie sessions error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchSessionSeats = async (sessionId: string | number) => {
  try {
    const response = await axiosInstance.get(`/cinema/sessions/${sessionId}/seats/`);
    return response.data;
  } catch (error: any) {
    console.error('Fetch session seats error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchUserMovieTickets = async () => {
  try {
    const response = await axiosInstance.get('/cinema/user-tickets/');
    return response.data;
  } catch (error: any) {
    console.error('Fetch user tickets error:', error.response?.data || error.message);
    throw error;
  }
};

export const saveEvent = async (data :any) => {
  try {
    const response = await axiosInstance.post('/api/mobile/new/event_plan/', data);

      if (!response.data) {
        console.log('No response founded');
        return;
      }

      console.log('Successfully saved venue');
      return response.data;
    } catch (error: any) {
       console.error('Fetch user tickets error:', error.response?.data || error.message);
      throw error;
    }
  };

// Fonction pour récupérer les price tiers d'un événement (CORRIGÉE)
export const fetchEventPriceTiers = async (eventId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/api/mobile/event/${eventId}/price-tiers/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event price tiers:', error);
    throw error;
  }
};

// Fonction pour rechercher des plans de salle (CORRIGÉE)
export const searchVenuePlans = async (searchQuery: string = ''): Promise<VenuePlan[]> => {
  try {
    const response = await axiosInstance.get('/api/mobile/venue-plans/', {
      params: { search: searchQuery }
    });
    return response.data.venue_plans || [];
  } catch (error) {
    console.error('Error searching venue plans:', error);
    return [];
  }
};


// Dans api.tsx - Ajouter cette fonction
export const fetchVenuePlans = async (searchQuery: string = ''): Promise<VenuePlan[]> => {
  try {
    const response = await axiosInstance.get('/api/mobile/venue-plans/', {
      params: { search: searchQuery }
    });
    return response.data.venue_plans || [];
  } catch (error) {
    console.error('Error fetching venue plans:', error);
    return [];
  }
};
//  try {
//       const response = await api.get(`/api/event_plan/${site_name}`, { withCredentials: true });
//       return response.data;
//     } catch (error) {
//       console.log('Error fetching event plan:', error);
//       return null;
//     }
export const fetchEventPlans = async (searchQuery: string = ''): Promise<VenuePlans[]> => {
  try {
    const response = await axiosInstance.get(`/api/mobile/event_plans/`,{
      params:{search: searchQuery}
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching venue plans:', error);
    return [];
  }
};

export const fetchCalendarData = async (startDate?: string, endDate?: string): Promise<{
  success: boolean;
  calendar_data: CalendarData;
  total_items: number;
  dates_with_events: string[];
}> => {
  try {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axiosInstance.get('/cinema/calendar/', { params });
    return response.data;
 
  } catch (error: any) {
    console.error('Fetch calendar error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchDateItems = async (dateStr: string): Promise<{
  success: boolean;
  date: string;
  items: CalendarItem[];
  count: number;
}> => {
  try {
    const response = await axiosInstance.get(`/cinema/calendar/date/${dateStr}/`);
    return response.data;
  } catch (error: any) {
    console.error('Fetch date items error:', error.response?.data || error.message);
    throw error;
  }
};