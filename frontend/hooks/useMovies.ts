// hooks/useMovies.ts
import { useState, useEffect } from 'react';
import { axiosInstance } from '../utils/api';
import { Movie } from '../app/cinema/types';

interface UseMoviesOptions {
  genre?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  tab?: 'popular' | 'today' | 'tomorrow';
}

export const useMovies = (options: UseMoviesOptions = {}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMovies = async (reset: boolean = false, page: number = 1) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      }

      const params: any = {
        page: page,
        page_size: options.pageSize || 20
      };

      // Filtrage par genre
      if (options.genre && options.genre !== 'Tous') {
        params.genre = options.genre;
      }

      if (options.search) {
        params.search = options.search;
      }

      // Correction: utiliser le bon paramètre pour les onglets
      if (options.tab) {
        if (options.tab === 'popular') {
          params.tab = 'popular';
        } else {
          params.date_filter = options.tab; // 'today' ou 'tomorrow'
        }
      }

      console.log('Fetching movies with params:', params);

      const response = await axiosInstance.get('/cinema/movies/', { params });
      
      let moviesData = response.data.results || response.data || [];
      
      console.log(`Received ${moviesData.length} movies from API`);
      console.log('Movies data sample:', moviesData.slice(0, 2));
      
      // S'assurer que chaque film a une propriété sessions
      const moviesWithSessions = moviesData.map((movie: any) => ({
        ...movie,
        sessions: movie.sessions || [],
        // Ajouter des propriétés par défaut pour éviter les erreurs
        poster: movie.poster || null,
        genre: movie.genre || '',
        duration: movie.duration || 0,
        session_count: movie.session_count || 0
      }));
      
      if (reset) {
        setMovies(moviesWithSessions);
      } else {
        setMovies(prev => [...prev, ...moviesWithSessions]);
      }
      
      setHasMore(!!response.data.next); 
      setError(null);
      
    } catch (err: any) {
      console.error('Error fetching movies:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des films');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(true, 1);
  }, [options.genre, options.search, options.tab]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchMovies(false, nextPage);
    }
  };

  const refresh = async () => {
    await fetchMovies(true, 1);
  };

  return {
    movies,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};