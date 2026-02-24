import React, { useState } from 'react';
import { CardMedia, Box } from '@mui/material';

/**
 * Props:
 * - src: original image URL
 * - alt: alt text
 * - width: desired display width
 * - height: desired display height
 * - placeholder: optional small blurred placeholder image
 */
export default function FastImage({ src, alt, width = '100%', height = 250, placeholder }) {
  const [loaded, setLoaded] = useState(false);

  // Optionally, add query params to resize image from backend
  const resizedSrc = `${src}?w=${width}&h=${height}`;

  return (
    <Box sx={{ position: 'relative', width, height }}>
      {/* Blur placeholder */}
      {!loaded && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 2,
            backgroundColor: '#eee',
            filter: 'blur(20px)',
            backgroundImage: placeholder ? `url(${placeholder})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Actual image */}
      <CardMedia
        component="img"
        image={resizedSrc}
        alt={alt}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 2,
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}
      />
    </Box>
  );
}
