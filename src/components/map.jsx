import { useMemo, useRef, useCallback } from "react";
import { GoogleMap, Marker, DirectionsRenderer, Circle, MarkerClusterer } from "@react-google-maps/api";
import "./Map.css";



export default function Map() {
	const mapRef = useRef();
	const center = useMemo(() => ({lat: 44, lng: -80}), []);
	const options = useMemo(() => ({
		mapId: "956b2027cda0bb4a",
		disableDefaultUI: true,
		clickableIcons: false
	}), []);

	const onLoad = useCallback(map => (mapRef.current = map), []);

    return (
        <div>
            <GoogleMap
							zoom={10}
							center={center}
							mapContainerClassName="map-container"
							options={options}	
							onLoad={onLoad}
            ></GoogleMap>
        </div>
    )
    
    
}
