export const getImagePath = (imageUrl = '') => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.149:8000';

  if (!imageUrl) return null;

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;

  return `${API_URL}/${cleanPath}`;
};
