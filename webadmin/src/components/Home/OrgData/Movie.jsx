import { Box, CardMedia, Typography, Grid, Chip, Stack, Button, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../../api/api';
import Event from './Event';
import { getImagePath } from '../../../utils/getImagePath';
import MovieSessionDialog from './MovieSessionDialog';
import { useSearchParams } from 'react-router-dom';

const Movie = ({ org_id }) => {
  const [movies, setMovie] = useState([]);
  const [openSessions, setOpenSessions] = useState(null);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [searchParams] = useSearchParams();

  const xme = searchParams.get('xme');
  useEffect(() => {
    const getOrgMovie = async () => {
      try {
        const res = await api.get(`/cinema/organizer/data/${org_id}/`, { withCredentials: true });
        if (!res.data || res.status !== 200) return;
        setMovie(res.data.data);
      } catch (error) {
        console.log(error instanceof Error ? error.message : 'Unknown error');
      }
    };
    getOrgMovie();
  }, [org_id]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const toggleDescription = (index) => {
    setExpandedDesc((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ mb: 2, fontSize: 16 }} variant="subtitle1">
        Movies
      </Typography>
      <Grid container spacing={3}>
        {movies.map((movie, index) => {
          const isExpanded = expandedDesc[index];
          return (
            <Grid key={index} sx={{ width: '45%' }}>
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Grid container sx={{ height: 300, width: '100%' }}>
                  <Grid sx={{ height: '100%', width: 250 }}>
                    <CardMedia
                      component="img"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      image={
                        movie.poster
                          ? getImagePath(movie.poster)
                          : 'https://via.placeholder.com/300x400?text=No+Poster'
                      }
                      alt={movie.title}
                    />
                  </Grid>

                  <Grid sx={{ height: '100%' }}>
                    <Box
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                              {movie.title}
                            </Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={1}>
                              <Chip
                                label={movie.rating}
                                size="small"
                                sx={{
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  height: 24,
                                }}
                              />
                              {[movie.genre, `${movie.duration} min`].map((label, index) => (
                                <Chip
                                  key={index}
                                  label={label}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 24 }}
                                />
                              ))}
                            </Stack>
                          </Box>
                          {movie.is_active && (
                            <Chip
                              label="Now Showing"
                              color="success"
                              size="small"
                              sx={{ fontWeight: 'bold', height: 24 }}
                            />
                          )}
                        </Box>

                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                          {[
                            { label: 'Director', text: movie.director || 'N/A' },
                            { label: 'Realese date', text: formatDate(movie.release_date) },
                          ].map((item, index) => (
                            <Grid
                              item
                              xs={6}
                              key={index}
                              sx={{ pr: 2, borderRight: '1px solid', borderColor: 'divider' }}
                            >
                              <Typography variant="caption" color="text.secondary" display="block">
                                {item.label}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500, fontSize: '0.875rem' }}
                              >
                                {item.text}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                      <Box sx={{ mt: 1, maxWidth: '400px' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.8rem',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: isExpanded ? 'unset' : 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {movie.description || 'No description available'}
                        </Typography>

                        {movie.description && movie.description.length > 100 && (
                          <Button
                            size="small"
                            onClick={() => toggleDescription(index)}
                            sx={{ mt: 0.5, fontSize: '0.7rem', p: 0, minWidth: 'auto' }}
                          >
                            {isExpanded ? 'Read Less' : 'Read More'}
                          </Button>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {movie.trailer_url && (
                          <Button
                            variant="outlined"
                            size="small"
                            href={movie.trailer_url}
                            target="_blank"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Trailer
                          </Button>
                        )}
                        {movie.sessions?.length > 0 && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => setOpenSessions(index)}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            View Sessions ({movie.sessions.length})
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      <MovieSessionDialog
        open={openSessions}
        onClose={() => setOpenSessions(null)}
        movies={movies}
      />
    </Box>
  );
};

export default Movie;
