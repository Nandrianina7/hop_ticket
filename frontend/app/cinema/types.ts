// app/cinema/types.ts
export interface Cinema {
  id: number;
  name: string;
  city: string;
}

export interface CinemaHall {
  id: number;
  name: string;
  screen_type: string;
  base_price: number;
  cinema: Cinema; // Ajoutez cette propriété
}

//  interface MovieSession {
//   id: number;
//   start_time: string;
//   end_time: string;
//   base_price: number;
//   hall: CinemaHall;
//   cinema_name?: string;
//   cinema_city?: string;
//   movie: {
//     id: number;
//     title: string;
//     duration: number;
//   };
//   // Ajouter ces champs si disponibles
//   date?: string;
//   available_dates?: string[];
//   available_times?: string[];
// }
// types.ts
export interface MovieSession {
  id: number;
  start_time: string;
  end_time: string;
  base_price: number | string;
  hall: CinemaHall;
  movie: Movie;
  cinema_name?: string;
  cinema_city?: string;
  date?: string;
  available_dates?: string[];
  available_times?: string[];
}


export interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  duration_formatted: string;
  release_date: string;
  genre: string;
  director: string;
  cast: string;
  poster: string | null;
  trailer_url: string;
  rating: string;
  is_active: boolean;
  rating_value?: number;
  next_session?: MovieSession;
  sessions?: MovieSession[];
  earliest_session?: string;
  session_count?: number;
  popularity?: number;
}

export interface Seat {
  id: string;
  rows: string;
  cols: string;
  seat_type: string;
  price_multiplier: number;
  is_available: boolean;
  is_vip?: boolean;
  is_disabled?: boolean;
  is_reserved?: boolean;
  
}