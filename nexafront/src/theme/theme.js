import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2979ff',
            light: '#75a7ff',
            dark: '#004ecb',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f50057',
            light: '#ff5983',
            dark: '#bb002f',
            contrastText: '#ffffff',
        },
        info: {
            main: '#0284c7',
            light: '#0ea5e9',
            dark: '#0369a1',
        },
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
        divider: 'rgba(148, 163, 184, 0.2)',
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 800,
            fontSize: '3rem',
            lineHeight: 1.2,
        },
        h2: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.3,
        },
        h3: {
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1.4,
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.5,
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.5,
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.125rem',
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0px 1px 2px rgba(0, 0, 0, 0.05)',
        '0px 1px 3px rgba(0, 0, 0, 0.1)',
        '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
        '0px 2px 4px rgba(0, 0, 0, 0.06), 0px 2px 6px rgba(0, 0, 0, 0.1)',
        '0px 3px 5px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.1)',
        '0px 3px 5px rgba(0, 0, 0, 0.06), 0px 2px 4px rgba(0, 0, 0, 0.1)',
        '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
        '0px 5px 8px rgba(0, 0, 0, 0.08), 0px 3px 6px rgba(0, 0, 0, 0.06)',
        '0px 6px 10px rgba(0, 0, 0, 0.08), 0px 3px 6px rgba(0, 0, 0, 0.06)',
        '0px 7px 12px rgba(0, 0, 0, 0.09), 0px 4px 8px rgba(0, 0, 0, 0.07)',
        '0px 8px 14px rgba(0, 0, 0, 0.09), 0px 4px 8px rgba(0, 0, 0, 0.07)',
        '0px 9px 16px rgba(0, 0, 0, 0.1), 0px 5px 10px rgba(0, 0, 0, 0.08)',
        '0px 10px 18px rgba(0, 0, 0, 0.1), 0px 5px 10px rgba(0, 0, 0, 0.08)',
        '0px 11px 20px rgba(0, 0, 0, 0.11), 0px 6px 12px rgba(0, 0, 0, 0.09)',
        '0px 12px 22px rgba(0, 0, 0, 0.11), 0px 6px 12px rgba(0, 0, 0, 0.09)',
        '0px 13px 24px rgba(0, 0, 0, 0.12), 0px 7px 14px rgba(0, 0, 0, 0.1)',
        '0px 14px 26px rgba(0, 0, 0, 0.12), 0px 7px 14px rgba(0, 0, 0, 0.1)',
        '0px 15px 28px rgba(0, 0, 0, 0.13), 0px 8px 16px rgba(0, 0, 0, 0.11)',
        '0px 16px 30px rgba(0, 0, 0, 0.13), 0px 8px 16px rgba(0, 0, 0, 0.11)',
        '0px 17px 32px rgba(0, 0, 0, 0.14), 0px 9px 18px rgba(0, 0, 0, 0.12)',
        '0px 18px 34px rgba(0, 0, 0, 0.14), 0px 9px 18px rgba(0, 0, 0, 0.12)',
        '0px 19px 36px rgba(0, 0, 0, 0.15), 0px 10px 20px rgba(0, 0, 0, 0.13)',
        '0px 20px 38px rgba(0, 0, 0, 0.15), 0px 10px 20px rgba(0, 0, 0, 0.13)',
        '0px 21px 40px rgba(0, 0, 0, 0.16), 0px 11px 22px rgba(0, 0, 0, 0.14)',
        '0px 22px 42px rgba(0, 0, 0, 0.16), 0px 11px 22px rgba(0, 0, 0, 0.14)',
        '0px 23px 44px rgba(0, 0, 0, 0.17), 0px 12px 24px rgba(0, 0, 0, 0.15)',
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                        transform: 'translateY(-1px)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                            },
                        },
                    },
                },
            },
        },
    },
});

export default theme;
