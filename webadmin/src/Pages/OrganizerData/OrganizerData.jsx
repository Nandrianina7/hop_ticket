import { useSearchParams } from "react-router-dom";
import Movie from "../../components/Home/OrgData/Movie";

const OrganizerData = () => {
  const [searchParams] = useSearchParams();

  const type = searchParams.get('type');
  const orgId = searchParams.get('organizerId');

  return (
    <div>hello all of the {type} organizer {orgId} data come here 
    
      <Movie org_id={orgId}/>
    </div>
  )
}

export default OrganizerData;