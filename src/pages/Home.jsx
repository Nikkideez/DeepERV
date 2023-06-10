import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Typewriter from 'typewriter-effect';



const Home = () => {
    return (
        <div>
            <Box sx={{ width: '100%', maxWidth: 500, margin: 20 }}>
                <Typography variant="h1" gutterBottom>

                    <Typewriter
                        onInit={(typewriter) => {
                            typewriter.typeString('WELCOME TO DEEPERV')
                                .pauseFor(2500)
                                .stop()
                                // .typeString('this is a test')
                                .start();
                        }}
                    // options={{ cursor: '' }}
                    />
                </Typography>
            </Box>
            {/* <Typewriter
                    onInit={(typewriter) => {
                        typewriter.typeString('An application to detect Active Emergency Response vehicles and pin them to the map. Click on the App button on the top right to begin.')

                            .stop()
                            .pauseFor(2500)
                            .start();
                    }}
                    options={{ pauseFor: 4000 }}
                /> */}
        </div>
    )
}

export default Home;