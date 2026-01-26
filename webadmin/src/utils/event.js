export const getNearestEvent = (events) => {
  const today = new Date();
  const filterEvent = events.filter((event) => new Date(event.date) >= today);
  if (filterEvent.length === 0) return null;

  const closestEvent = filterEvent.reduce((nearest, event) => {
    return !nearest || new Date(event.date) < new Date(nearest.date) ? event : nearest;
  }, null);

  const diffMs = new Date(closestEvent.date) - today;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const diffSeconds = Math.floor((diffMs / 1000) % 60);

  return {
    ...closestEvent,
    timeLeft: `${diffDays} days ${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}`,
  };
};

export const getSoldTicketTrend = (event) => {
  const sortedEvent = [...event].sort((a, b) => a.date.localeCompare(b.date));
  const last25 = sortedEvent.slice(-25);
  const trendArray = last25.map((event) => ({
    name: event.name,
    count: event.tickets_sold || 0,
  }));
  return trendArray;
};

export const getUpcomingEvents = (event = []) => {
  const upcoming = event
    .filter((e) => new Date(e.date) > new Date())
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      name: e.name,
      date: new Date(e.date).toLocaleDateString(),
      sold: e.tickets_sold,
      venue: e.venue,
    }));
  return upcoming.length
    ? upcoming
    : [{ id: 0, name: 'No upcoming events', date: '', sold: 0, venue: '' }];
};

export const mostFiveSoldEvent = (event = []) => {
  const sortedEvents = event.sort((a, b) => b.tickets_sold - a.tickets_sold);
  return sortedEvents.slice(0, 5).map((e) => ({
    id: e.id,
    name: e.name,
    date: new Date(e.date).toLocaleDateString(),
    ticket: e.ticket,
    event: e.eventName,
    venue: e.venue,
  }));
};
