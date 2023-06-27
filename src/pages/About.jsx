import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const About = () => {
    return (
        <div>
            <Box sx={{ width: '100%', maxWidth: 500, margin: 20 }}>
                <Typography variant="h1" gutterBottom>
                    About DeepERV
                </Typography>
            </Box>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <img src='https://cdn.i-scmp.com/sites/default/files/styles/1280x720/public/d8/images/2018/11/07/pepe_0.jpg?itok=qRtlgdIa' />
            </div>
        </div>
    )
}

export default About;