// hooks/useMovieDetail.tsx - Version complète
import { useState, useEffect } from 'react';
import { axiosInstance } from '../utils/api';

export const useMovieDetail = (movieId: number) => {
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/cinema/movies/${movieId}/`);
        const movieData = response.data;
        
        // Formater la durée
        movieData.duration_formatted = formatDuration(movieData.duration);
        
        setMovie(movieData);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erreur lors du chargement du film');
        console.error('Error fetching movie detail:', err);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieDetail();
    }
  }, [movieId]);

  return { movie, loading, error };
};

export const useMovieSessions = (movieId: number) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/cinema/movies/${movieId}/sessions/`);
        setSessions(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erreur lors du chargement des sessions');
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchSessions();
    }
  }, [movieId]);

  return { sessions, loading, error };
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}min`;
};