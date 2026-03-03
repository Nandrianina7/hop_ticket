import { useEffect, useState } from "react";
import api from "../../../api/api";

const Event = ({ org_id }) => {
  const [events, setEvents] = useState([]);

  const getEvent = async (creator) => {
    try {
      const res = await api.get(`/api/organizer_event/${creator}/`, { withCredentials: true });
      if (res.status!==200 || !res.data) {
        console.log('failed to load data from server');
        return;
      }

      const data = res.data.data;
      setEvents(data);

    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'Unknown error';
      console.log('error', error);
      console.log('message', errorMess);

    }
  }
  useEffect(() => {
    if (org_id) {
      getEvent(org_id);
    } else {
      setEvents([]);
    }
  }, [org_id]);
  return (
    <div>
      {events.map((event, index) => (
        <p key={index}>{event.name}</p>
      ))}
    </div>
  )
}
export default Event;
