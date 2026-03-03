import { Box } from "@mui/material"
import { useEffect, useState } from "react"
import api from "../../../api/api"
import Event from "./Event";

const Movie = ({ org_id }) => {
  const [movies, setMovie] = useState([]);
  useEffect(() => {
    const getOrgMovie = async () => {
      try {
        const res = await api.get(`/cinema/organizer/data/${org_id}/`, { withCredentials: true });
        if (!res.data || res.status !== 200) {
          console.log('failed to load data');
          return;
        }
        const _movies = res.data.data;
        console.log('load successfully', _movies);
        
        
        setMovie(_movies);
      } catch (error) {
        const errorMess = error instanceof Error ? error.message : 'Unknown error';
        console.log(errorMess);
        console.log('error', error);
      }
    }

    getOrgMovie()
  }, [org_id])
  return (
    <Box>
      {movies.map((movie, index) => (
        <p key={index}>{movie.title}</p>
      ))}
      <Event org_id={org_id} />
    </Box>
  )
}

export default Movie;
