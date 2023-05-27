import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import Map from "./map";
import "./Map.css";

export default function Home(){
    
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries: ["places"]
    });
    

    if (!isLoaded) return <div>Loading...</div>
    return (
        <div>
            <Map />
        </div>
    )

}


// export default Home