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

	const center = useMemo(() => ({ lat: -33.88414324710883, lng: 151.2012448983706 }), []);

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
				else if ((Math.abs(ervs[i].location.lat - location.lat) < 0.001) && !checklist[ervs[i].data]) {
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
				handleERVArray(location, props.data)
			}
		}
	}, [props.data])

	useEffect(() => {
		if (location) {
			props.setIsLocation(true);
		}
	}, [location])

	const handleClearMarker = () => setERVS([]);


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
						<MarkerClusterer options={{ gridSize: 5 }}>
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
			</div>
		</div>
	);
}
