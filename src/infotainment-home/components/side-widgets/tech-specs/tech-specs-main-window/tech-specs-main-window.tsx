/**
 * Technical specifications main view that contains buttons to different detailed specs screens.
 */
import React, { useState } from 'react';
import { Box, Typography, Button, Grid, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BatteryTempMonitor from './BatteryTempMonitor';
import KeyMetricsView from './KeyMetricsView';

type TechView = 'main' | 'batteryTemp' | 'keyMetrics';

const TechSpecsMainWindow = (): JSX.Element => {
  const [currentView, setCurrentView] = useState<TechView>('main');

  const navigateTo = (view: TechView) => {
    setCurrentView(view);
  };

  // Main tech specs dashboard with buttons to various detailed views
  const renderMainView = () => (
    <Box sx={{ p: 3, height: '100%' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Technical Specifications
      </Typography>
      
      <Grid container spacing={2}>
        {/* Key Metrics button - now first and half the size */}
        <Grid item xs={6} sm={3} md={2}>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ 
              p: 2, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
            onClick={() => navigateTo('keyMetrics')}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              KEY SIGNALS
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Saftey critical INFO
            </Typography>
          </Button>
        </Grid>
        
        {/* Cell Temps button - now same size as Key Metrics */}
        <Grid item xs={6} sm={3} md={2}>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ 
              p: 2, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
            onClick={() => navigateTo('batteryTemp')}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Cell Temps
            </Typography>
            <Typography variant="body2" color="text.secondary">
              module Min & Max
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  // Conditional rendering based on current view
  return (
    <Box sx={{ height: '100%' }}>
      {currentView === 'main' ? (
        renderMainView()
      ) : (
        <Box sx={{ height: '100%', position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 6, left: 16, zIndex: 10 }}>
            <IconButton 
              onClick={() => navigateTo('main')}
              sx={{ 
                bgcolor: 'background.paper', 
                '&:hover': { bgcolor: 'action.hover' } 
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>
          
          {currentView === 'batteryTemp' && <BatteryTempMonitor />}
          {currentView === 'keyMetrics' && <KeyMetricsView />}
        </Box>
      )}
    </Box>
  );
};

export default TechSpecsMainWindow;