/**
 * Battery temperature monitor that displays the hottest and coldest cells for BMS commands.
 */
import React from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import { useVehicleData } from '../../../../hooks/vehicle-hooks';

// Generate keys for CMD1 through CMD15
const generateCellTempKeys = () => {
  const cmdKeys: Record<string, Record<string, string>> = {};
  
  for (let i = 1; i <= 15; i++) {
    cmdKeys[`CMD${i}`] = {
      TEMP1: `BMS_TX_CMD_${i}.CellTemp1`,
      TEMP2: `BMS_TX_CMD_${i}.CellTemp2`,
      TEMP3: `BMS_TX_CMD_${i}.CellTemp3`,
      TEMP4: `BMS_TX_CMD_${i}.CellTemp4`
    };
  }
  
  return cmdKeys;
};

const CELL_TEMP_KEYS = generateCellTempKeys();

const BatteryTempMonitor = (): JSX.Element => {
  const { data, isLoading, error } = useVehicleData();

  // Helper function to get min/max temperature for a command
  const getMinMaxTemp = (cmdKeys: Record<string, string>) => {
    if (isLoading || error || !data) {
      return { min: "N/A", max: "N/A", minCell: "", maxCell: "" };
    }
    
    const temps = Object.entries(cmdKeys).map(([key, value]) => ({
      cell: key,
      key: value,
      temp: data[value]
    })).filter(item => item.temp !== undefined);
    
    if (temps.length === 0) {
      return { min: "N/A", max: "N/A", minCell: "", maxCell: "" };
    }
    
    const minTemp = temps.reduce((prev, curr) => prev.temp < curr.temp ? prev : curr);
    const maxTemp = temps.reduce((prev, curr) => prev.temp > curr.temp ? prev : curr);
    
    return {
      min: minTemp.temp.toFixed(1) + "°C",
      max: maxTemp.temp.toFixed(1) + "°C",
      minCell: minTemp.cell.replace('TEMP', ''),
      maxCell: maxTemp.cell.replace('TEMP', '')
    };
  };

  // Get min/max for each command
  const commandMinMaxTemps = Object.entries(CELL_TEMP_KEYS).map(([cmdName, keys]) => ({
    cmdName,
    ...getMinMaxTemp(keys)
  }));

  return (
    <Box sx={{ p: 3, pt: 6, height: '100%', overflow: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Battery Cell Temperatures
      </Typography>

      <Grid container spacing={2}>
        {commandMinMaxTemps.map((cmd, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cmd.cmdName}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 1.5,
                borderLeft: theme => `4px solid ${
                  index % 3 === 0 
                    ? theme.palette.primary.main 
                    : index % 3 === 1 
                      ? theme.palette.secondary.main 
                      : theme.palette.info.main
                }`
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                Module {cmd.cmdName.replace('CMD', '')}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Hottest:</Typography>
                <Typography variant="body2" fontWeight="bold" color="error.main">
                  {cmd.maxCell}: {cmd.max}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Coldest:</Typography>
                <Typography variant="body2" fontWeight="bold" color="info.main">
                  {cmd.minCell}: {cmd.min}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}

        {/* System-wide summary */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, mt: 1, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>System Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Min Temperature:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="info.main">
                    {data?.["BMS_TX_STATE_7.Cell_Temp_Min_degC"]?.toFixed(1) || "N/A"}°C
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Avg Temperature:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {data?.["BMS_TX_STATE_7.Cell_Temp_Avg_degC"]?.toFixed(1) || "N/A"}°C
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Max Temperature:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    {data?.["BMS_TX_STATE_7.Cell_Temp_Max_degC"]?.toFixed(1) || "N/A"}°C
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BatteryTempMonitor;