/**
 * Renders the appropriate content based on the selected app.
 * Handles different views including profile, range, technical specifications, charging screens, and plot view.
 */

import React from 'react';
import { Box } from '@mui/material';
import TechnicalSpecsView from '../side-widgets/tech-specs/tech-specs-main-window/tech-specs-main-window';

// Import the Plot View - adjust the path as needed to match your project structure
import PlotView from '../PlotView-app/PlotView';

interface ChargingStatus {
  isCharging: boolean;
  batteryLevel: number;
  timeRemaining: number;
  chargingPower: number;
  voltage: number;
  current: number;
}

// Placeholder for the ChargingScreen component - you might need to implement this
const ChargingScreen = ({ status }: { status: ChargingStatus }) => (
  <Box sx={{ p: 3 }}>Charging Screen (Battery: {status.batteryLevel}%)</Box>
);

interface AppContentRendererProps {
  appName: string | null;
  chargingStatus: ChargingStatus;
}

const AppContentRenderer = ({ appName, chargingStatus }: AppContentRendererProps): JSX.Element => {
  switch (appName) {
    case 'Profile':
      return <Box sx={{ p: 3 }}>Profile Details View</Box>;
    case 'Range':
      return <Box sx={{ p: 3 }}>Range Information View</Box>;
    case 'Technical':
      return <TechnicalSpecsView />;
    case 'Charging':
      return <ChargingScreen status={chargingStatus} />;
    case 'Plot View': // New case for Plot View
      return <PlotView />;
    case 'Radio': // Existing Radio view
      return <Box sx={{ p: 3 }}>Radio View</Box>;
    default:
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            typography: 'h6',
            color: 'text.secondary'
          }}
        >
          {appName ? `${appName} View` : 'No app selected'}
        </Box>
      );
  }
};

export default AppContentRenderer;