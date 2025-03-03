/**
 * Material UI theme configuration for the application.
 * Defines color palette, typography, component styling, and dark mode settings.
 */

import { createTheme } from '@mui/material/styles';

export const dashboardTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ADB5'
    },
    background: {
      default: '#000000',
      paper: 'rgba(20, 20, 20, 0.8)'
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif'
  }
});