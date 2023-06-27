import { useLoadScript } from "@react-google-maps/api";
import Map from "./map";
import "./Map.css";


const libraries = ["places"]
export default function Home(props){
    
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries
    });
    

    if (!isLoaded) return <div>Loading...</div>

    return (
        <div>
            <Map 
                data={props.data} 
                setIsLocation={props.setIsLocation} 
                setNotificationObj={props.setNotificationObj}
                newDirection={props.newDirection}
                updateEffect={props.updateEffect}
            />
        </div>
    )

}


// export default Home