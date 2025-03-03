// src/layouts/DashboardLayout.tsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import StatusBar from './components/top-bar/top-bar';
import AppContainer from './components/main-window/app-container';
import ClimateControl from './components/nav-bar/navbar-climate-control';
import BottomNav from './components/nav-bar/navbar-main';
import InfoSidebar from './components/side-widgets/InfoSidebar';
import AppContentRenderer from './components/main-window/AppContentRenderer';
import { useVehicleData } from './hooks/vehicle-hooks';
import { useAppState } from './hooks/use-app-state';
import { dashboardTheme } from './theme/theme';
import backgroundImage from '../assets/wedgeScreen.png';

const DashboardLayout = (): JSX.Element => {
  // Fetch vehicle data from backend
  const { data, isLoading, error } = useVehicleData();
  
  // App state management
  const {
    appState,
    handleAppSelect,
    handleCloseApp,
    handleCloseClimate,
    handleInfoBoxClick,
    showMainContent
  } = useAppState();

  return (
    <ThemeProvider theme={dashboardTheme}>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: 'background.default',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Status Bar */}
        <StatusBar time="12:00 PM" temperature="72°F" />

        {/* Main Content Area */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%'
          }}
        >
          {/* Background Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.4)'
            }}
          />

          {/* Info Boxes */}
          <InfoSidebar
            vehicleData={data}
            isLoading={isLoading}
            error={error}
            onBoxClick={handleInfoBoxClick}
            zIndex={showMainContent ? 0 : 1}
          />

          {/* Main App Content */}
          <AppContainer isOpen={showMainContent} onClose={handleCloseApp}>
            <AppContentRenderer 
              appName={appState.name} 
              chargingStatus={appState.chargingStatus} 
            />
          </AppContainer>

          {/* Climate Control Overlay */}
          <ClimateControl open={appState.isClimateOpen} onClose={handleCloseClimate} />
        </Box>

        {/* Bottom Navigation */}
        <BottomNav
          activeApp={appState.isClimateOpen ? 'Climate' : appState.name}
          onAppSelect={handleAppSelect}
          chargingStatus={appState.chargingStatus}
        />
      </Box>
    </ThemeProvider>
  );
};

export default DashboardLayout;