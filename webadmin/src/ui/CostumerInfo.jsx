import {
  Box,
  Button,
  Card,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  IconButton,
  Chip,
  useTheme,
  Collapse,
  Tooltip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import hoplogo from '../assets/hoplogo.jpeg';
import { FastAverageColor } from 'fast-average-color';
import { QRCodeSVG } from 'qrcode.react';
import {
  Close,
  Info,
  CalendarToday,
  LocationOn,
  Person,
  Share,
  ContentCopy,
} from '@mui/icons-material';

const CostumerInfo = ({ open, onClose, data }) => {
  const theme = useTheme();
  const [image, setImage] = useState(data.event?.image ? data.event.image : hoplogo);
  const [averageColor, setAverageColor] = useState(theme.palette.primary.main);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fac = new FastAverageColor();

    const hexToRgb = (hex) => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return { r, g, b };
    };

    const isNearWhite = (hex) => {
      const { r, g, b } = hexToRgb(hex);
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      return brightness > 240;
    };

    if (data.event?.image) {
      setImage(data.event.image);
      fac
        .getColorAsync(data.event.image)
        .then((color) => {
          if (isNearWhite(color.hex)) {
            setAverageColor('#000000');
          } else {
            setAverageColor(color.hex);
          }
        })
        .catch((err) => {
          console.error('Error getting average color:', err);
          setAverageColor('#000000');
        });
    } else {
      setImage(hoplogo);
      setAverageColor('#000000');
    }

    return () => fac.destroy();
  }, [data.event?.image]);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(data.ticket_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = data.event?.date
    ? new Date(data.event.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

  const formattedTime = data.event?.date
    ? new Date(data.event.date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'visible',
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <Box position="absolute" top={8} right={8}>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Card sx={{ width: '100%', borderRadius: 0, boxShadow: 'none' }}>
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="280"
              image={image}
              alt={data.event?.name || 'Event image'}
              sx={{
                objectFit: 'cover',
                width: '100%',
                filter: 'brightness(0.95)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
              }}
            >
              <Typography variant="h4" color="white" fontWeight="bold">
                {data.event?.name || 'Event Name'}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Chip
                  label={data.is_used ? 'Used' : 'Valid'}
                  color={data.is_used ? 'default' : 'success'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="white">
                  {formattedDate} • {formattedTime}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        <Box sx={{ p: 3, pt: 2 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <LocationOn sx={{ color: averageColor, mr: 1 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">{data.event?.venue || 'N/A'}</Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <Person sx={{ color: averageColor, mr: 1 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Attendee
              </Typography>
              <Typography variant="body1">
                {`${data.customer?.first_name} ${data.customer?.last_name}` || 'Guest'}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: 2,
              mt: 3,
              borderRadius: '8px',
              backgroundColor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                Ticket Code
              </Typography>
              <Box>
                <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                  <IconButton size="small" onClick={handleCopyClick}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box display="flex" justifyContent="center" my={2}>
              <QRCodeSVG
                value={JSON.stringify({
                  event_id: data.event?.id || '',
                  ticket_code: data.ticket_code || '',
                  status: data.is_used ? 'used' : 'unused',
                })}
                size={180}
                bgColor="#ffffff"
                fgColor={averageColor}
                level="H"
                includeMargin
              />
            </Box>

            <Collapse in={expanded}>
              <Typography variant="caption" color="text.secondary">
                {data.ticket_code}
              </Typography>
            </Collapse>

            <Box display="flex" justifyContent="center" mt={1}>
              <Button
                size="small"
                startIcon={<Info />}
                onClick={() => setExpanded(!expanded)}
                sx={{ color: 'text.secondary' }}
              >
                {expanded ? 'Hide Details' : 'Show Details'}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: '8px',
            backgroundColor: averageColor,
            '&:hover': { backgroundColor: averageColor, opacity: 0.9 },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CostumerInfo;
