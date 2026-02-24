import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Divider,
  alpha,
  useTheme,
  Button,
  Modal,
  Backdrop,
  // Close,
  // Fade,
  Pagination,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { PlayArrow, Schedule, Theaters, MoreVert, Edit, Delete, Close } from '@mui/icons-material';
import { getImagePath } from '../../../utils/getImagePath';
import { useState, useEffect } from 'react';
import { stringToColor } from '../../../utils/stringToColor';
import MovieSession from './MovieSession';
import DeleteDialog from '../../../ui/DeleteDialog';
import MoviesForm from './MovieForm';
import PromocodeForm from '../Promocode/PromocodeForm';
import { hasUpcomingSession } from '../../../utils/movies';
import YouTube from 'react-youtube';
import ReactPlayer from 'react-player';
import FastImage from './FastImage';
const MovieCard = ({
  movieList = [],
  onUpdateSession = () => {},
  cinema = [],
  onDelete,
  onUpdateMovie,
  fetchSessionSeat,
  onSavePCode,
  onSavePCodeW_M,
}) => {
  const getYouTubeVideoId = (urlOrId) => {
    if (!urlOrId) return null;
    // already looks like an ID
    if (/^[A-Za-z0-9_-]{11}$/.test(urlOrId)) return urlOrId;

    try {
      const u = new URL(String(urlOrId));
      // Standard watch URL: ?v=ID
      const v = u.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;

      // Handle /embed/ID, /v/ID, /shorts/ID, /live/ID, youtu.be/ID
      const parts = u.pathname.split('/').filter(Boolean);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (/^[A-Za-z0-9_-]{11}$/.test(p)) return p;
      }
    } catch {
      // not a URL, try regex fallback
      const m = String(urlOrId).match(/(?:v=|\/)([A-Za-z0-9_-]{11})(?:[&?]|$)/);
      if (m) return m[1];
    }
    return null;
  };
  const [hoveredId, setHoveredId] = useState(null);
  const [openSession, setOpenSession] = useState(false);
  const [data, setData] = useState({
    session: [],
    movie: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const pageCount = Math.ceil(movieList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovies = movieList.slice(startIndex, startIndex + itemsPerPage);
  const [selected, setSelected] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [open, setOpen] = useState(false);
  const [play, setPlay] = useState(false);
  const [video, setVideo] = useState();

  // const videoId = "FBuQsHSgmi0";

  const [playerLoaded, setPlayerLoaded] = useState(false);

  // useEffect(() => {
  //   if (!playerLoaded) {
  //     const tag = document.createElement("script");
  //     tag.src = "https://www.youtube.com/iframe_api";
  //     tag.async = true;
  //     document.body.appendChild(tag);
  //     setPlayerLoaded(true);
  //   }
  // }, []);

  // Player options (YouTube IFrame API)
  const opts = {
    height: '480',
    width: '853',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
    },
  };

  const onReady = (event) => {
    // Access the player instance if you want
    console.log('YouTube Player Ready ✅');
    // You can even control playback:
    // event.target.playVideo();
  };

  const onError = (error) => {
    console.error('YouTube Player Error ❌', error);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const toggleOpenSession = (newValue) => () => {
    setOpenSession(newValue);
  };
  const [openForm, setOpenForm] = useState(false);
  const toggleOpenForm = (newVal) => () => {
    setOpenForm(newVal);
    if (newVal) {
      setAnchorEl(null);
    }
  };
  const onViewSession = (data, items) => {
    setOpenSession(true);
    setData({
      session: items.map((item) => item.sessions).flat(),
      movie: data,
    });
  };
  const [openPCode, setOpenPCode] = useState(false);
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleOpenMenu = (event, item) => {
    event?.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelected(item);
  };
  const onClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    onDelete(selected.id);
    setOpenDelete(false);
    setAnchorEl(null);
  };

  const handleUpdateMovie = async (formData) => {
    await onUpdateMovie(selected.id, formData);
  };

  const handleSavePCodeW_M = (formData) => {
    onSavePCodeW_M(formData, selected?.id);
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [movieList]);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Grid container spacing={4}>
        {paginatedMovies.map((item) => (
          <Grid key={item.id}>
            <Card
              sx={{
                width: 340,
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                transform: hoveredId === item.id ? 'translateY(-8px)' : 'none',
                boxShadow: 'rgba(0, 0, 0, 0.18) 0px 2px 4px',
                '&:hover': {
                  transform: 'translateY(-7px)',
                  boxShadow: 8,
                },
                p: 1,
                background:
                  theme.palette.mode === 'dark'
                    ? theme.palette.background.default
                    : theme.palette.background.paper,
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Box sx={{ position: 'relative' }}>
                {/* <CardMedia
                  component="img"
                  image={getImagePath(item.poster)+"?w=400&h=250"}
                  alt={item.title}
                  sx={{
                    height: 250,
                    borderRadius: 2,
                  }}
                /> */}
                <FastImage
                  src={getImagePath(item.poster)}
                  alt={item.title}
                  width="100%"
                  height={250}
                  placeholder={getImagePath(item.posterThumb)} // optional small thumbnail
                />

                <Divider />
                <Fade in={hoveredId === item.id}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Tooltip title="View trailer">
                      <IconButton
                        onClick={() => {
                          const vidId = getYouTubeVideoId(item.trailer_url);
                          setVideo(vidId);
                          handleOpen();
                        }}
                        sx={{
                          color: 'white',
                          bgcolor: 'primary.main',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                      >
                        <PlayArrow fontSize="large" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Fade>
                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                  <Chip
                    icon={<Theaters />}
                    label={item.genre}
                    size="small"
                    color="primary"
                    sx={{
                      bgcolor: alpha(stringToColor(item.title), 0.6),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
                <Chip
                  icon={<Schedule color="white" />}
                  label={`${item.duration}m`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 3,
                    right: 2,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                <Box sx={{ display: 'flex', position: 'absolute', bottom: 3, left: 3 }}>
                  <Chip
                    label={`${new Date(item.release_date).toLocaleString('en-US', {
                      month: 'short',
                    })} ${new Date(item.release_date).getFullYear()}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: '#fff' }}
                  />
                </Box>
              </Box>

              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 'bold',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, item)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: 30,
                  }}
                >
                  {item.description}
                </Typography>
                {item.director && (
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{
                      display: 'block',
                      mt: 1,
                      fontStyle: 'italic',
                    }}
                  >
                    Directeur: {item.director}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => onViewSession(item, paginatedMovies)}
                >
                  Voir les sceances
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Stack spacing={2}>
            <Pagination
              count={pageCount}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Stack>
        </Box>
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        {/* {hasUpcomingSession(selected) && (
          // <PromocodeForm 
          //   isItem={true} 
          //   btnText={'Add promocode'} 
          //   type={'create'} 
          //   onSave={handleSavePCodeW_M}
          // />
        )} */}
        <MenuItem onClick={toggleOpenForm(true)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOpenDelete(true);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText sx={{ color: theme.palette.primary.main }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
        {paginatedMovies.length} sur {movieList.length} films
      </Typography>
      <DeleteDialog
        open={openDelete}
        handleClose={() => setOpenDelete(false)}
        onClick={handleDelete}
      />
      <MovieSession
        open={openSession}
        onClose={toggleOpenSession(false)}
        movie={data.movie}
        existingSessions={data.session}
        handleSave={onUpdateSession}
        cinema={cinema}
        fetchSessionSeat={fetchSessionSeat}
        onSavePCode={onSavePCode}
      />
      <MoviesForm
        initialData={selected}
        type="update"
        open={openForm}
        onClose={toggleOpenForm(false)}
        onSave={handleUpdateMovie}
      />
      {/* 📺 Modal Popup */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'black',
            borderRadius: 2,
            boxShadow: 24,
            p: 1,
            width: '80vw',
            maxWidth: 900,
            aspectRatio: '16 / 9',
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <Close />
          </IconButton>

          {/* YouTube Player */}
          {open && (
            <YouTube
              videoId={video}
              opts={opts}
              onReady={onReady}
              onError={onError}
              style={{ width: '100%', height: '100%' }}
            />
            // <ReactPlayer
            //     url={`https://www.youtube.com/watch?v=${videoId}`}
            //     light={true}         // loads thumbnail only
            //     playing={open}       // starts playing on modal open
            //     controls
            //     width="100%"
            //     height="100%"
            //   />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default MovieCard;
