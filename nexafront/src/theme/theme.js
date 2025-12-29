import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light', // Can be toggled
        primary: {
            main: '#2979ff', // Vibrant Blue
            light: '#75a7ff',
            dark: '#004ecb',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f50057', // Neon Pink/Red
            light: '#ff5983',
            dark: '#bb002f',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f0f2f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a2027',
            secondary: '#5e6c79',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 800,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 700,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
                    backdropFilter: 'blur(10px)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    color: '#1a2027',
                    boxShadow: '0px 1px 10px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});

export default theme;
