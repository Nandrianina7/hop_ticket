export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return 'Ar 0';
  }

  return new Intl.NumberFormat('mg-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

export const calculateTotalPrice = (tickets) => {
  return tickets.reduce((total, ticket) => {
    const price = parseFloat(ticket.price) || 0;
    return total + price;
  }, 0);
};
export const getUniqueHallsCinemas = (tickets) => {
  const unique = new Set();
  tickets.forEach((ticket) => {
    const hallCinema = `${ticket.hall_name || 'Tsy fantatra'} - ${ticket.cinema_name || 'Tsy fantatra'}`;
    unique.add(hallCinema);
  });
  return Array.from(unique).join(', ');
};
