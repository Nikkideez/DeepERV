import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { GoogleMap, Marker, Circle, useLoadScript, MarkerClusterer, PolylineF } from "@react-google-maps/api";
import Places from "./places";
import labels from "../utils/labels.json";
import "./Map.css";


// [
// 	"firetruck_active",
// 	"firetruck_inactive",
// 	"ambulance_active",
// 	"ambulance_inactive",
// 	"police_active",
// 	"police_inactive"
// ]

// Calculates a point x meters in a direction based on bearing
// This is used to draw the polyline that shows the facing direction
function calculateNewPosition(lat, lng, bearing, distance) {
	const R = 6371; // Radius of the Earth in kilometers
	const d = distance / 1000; // Convert distance to kilometers
	const brng = toRad(bearing); // Convert bearing to radians

	const lat1 = toRad(lat);
	const lon1 = toRad(lng);

	const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng));
	const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));

	return { lat: toDeg(lat2), lng: toDeg(lon2) };
}

// returns the bearing from one point to another
function calculateBearing(lat1, lng1, lat2, lng2) {
	lat1 = toRad(lat1);
	lng1 = toRad(lng1);
	lat2 = toRad(lat2);
	lng2 = toRad(lng2);

	const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
	const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
	const brng = toDeg(Math.atan2(y, x));

	return (brng + 360) % 360;
}


function toRad(value) {
	return value * Math.PI / 180;
}

function toDeg(value) {
	return value * 180 / Math.PI;
}

// Returns streetname based on lat and lng coodinates
const getStreetName = async (lat, lng) => {
	const API_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY // your API Key
	const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`);
	const data = await response.json();
	if (data && data.results && data.results[0] && data.results[0].address_components) {
		for (let component of data.results[0].address_components) {
			if (component.types.includes("route")) {
				return component.long_name;
			}
		}
	}
	return null;
}

// Checks if two coordinates are on the same street
const isSameStreet = async (lat1, lng1, lat2, lng2) => {
	// console.log(lat1, lng1, lat2, lng2)
	const street1 = await getStreetName(lat1, lng1);
	const street2 = await getStreetName(lat2, lng2);

	console.log(street1)
	console.log(street2)
	return street1 === street2;
}


// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371e3; // Earth's radius in meters
	const lat1Rad = lat1 * (Math.PI / 180); // Convert degrees to radians
	const lat2Rad = lat2 * (Math.PI / 180);
	const deltaLat = (lat2 - lat1) * (Math.PI / 180);
	const deltaLon = (lon2 - lon1) * (Math.PI / 180);

	const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(lat1Rad) * Math.cos(lat2Rad) *
		Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const distance = R * c; // Distance in meters
	return distance;
}

// Bad naming, this actually returns an object for the ERVS array to append
// Need to update this from a handler
const handleERVArray = (position, data, bearing, classAttributes, streetName) => {
	console.log("handleERVArray called")
	// let min = -0.00025;
	// let max = -0.00010;
	// let random = Math.random() * (max - min) + min;

	let offsetLat = -0.00005;
	let offsetLng = 0;

	if (data === 0) {
		offsetLng = -0.00005;
	} else if (data === 2) {
		offsetLng = 0.00005;
	}

	// console.log(random);

	return {
		location: { lat: position.lat + offsetLat, lng: position.lng + offsetLng },
		data: data,
		icon: classAttributes[data].icon,
		bearing: bearing,
		streetName: streetName
	};
};

// checks if two bearings are facing relatively the same direction
const isDirectionSame = (bearing1, bearing2) => {
	console.log(bearing1, bearing2)
	return Math.abs(bearing1 - bearing2) <= 45 && Math.abs(bearing1 - bearing2) >= 0
};

// checks if erv is behind
const isPositionBehind = (latCurrent, lngCurrent, latERV, lngERV, currentBearing) => {
	const bearingToERV = calculateBearing(latCurrent, lngCurrent, latERV, lngERV);
	console.log(bearingToERV)
	console.log(currentBearing)
	return Math.abs(bearingToERV - currentBearing) >= 100 && Math.abs(bearingToERV - currentBearing) <= 260;
}





export default function Map(props) {
	const [location, setLocation] = useState();
	const [circleRef, setCircleRef] = useState(null);
	const [count, setCount] = useState(0);
	const [ervs, setERVS] = useState([])
	const [facingDirection, setFacingDirection] = useState([]);
	const [currentStreet, setCurrentStreet] = useState();
	// const [bearing, setBearing] = useState();
	const mapRef = useRef();
	const inputRef = useRef();

	const center = useMemo(() => ({ lat: -33.88414324710883, lng: 151.2012448983706 }), []);

	const options = useMemo(() => ({
		mapId: "956b2027cda0bb4a",
		disableDefaultUI: true,
		clickableIcons: false
	}), []);


	const classAttributes = [
		{
			label: labels[0],
			icon: {
				url: "https://cdn-icons-png.flaticon.com/512/224/224464.png",
				scaledSize: new window.google.maps.Size(60, 60)
			},
		},
		{
			label: labels[1],
			icon: {
				url: "https://cdn-icons-png.flaticon.com/512/224/224464.png",
				scaledSize: new window.google.maps.Size(60, 60)
			},
		},
		{
			label: labels[2],
			icon: {
				url: "https://cdn-icons-png.flaticon.com/512/3487/3487352.png",
				scaledSize: new window.google.maps.Size(60, 60)
			},
		},
		{
			label: labels[3],
			icon: {
				url: "https://cdn-icons-png.flaticon.com/512/3487/3487352.png",
				scaledSize: new window.google.maps.Size(60, 60)
			},
		},
		{
			label: labels[4],
			icon: {
				url: "https://cdn-icons-png.flaticon.com/512/6310/6310025.png",
				scaledSize: new window.google.maps.Size(60, 60)
			},
		},
		{
			label: labels[5],
			icon: {
				url: "https://cdn-icons-png.flaticon.com/512/6310/6310025.png",
				scaledSize: new window.google.maps.Size(60, 60)
			},
		},
	]

	const onLoad = useCallback(map => (mapRef.current = map), []);

	// const ervs = useMemo(() => handleERVArray(location, props.data), [count])

	useEffect(() => {
		if (props.data || props.data === 0) {
			// console.log("Maps useEFfect getting called")
			// console.log(props.data)
			// console.log("ervs ", ervs)
			const check = ervs.some(item => item.data === props.data)
			// console.log("location ", location)
			// console.log(ervs[0]["location"] )
			// const checkLocation = ervs.some(item => (Math.abs(item.location.lat - location.lat)) < 0.01)
			const checklist = { 0: false, 2: false, 4: false };
			let count = 0
			let checkLocation = false;
			for (let i = 0; i < ervs.length; i++) {
				// console.log("iteration: ", i)
				// console.log(Math.abs(ervs[i].location.lat - location.lat))
				// // console.log("ervs: ", ervs[i])
				// console.log("count: ", count)
				// console.log("checklist: ", checklist)
				if (count === 3) {
					// console.log("Fulllllllllllllllllllll")
					checkLocation = true;
					break;
				}
				else if ((Math.abs(ervs[i].location.lat - location.lat) < 0.001 && (Math.abs(ervs[i].location.lng - location.lng) < 0.001)) && !checklist[ervs[i].data]) {
					if (ervs[i].data === props.data) {
						// console.log("Already existing")
						checkLocation = true;
						break;
					}
					checklist[ervs[i].data] = true;
					count++;
				}
			}


			// console.log("check 1 ", check);
			// console.log("props.data: ", props.data);
			// console.log("modulo: ", props.data % 2);
			// console.log("check: ", !check)
			console.log("checkLocation: ", checkLocation)
			console.log(props.data)

			if (!checkLocation && props.data !== undefined && (props.data % 2) === 0) {
				// console.log("check 2 ", check);
				// setCount(count + 1);
				// handleERVArray(location, props.data, facingDirection)
				console.log(currentStreet)
				setERVS(prevERVS => [...prevERVS, handleERVArray(location, props.data, inputRef.current.value, classAttributes, currentStreet)]);
			}
		}
	}, [props.data])

	// When location changes, redraw the polyline for facingDirection
	useEffect(() => {
		if (location) {
			props.setIsLocation(true);
			handleFacingDirection(location, inputRef.current.value, 100)

			// getDistance(ervs[0], location)
			// create a new function to handle the async request
			const fetchStreetName = async () => {
				const street = await getStreetName(location.lat, location.lng);
				setCurrentStreet(street);
			}

			// call the function
			fetchStreetName();
		}
	}, [location])

	// If location of ervs array changes, handle notifications, if any
	useEffect(() => {
		if (location && ervs.length >= 1) {
			const notificationTrigger = async () => {
				const streetCheck = await isSameStreet(location.lat, location.lng, ervs[ervs.length-1].location.lat, ervs[ervs.length-1].location.lng);
				const directionCheck = isDirectionSame(inputRef.current.value, ervs[ervs.length-1].bearing)
				const positionCheck = isPositionBehind(location.lat, location.lng, ervs[ervs.length-1].location.lat, ervs[ervs.length-1].location.lng, inputRef.current.value)
				console.log(streetCheck)
				console.log(directionCheck)
				console.log(positionCheck)
				if (streetCheck && directionCheck && positionCheck) {
					console.log("Zammmmmmmmmmmmmmmmmmmmmmmmm")
					const distance = calculateDistance(location.lat, location.lng, ervs[ervs.length-1].location.lat, ervs[ervs.length-1].location.lng)
					console.log(distance)
					let type;
					if (distance < 150)
						type = "Emergency"
					else if (distance < 500)
						type = "Warning"
					else if (distance < 2000)
						type = "Info"
					props.setNotificationObj({
						type: type,
						data: ervs[ervs.length-1].data
					})

				}
			}

			notificationTrigger();
		}
	}, [location, ervs])

	const handleClearMarker = () => setERVS([]);

	const handleFacingDirection = (location, newBearing, distance) => {
		let newPos = calculateNewPosition(location.lat, location.lng, newBearing, 10);
		// setBearing(newBearing);
		setFacingDirection([
			{ lat: location.lat, lng: location.lng },
			{ lat: newPos.lat, lng: newPos.lng }
		])
	}

	// Can probably remove onPolyLoad 
	const onPolyLoad = polyline => {
		// console.log('polyline: ', polyline)
	};
	// console.log("render BEFORE return")

	// const getDistance = (pointA, pointB) => {
	// 	const API_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY// your API Key
	// 	fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${pointA.lat},${pointA.lng}&destinations=${pointB.lat},${pointB.lng}&key=${API_KEY}`)
	// 		.then(response => response.json())
	// 		.then(data => console.log(data));

	// }

	return (
		<div className="map-div">
			<div>
				<h3>
					Search for addresses
				</h3>
				{/* <p>Current Class: {labels[props.data]} </p> */}
				<div className="places">
					<Places
						setLocation={(position) => {
							setLocation(position);
							mapRef.current.panTo(position);
						}}
					/>
				</div>
			</div>
			<GoogleMap
				zoom={10}
				center={center}
				mapContainerClassName="map-container"
				options={options}
				onLoad={onLoad}
			>
				{location && (
					<>
						{/* {console.log("getting called")} */}
						<Marker
							draggable={true}
							position={location}
							// icon={{
							// 	url: "https://cdn-icons-png.flaticon.com/512/3487/3487352.png",
							// 	scaledSize: new window.google.maps.Size(60, 60)
							// }}
							onDragEnd={(event) => setLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() })}
							icon="../../icons8-location-32.png"
						/>
						{/* <Circle 
							center={location}
							onLoad={setCircleRef}
							radius={100}
							visible= {true}
							options={{
								strokeColor: "#FF0000",
								strokeOpacity: 0.8,
								strokeWeight: 1,
								fillColor: "#E07790",
								fillOpacity: 0.20,
							}}
						/> */}
						<MarkerClusterer options={{ gridSize: 5 }}>
							{(clusterer) =>
								ervs.map((erv) => (
									<Marker
										key={erv.location.lng}
										position={erv.location}
										clusterer={clusterer}
										icon={erv.icon}
									/>
								))
							}
						</MarkerClusterer>

						{facingDirection.length &&
							<>
								{/* {console.log("facingDirection: ", facingDirection)} */}
								<PolylineF
									key={facingDirection[1].lat + facingDirection[1].lng} // Add unique key prop
									path={facingDirection}
									onLoad={onPolyLoad}
									options={{
										strokeColor: '#FF0000',
										strokeOpacity: 0.8,
										strokeWeight: 2,
										fillColor: '#FF0000',
										fillOpacity: 0.35,
										clickable: false,
										draggable: true,
										editable: false,
										visible: true,
										radius: 30000,
										zIndex: 1
									}}
								/>
							</>
						}
					</>

				)}



				{/* <Marker
					position={location}
					// icon={{
					// 	url: "https://cdn-icons-png.flaticon.com/512/3487/3487352.png",
					// 	scaledSize: new window.google.maps.Size(60, 60)
					// }}
					icon="../../yolov5-tfjs/icons8-location-32.png"
				/> */}
			</GoogleMap>
			<div className="buttonContainer">
				<button onClick={() => {
					setLocation(center);
					// mapRef.current.panTo(location);
				}}
					className="location-button"
				>
					Set current location
				</button>
				<button onClick={handleClearMarker}>
					Clear Markers
				</button>
				<div>
					<p className="thresholdP">
						{"Set Facing Direction: "}
					</p>
					<input
						ref={inputRef}
						placeholder={facingDirection}
						style={{ width: 50 }}
					/>
					<button className="button-inverted" onClick={() => handleFacingDirection(location, inputRef.current.value, 100)}>
						Enter
					</button>
				</div>
			</div>
		</div>
	);
}
