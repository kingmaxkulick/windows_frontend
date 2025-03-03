/**
 * Renders the appropriate content based on the selected app.
 * Handles different views including profile, range, technical specifications, and charging screens.
 */

import React from 'react';
import { Box } from '@mui/material';
import TechnicalSpecsView from '../side-widgets/tech-specs/tech-specs-main-window/tech-specs-main-window';

interface ChargingStatus {
  isCharging: boolean;
  batteryLevel: number;
  timeRemaining: number;
  chargingPower: number;
  voltage: number;
  current: number;
}

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
          {`${appName} View`}
        </Box>
      );
  }
};

export default AppContentRenderer;