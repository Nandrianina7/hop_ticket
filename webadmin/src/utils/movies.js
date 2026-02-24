export const filterMovieByDate = (movies, filterType) => {
  const now = new Date();

  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay() + 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  switch (filterType) {
    case 'Passé':
      return movies.filter((movie) =>
        movie.sessions.some((session) => new Date(session.start_time) < now)
      );

    case 'À venir':
      return movies.filter((movie) =>
        movie.sessions.some((session) => new Date(session.start_time) >= now)
      );

    case 'Cette semaine':
      return movies.filter((movie) =>
        movie.sessions.some(
          (session) =>
            new Date(session.start_time) >= startOfWeek && new Date(session.start_time) <= endOfWeek
        )
      );

    case 'Tous':
    default:
      return movies;
  }
};

export const filterMovieBySearch = (
  movies = [{ title: '', genre: '', description: '', release_date: '', director: '' }],
  search
) => {
  if (!search.trim()) return movies;
  const lowerSearch = search.toLowerCase();
  return movies.filter(
    (movie) =>
      movie.title?.toLowerCase().includes(lowerSearch) ||
      movie.description?.toLowerCase().includes(lowerSearch) ||
      movie.genre?.toLowerCase().includes(lowerSearch) ||
      movie.release_date?.toString().toLowerCase().includes(lowerSearch) ||
      movie.director?.toLowerCase().includes(lowerSearch)
  );
};

export const hasUpcomingSession = (movie) => {
  if (!movie?.sessions?.length) return false;

  const now = new Date();
  const minDate = new Date();
  minDate.setDate(now.getDate() + 2);

  return movie.sessions.some((session) => {
    const sessionDate = new Date(session.start_time);
    return sessionDate >= minDate;
  });
};
