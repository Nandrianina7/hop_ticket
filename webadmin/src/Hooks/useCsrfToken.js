import { useEffect, useState } from 'react';
import { getCookie } from '../utils/getCookie';
import axios from 'axios';
/**
 * @param url target url to get the csrf token if not present
 * @alias  a hooks to get csrf token
 */
export const useCsrfToken = (url) => {
  const [csrfToken, setCsrftoken] = useState(getCookie('csrftoken'));
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const token = getCookie('csrftoken');
    setCsrftoken(token);
    if (!token) {
      console.warn('No CSRF token found. Attempting to set it via request...');
      axios
        .get(`${apiUrl}/accounts/${url}`, { withCredentials: true })
        .then(() => {
          const newToken = getCookie('csrftoken');
          setCsrftoken(newToken);
          if (newToken) {
            console.log('CSRF token retrieved:', newToken);
            setError(null);
          } else {
            setError('Failed to retrieve CSRF token. Please refresh the page.');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch CSRF token:', err);
          setError('Cannot connect to server. Please try again.');
        });
    }
  }, []);

  return { csrfToken, error };
};
