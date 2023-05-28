import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { GoogleMap, Marker, Circle, useLoadScript, MarkerClusterer } from "@react-google-maps/api";
import Places from "./places";
import labels from "../utils/labels.json";
import "./Map.css";

// const generateHouses = (position, data) => {
// 	if (!position) {
// 		position = { lat: -33.8840838, lng: 151.2012416 }
// 	}

// 	const ervArray = []
// 	ervArray.push({
// 		lat: position.lat,
// 		lng: position.lng,
// 		data: data
// 	});
// 	return ervArray;
// };






// [
// 	"firetruck_active",
// 	"firetruck_inactive",
// 	"ambulance_active",
// 	"ambulance_inactive",
// 	"police_active",
// 	"police_inactive"
// ]



export default function Map(props) {
	const [location, setLocation] = useState();
	const [circleRef, setCircleRef] = useState(null);
	const [count, setCount] = useState(0);
	const [ervs, setERVS] = useState([])
	const mapRef = useRef();

	const center = useMemo(() => ({ lat: -33.8840838, lng: 151.2012416 }), []);

	const options = useMemo(() => ({
		mapId: "956b2027cda0bb4a",
		disableDefaultUI: true,
		clickableIcons: false
	}), []);

	const handleERVArray = (position, data) => {
		console.log("handleERVArray called")
		let min = -0.00025;
		let max = -0.00010;
		let random = Math.random() * (max - min) + min;

		console.log(random);

		setERVS(prevERVS => [...prevERVS, {
			location: { lat: position.lat + random, lng: position.lng + random },
			data: data,
			icon: classAttributes[data].icon
		}]);
	};


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
		{
			console.log(ervs)
			const check = ervs.some(item => item.data === props.data)
			console.log("check 1 ", check);
			console.log("props.data: ", props.data);
			console.log("modulo: ", props.data % 2);
			console.log("check: ", !check)

			if (!check && props.data !== undefined && (props.data % 2) === 0) {
				console.log("check 2 ", check);
				// setCount(count + 1);
				handleERVArray(location, props.data)
			}
		}
	}, [props.data])


	// const svgMarker = {
	// 	path: "m321-292 159-72 159 72 5-5-164-397-164 397 5 5ZM480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z",
	// 	fillColor: "blue",
	// 	fillOpacity: 0.6,
	// 	strokeWeight: 0,
	// 	rotation: 0,
	// 	scale: 2,
	// 	anchor: new google.maps.Point(0, 20),
	// };

	// When location changes, remove the old circle.
	// 	useEffect(() => {
	//     if (circleRef) {
	//         circleRef.setMap(null);
	//     }

	//     const newCircle = new window.google.maps.Circle({
	//         strokeColor: "#FF0000",
	//         strokeOpacity: 0.8,
	//         strokeWeight: 1,
	//         fillColor: "#E07790",
	//         fillOpacity: 0.20,
	//         map: mapRef.current,
	//         center: location,
	//         radius: 100,
	//     });

	//     setCircleRef(newCircle);

	//     return () => {
	//         newCircle.setMap(null);
	//     };
	// }, [location]);

	// console.log(ervs)

	return (
		<div>
			<div>
				<h1>
					Search for addresses
				</h1>
				<p>Current Class: {labels[props.data]} </p>
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
						{console.log("getting called")}
						<Marker
							position={location}
							// icon={{
							// 	url: "https://cdn-icons-png.flaticon.com/512/3487/3487352.png",
							// 	scaledSize: new window.google.maps.Size(60, 60)
							// }}
							icon="../../yolov5-tfjs/icons8-location-32.png"
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
						<MarkerClusterer options={{ gridSize: 50 }}>
							{(clusterer) =>
								ervs.map((erv) => (
									<Marker
										key={erv.location.lat}
										position={erv.location}
										clusterer={clusterer}
										icon={erv.icon}
									/>
								))
							}
						</MarkerClusterer>
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
			<button onClick={() => {
					setLocation(center);
					mapRef.current.panTo(location);
				}}>
				Set current location
			</button>
		</div>
	);
}
