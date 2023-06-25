import usePlacesAutocomplete, {
    getGeocode,
    getLatLng
} from "use-places-autocomplete";

import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import "./Map.css"

// type PlacesProps = {
//     setOffice: (position: google.maps.LatLngLiteral) => void;
// };

export default function Places({ setLocation }) {
    const {ready, value, setValue, suggestions: {status, data}, clearSuggestions,
    } = usePlacesAutocomplete();
    
    // console.log({ status, data })

    const handleSelect = async (val) => {
        setValue(val, false);
        clearSuggestions();
        const results = await getGeocode({address: val});
        const {lat, lng} = await getLatLng(results[0]);
    
        // get the snapped coordinates
        const API_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY// your API Key
        const response = await fetch(`https://roads.googleapis.com/v1/snapToRoads?path=${lat},${lng}&interpolate=true&key=${API_KEY}`);
        const data = await response.json();
        console.log(data)
        const {latitude: snappedLat, longitude: snappedLng} = data.snappedPoints[0].location;
    
        // console.log({ snappedLat, snappedLng });
    
        setLocation({ lat: snappedLat, lng: snappedLng });
    }

    return <Combobox onSelect={handleSelect}>
        <ComboboxInput
            value={value}
            onChange={e => setValue(e.target.value)}
            disabled={!ready}
            className="combobox-input"
            placeholder="Search an address"
        />
        <ComboboxPopover>
            <ComboboxList>
                {status === "OK" && data.map(({place_id, description}) => (
                    <ComboboxOption key={place_id} value={description} />
                ))}
            </ComboboxList>
        </ComboboxPopover>
    </Combobox>
}