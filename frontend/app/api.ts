// app/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.1.198:8000', // Ex: 192.168.1.100:8000
});

// ➤ Ajouter le token d'accès automatiquement
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ➤ Rafraîchir le token automatiquement si erreur 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = await AsyncStorage.getItem('refresh');
      try {
        const response = await axios.post('http://192.168.1.198:8000/accounts/mobile/token/refresh/', {
          refresh: refresh,
        });

        const newAccess = response.data.access;
        await AsyncStorage.setItem('access', newAccess);
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (err) {
        await AsyncStorage.removeItem('access');
        await AsyncStorage.removeItem('refresh');
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
