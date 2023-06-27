import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Typewriter from 'typewriter-effect';



const Home = () => {
    return (
        <div>
            <Box sx={{ width: '100%', maxWidth: 500, margin: 20 }}>
                    <Typewriter
                        onInit={(typewriter) => {
                            typewriter.typeString('<h1 style="font-size: 100px; font-family: monospace;">WELCOME TO <code style="color: teal;">DEEP</code><code style="color: blueviolet;">ERV</code><h1>')
                                .pauseFor(1000)
                                .changeDelay(40)
                                .typeString('<h3 style="front-family: monospace; margin-top: 10px;">An application to detect active emergency response vehicles.</h3>')
                                .pauseFor(1000)
                                .typeString('<p style="display: block; front-family: monospace; margin-top: 20px;">To get started, click on the <code>APP</code> button in the top right.</p>')
                                .stop()
                                // .typeString('this is a test')
                                .start();
                        }}
                    // options={{ cursor: '' }}
                    />
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