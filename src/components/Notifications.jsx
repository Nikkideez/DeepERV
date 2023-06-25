import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
// import IconButton from '@mui/material/IconButton';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemText from '@mui/material/ListItemText';
// import DeleteIcon from '@mui/icons-material/Delete';
import { TransitionGroup } from 'react-transition-group';
import { Typography } from '@mui/material';
import labels from "../utils/labels.json";


// Maybe add a 4th type called detect
const FRUITS = [
	{ type: "Info", message: '🍏 Firetruck nearby', class: 0 },
	{ type: "Warning", message: '🍌 Banana', class: 4 },
	{ type: "Emergency", message: '🍍 Pineapple', class: 2 },
	{ type: "Warning", message: '🥥 Coconut', class: 4 },
	{ type: "Info", message: '🍉 Watermelon', class: 2 },
];

const classAttributes = [
	{
		label: labels[0],
		icon: "https://cdn-icons-png.flaticon.com/512/224/224464.png",
		color: "#fc0b03"
	},
	{
		label: labels[2],
		icon: "https://cdn-icons-png.flaticon.com/512/3487/3487352.png",
		color: "#f553ef"
	},
	{
		label: labels[4],
		icon: "https://cdn-icons-png.flaticon.com/512/6310/6310025.png",
		color: "#2043f5"
	},
]

const colors = { Info: "#1e88e5", Warning: "#ffb300", Emergency: "#e53935" }

// function renderItem({ item, handleRemoveFruit }) {
// 	return (
// 		<ListItem
// 			sx={{ color: 'red' }}
// 			secondaryAction={
// 				<IconButton
// 					edge="end"
// 					aria-label="delete"
// 					title="Delete"
// 					onClick={() => handleRemoveFruit(item)}
// 				>
// 					<DeleteIcon />
// 				</IconButton>
// 			}
// 		>
// 			<ListItemText primary={item} />
// 		</ListItem>
// 	);
// }
const labelKey = {0: "Firetruck", 2: "Ambulance", 4: "Police"}

const generateMessage = (type, label) => {
	if(type === "Info")
		return `${label} on this road.`
	if(type === "Warning")
		return `${label} is close by.`
	if(type === "Emergency")
		return `${label} behind you!`
}

export default function Notifications(props) {
	// const [fruitsInBasket, setFruitsInBasket] = useState(FRUITS.slice(0, 3));
	const [notificationArr, setNotificationArr] = useState([])
	// const handleAddFruit = () => {
	// 	const nextHiddenItem = FRUITS.find((i) => !fruitsInBasket.includes(i));
	// 	if (nextHiddenItem) {
	// 		setFruitsInBasket((prev) => [nextHiddenItem, ...prev]);
	// 	}
	// };

	const handleRemoveNotification = (item) => {
		setNotificationArr((prev) => [...prev.filter((i) => i !== item)]);
	};

	// const addFruitButton = (
	// 	<Button
	// 		variant="contained"
	// 		// disabled={fruitsInBasket.length >= FRUITS.length}
	// 		onClick={handleAddFruit}
	// 	>
	// 		Add fruit to basket
	// 	</Button>
	// );

	useEffect(() => {
		if (props.notificationObj) {
			setNotificationArr((prev) => [
				{
					type: props.notificationObj.type,
					message: generateMessage(props.notificationObj.type, labelKey[props.notificationObj.data]),
					class: props.notificationObj.data,
				},
				...prev
			].slice(0, 6)); // Keep only the first 6 elements
		}

	}, [props.notificationObj])



	return (
		<div style={{ marginRight: 20, marginTop: 50, width: 400 }}>
			{/* {addFruitButton} */}
			<h3 style={{ marginBottom: 15}}>
				Notifications
			</h3>
			{notificationArr.length >= 1 ?
				< Stack >
					<TransitionGroup>
						{notificationArr.map((item, index) => (
							<Collapse key={index}>
								<Card variant="outlined">
									<Box sx={{ p: 2, display: 'flex' }}>
										<Avatar variant='rounded' src={classAttributes[item.class / 2].icon} sx={{ mr: 2 }} />
										<Stack
											direction="row"
											alignItems="center"
											justifyContent="space-between"
											flexGrow={1}
										>
											<Stack>
												<Typography fontWeight={700} color={colors[item.type]}>
													{item.type}
												</Typography>
												<Typography variant='body2'>
													{item.message}
												</Typography>
											</Stack>
											<Button onClick={() => handleRemoveNotification(item)}>
												Dismiss
											</Button>
										</Stack>
									</Box>
								</Card>
							</Collapse>
						))}
					</TransitionGroup>
				</Stack>
				:
				<p style={{ marginTop: 50 }}>
					<i>No Notifications</i>
				</p>
			}

		</div >
	);
}


