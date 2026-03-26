export const getRoleColor = (role) => {
  switch (role) {
    case 'organizer':
      return { bg: '#4facfe', light: 'rgba(79, 172, 254, 0.1)' };
    case 'event_organizer':
      return { bg: '#f5576c', light: 'rgba(245, 87, 108, 0.1)' };
    default:
      return { bg: '#667eea', light: 'rgba(102, 126, 234, 0.1)' };
  }
};
