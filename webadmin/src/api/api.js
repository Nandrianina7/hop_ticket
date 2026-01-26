import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('access_token='))
    ?.split('=')[1];

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalReq = error.config;

    if (error.response?.status !== 401 || originalReq._retry) {
      return Promise.reject(error);
    }

    originalReq._retry = true;

    try {
      await api.post('/accounts/token_refresh/');
      return api(originalReq);
    } catch (err) {
      window.location.href = '/';
      return Promise.reject(err);
    }
  }
);


export default api;
