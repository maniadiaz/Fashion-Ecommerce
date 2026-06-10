import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    background: {
      default: '#F8F7F5',
      paper: '#FFFFFF',
    },
    primary: {
      main: '#0A0A0A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E63323',
    },
    text: {
      primary: '#0A0A0A',
      secondary: '#6B6B6B',
    },
    divider: '#E8E6E1',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: { fontFamily: 'Playfair Display, serif', fontWeight: 700 },
    h2: { fontFamily: 'Playfair Display, serif', fontWeight: 700 },
    h3: { fontFamily: 'Playfair Display, serif', fontWeight: 700 },
    h4: { fontFamily: 'Playfair Display, serif', fontWeight: 700 },
    button: { fontFamily: 'Inter, sans-serif' },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #E8E6E1',
          borderRadius: 0,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#0A0A0A',
          boxShadow: 'none',
          borderBottom: '1px solid #E8E6E1',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 400,
          '@media (max-width: 600px)': {
            width: '100vw',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid #E8E6E1' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: 'none', border: '1px solid #E8E6E1' },
      },
    },
  },
})

export default theme
