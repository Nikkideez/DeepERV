import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet, Link } from 'react-router-dom';

export default function ButtonAppBar() {

	const [current, setCurrent] = useState('h');
	const onClick = (e) => {
		console.log('click ', e);
		setCurrent(e.key);
	};


	return (
		<div>
			<Box sx={{ flexGrow: 1 }}>
				<AppBar position="static" color="transparent" elevation={0}>
					<Toolbar>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						📷 DeepERV
						</Typography>
						<Link to="/deepERV">
							<Button color="inherit" >Home</Button>
						</Link>
						<Link to="/deepERV/App">
							<Button color="inherit" >App</Button>
						</Link>
						<Link to="/deepERV/About">
							<Button color="inherit" >About</Button>
						</Link>
						{/* <Link to="/deepERV">Home</Link>
						<Link to="/deepERV/app">App</Link> */}
					</Toolbar>
				</AppBar>
			</Box>
			<Outlet />
		</div>
	);
}