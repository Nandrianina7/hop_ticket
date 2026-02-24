import { Box, Button, Chip, Paper, TextField, Tooltip, Snackbar, Alert } from '@mui/material';
import api from '../../api/api';
import MoviesForm from '../../components/Home/Movies/MovieForm';
import MovieSession from '../../components/Home/Movies/MovieSession';
import React from 'react';
import MovieCard from '../../components/Home/Movies/MovieCard';
import { filterMovieByDate, filterMovieBySearch } from '../../utils/movies';
import { Add } from '@mui/icons-material';
import PromocodeForm from '../../components/Home/Promocode/PromocodeForm';

const MoviesPage = () => {
  const [openSession, setOpenSession] = React.useState(false);
  const [savedMovie, setSavedMovie] = React.useState(null);
  const [adminHallList, setAdminHallList] = React.useState([]);
  const [orgHallList, setOrgHallList] = React.useState([]);
  const [movieList, setMovieList] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [filterType, setfilterType] = React.useState('Tous');
  const [openForm, setOpenForm] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState('');
  const [snackSeverity, setSnackSeverity] = React.useState('success');
  const [cinema, setCinemaList] = React.useState([]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackMessage(message);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  const user_role = document.cookie
    .split('; ')
    .find((row) => row.startsWith('user_role='))
    .split('=')[1];

  const add_movies = async (formData) => {
    try {
      const response = await api.post('/cinema/add_movie/', formData, {
        withCredentials: true,
      });
      if (!response.data) {
        showSnackbar("Échec de l'ajout du film", 'error');
        return;
      }
      setOpenSession(true);
      setSavedMovie(response.data.data);
      showSnackbar('Film ajouté avec succès');
      return response.data;
    } catch (error) {
      showSnackbar("Erreur lors de l'ajout du film", 'error');
    }
  };

  const toggleOpenSession = (newVal) => () => {
    setOpenSession(newVal);
  };

  const fetchHalls = async () => {
    try {
      const response = await api.get('/cinema/all_hall/', { withCredentials: true });
      if (!response.data) {
        showSnackbar('Échec de la récupération des données de la salle', 'error');
        return;
      }
      setAdminHallList(response.data.data);
      showSnackbar('Salles chargées avec succès');
      return response.data.data;
    } catch (error) {
      showSnackbar('Erreur lors de la récupération des salles', 'error');
    }
  };

  const fetchCinemaOrgHalls = async () => {
    try {
      const response = await api.get('/cinema/organizer/cinema_hall_list/', {
        withCredentials: true,
      });
      if (!response.data) {
        showSnackbar('Échec de la récupération des salles organisateur', 'error');
        return;
      }
      const result = response.data.data;
      setOrgHallList(Array.isArray(result) ? result : []);
      showSnackbar('Salles organisateur chargées avec succès');
    } catch (e) {
      showSnackbar('Erreur lors de la récupération des salles organisateur', 'error');
    }
  };

  const fetchAllMovie = async () => {
    try {
      const response = await api.get('/cinema/movie_list/', { withCredentials: true });
      if (response.status !== 200 || !response.data) {
        showSnackbar('Échec de la récupération des films', 'error');
        return;
      }
      setMovieList(response.data.data);
    } catch (error) {
      showSnackbar('Erreur lors de la récupération des films', 'error');
    }
  };

  const createMovieSession = async (sessions) => {
    try {
      const response = await api.post('/cinema/create_movie_session/', sessions, {
        withCredentials: true,
      });
      if (response.status === 400) {
        showSnackbar('Bad request', 'error');
        return;
      }
      if (!response.data) {
        showSnackbar('Échec de la création de la scéance', 'error');
        return;
      }
      showSnackbar('Scéance créée avec succès');
      setOpenSession(false);
      fetchAllMovie();
    } catch (error) {
      showSnackbar('Erreur lors de la création de la scéance', 'error');
    }
  };

  const deleteMovie = async (id) => {
    if (!id) {
      showSnackbar('pas de film sélectionné', 'error');
      return;
    }
    try {
      const response = await api.delete(`/cinema/delete_movie/${id}/`, {
        withCredentials: true,
      });
      if (response.status !== 200 || !response.data) {
        showSnackbar('Échec de la suppression du film', 'error');
        return;
      }
      fetchAllMovie();
      showSnackbar('Film supprimé avec succès');
    } catch (error) {
      showSnackbar('Erreur lors de la suppression du film', 'error');
    }
  };

  const onUpdateMovie = async (id, formData) => {
    if (!id) {
      showSnackbar('Aucun film sélectionné', 'error');
      return;
    }
    try {
      const response = await api.put(`/cinema/update_movie/${id}/`, formData, {
        withCredentials: true,
      });
      if (!response.data) {
        showSnackbar('Échec de la mise à jour du film', 'error');
        return;
      }
      fetchAllMovie();
      showSnackbar('Film mis à jour avec succès');
    } catch (error) {
      showSnackbar('Erreur lors de la mise à jour du film', 'error');
    }
  };
  const getSessionSeat = async (id) => {
    try {
      const response = await api.get(`/cinema/session/seats/${id}`, { withCredentials: true });
      if (!response.data) {
        showSnackbar('Aucune réponse du serveur', 'error');
      }
      const data = response.data;
      return data;
    } catch (error) {
      console.log('Échec de la récupération des données du serveur');
      return [];
    }
  };
  const getFilterMovie = () => {
    let result = movieList || [];
    result = filterMovieByDate(result, filterType);
    result = filterMovieBySearch(result, search);
    return result;
  };
  const add_promocode = async (formData) => {
    try {
      const response = await api.post(`/cinema/promocodes/`, formData, { withCredentials: true });

      if (!response.data) {
        showSnackbar('Failed to add promocode', 'error');
        return;
      }
      if (response.status !== 201) {
        showSnackbar(response.data.error, 'error');
        return;
      }
      showSnackbar('Successfully add promocode', 'success');
    } catch (error) {
      showSnackbar(error.response.data.details.code, 'error');
    }
  };

  const create_pcode_w_session = async (formData, id) => {
    if (!id) {
      showSnackbar('No selected id', 'warning');
      return;
    }

    try {
      const response = await api.post(`/cinema/promocodes/session/${id}/`, formData, {
        withCredentials: true,
      });

      if (!response.data) {
        showSnackbar('No response was found from server', 'error');
        return;
      }
      if (response.status !== 201) {
        showSnackbar(response.data.error, 'error');
        return;
      }
      showSnackbar('Promotion code successfully added', 'success');
    } catch (error) {
      showSnackbar(error.response.data.details.code);
    }
  };

  const create_pcode_w_movie = async (formData, id) => {
    if (!id) {
      showSnackbar('No movie selected', 'warning');
      return;
    }

    try {
      const response = await api.post(`/cinema/promocodes/movie/${id}/`, formData, {
        withCredentials: true,
      });

      if (!response.data) {
        showSnackbar(`Failed to create promocodes for ${id}`, 'error');
        return;
      }

      if (response.status !== 201 || response.status !== 200) {
        showSnackbar(response.data.error, 'error');
        return;
      }

      showSnackbar(response.data.message, 'success');
    } catch (error) {
      showSnackbar(error.response.data.error, 'error');
    }
  };
  const toggleOpen = (newVal) => () => {
    setOpenForm(newVal);
  };
  const filterMovieList = getFilterMovie();
  const hallList =
    user_role === 'admin' ? adminHallList : user_role === 'organizer' ? orgHallList : [];
  React.useEffect(() => {
    fetchHalls();
    fetchAllMovie();
  }, []);
  React.useEffect(() => {
    fetchCinemaOrgHalls();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 6, gap: 2 }}>
      <Paper
        sx={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
          {['Cette semaine', 'À venir', 'Passé', 'Tous'].map((item, index) => (
            <Chip
              key={index}
              label={item}
              clickable
              onClick={() => setfilterType(item)}
              color={filterType === item ? 'primary' : 'default'}
              variant={filterType === item ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, alignItems: 'center' }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            name="search"
            placeholder="recherche par titre, description, directeur, genre"
            label="recherche"
            size="small"
            fullWidth
            sx={{
              width: 300,
              '& .MuiInputBase-input::placeholder': {
                fontSize: '0.85rem',
                color: 'text.secondary',
              },
            }}
          />
          <Button
            onClick={toggleOpen(true)}
            color="primary"
            variant="contained"
            startIcon={<Add />}
          >
            Ajouter un film
          </Button>
          <PromocodeForm btnText={'Add new promo code'} type={'create'} onSave={add_promocode} />
          <MoviesForm
            onSave={add_movies}
            open={openForm}
            onClose={toggleOpen(false)}
            type="create"
          />
        </Box>
      </Paper>
      <MovieSession
        open={openSession}
        onClose={toggleOpenSession(false)}
        movie={savedMovie}
        cinema={orgHallList}
        handleSave={createMovieSession}
        type="create"
      />
      <Paper sx={{ borderRadius: 2 }}>
        <MovieCard
          movieList={filterMovieList}
          cinema={hallList}
          onUpdateSession={createMovieSession}
          onDelete={deleteMovie}
          onUpdateMovie={onUpdateMovie}
          fetchSessionSeat={getSessionSeat}
          onSavePCode={create_pcode_w_session}
          onSavePCodeW_M={create_pcode_w_movie}
        />
      </Paper>
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity={snackSeverity} sx={{ width: '100%' }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MoviesPage;
