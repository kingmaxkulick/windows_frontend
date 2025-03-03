import React from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import { useVehicleData } from '../../../../hooks/vehicle-hooks';
import {
  SIGNAL_THRESHOLDS,
  SIGNAL_DISPLAY_NAMES,
  SIGNAL_UNITS,
  SIGNAL_CATEGORIES,
  CATEGORY_ORDER,
  isExceedingThreshold,
  BMS_KEYS,
  INVERTER_KEYS
} from '../../../../constants/can-keys';

/**
 * Define the key metrics to display
 * Using centralized CAN keys for consistency
 */
const KEY_METRICS = [
  // Isolation metrics
  {
    id: 'imd-res-neg',
    key: BMS_KEYS.IMD_RES_NEG,
  },
  {
    id: 'imd-res-pos',
    key: BMS_KEYS.IMD_RES_POS,
  },
  
  // Inverter state metrics
  {
    id: 'inv-vsm-state',
    key: INVERTER_KEYS.INV_VSM_STATE,
  },
  {
    id: 'inv-inverter-state',
    key: INVERTER_KEYS.INV_STATE,
  },
  
  // Voltage metrics
  {
    id: 'inv-dc-bus-voltage',
    key: INVERTER_KEYS.DC_BUS_VOLTAGE,
  },
  {
    id: 'cell-min-v',
    key: BMS_KEYS.CELL_MIN_VOLTAGE,
  },
  {
    id: 'cell-max-v',
    key: BMS_KEYS.CELL_MAX_VOLTAGE,
  },
  {
    id: 'volt-1',
    key: BMS_KEYS.VOLT_1,
  },
  {
    id: 'volt-2',
    key: BMS_KEYS.VOLT_2,
  },
  
  // Torque metrics
  {
    id: 'inv-commanded-torque',
    key: INVERTER_KEYS.COMMANDED_TORQUE,
  },
  {
    id: 'inv-torque-feedback',
    key: INVERTER_KEYS.TORQUE_FEEDBACK,
  },
  
  // Temperature metrics
  {
    id: 'cell-temp-min',
    key: BMS_KEYS.CELL_TEMP_MIN,
  },
  {
    id: 'cell-temp-max',
    key: BMS_KEYS.CELL_TEMP_MAX,
  },
  {
    id: 'cell-temp-avg',
    key: BMS_KEYS.CELL_TEMP_AVG,
  },
  {
    id: 'temp-1',
    key: BMS_KEYS.TEMP_1,
  },
  {
    id: 'temp-2',
    key: BMS_KEYS.TEMP_2,
  },
  {
    id: 'temp-3',
    key: BMS_KEYS.TEMP_3,
  },
  {
    id: 'temp-4',
    key: BMS_KEYS.TEMP_4,
  },
  {
    id: 'inv-motor-temp',
    key: INVERTER_KEYS.INV_MOTOR_TEMP,
  },
  {
    id: 'inv-hot-spot-temp',
    key: INVERTER_KEYS.INV_HOT_SPOT_TEMP,
  },
  
  // Current metrics
  {
    id: 'inv-dc-bus-current',
    key: INVERTER_KEYS.DC_BUS_CURRENT,
  },
  
  // Inverter module temperature signals
  {
    id: 'inv-module-a-temp',
    key: INVERTER_KEYS.INV_MODULE_A_TEMP,
  },
  {
    id: 'inv-module-b-temp',
    key: INVERTER_KEYS.INV_MODULE_B_TEMP,
  },
  {
    id: 'inv-module-c-temp',
    key: INVERTER_KEYS.INV_MODULE_C_TEMP,
  }
];

// Group metrics by category using the centralized mappings
const groupMetrics = (): Record<string, typeof KEY_METRICS> => {
  const grouped: Record<string, typeof KEY_METRICS> = {};
  
  // Initialize all categories with empty arrays
  CATEGORY_ORDER.forEach(category => {
    grouped[category] = [];
  });
  
  // Populate groups
  KEY_METRICS.forEach(metric => {
    const category = SIGNAL_CATEGORIES[metric.key] || 'Other';
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    grouped[category].push(metric);
  });
  
  return grouped;
};

const KeyMetricsView = (): JSX.Element => {
  const { data, isLoading, error } = useVehicleData();
  const theme = useTheme();
  
  // Get grouped metrics
  const groupedMetrics = groupMetrics();
  
  // Function to get and format value
  const getValue = (key: string) => {
    if (isLoading || error || !data || data[key] === undefined) {
      return { 
        displayValue: "N/A", 
        isExceeding: false,
        rawValue: null
      };
    }
    
    const value = data[key];
    const numericValue = typeof value === 'number' ? value : Number(value);
    const isNumber = !isNaN(numericValue);
    
    // Format value based on unit
    const unit = SIGNAL_UNITS[key] || '';
    const formattedValue = isNumber ? numericValue.toFixed(1) : value;
    const exceeding = isNumber ? isExceedingThreshold(key, numericValue) : false;
    
    return {
      displayValue: `${formattedValue}${unit}`,
      isExceeding: exceeding,
      rawValue: isNumber ? numericValue : value
    };
  };
  
  // Function to get background color based on category
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Voltage':
        return 'rgba(33, 150, 243, 0.1)'; // Blue
      case 'Current':
        return 'rgba(76, 175, 80, 0.1)'; // Green
      case 'Temperature':
        return 'rgba(244, 67, 54, 0.1)'; // Red
      case 'Battery':
        return 'rgba(156, 39, 176, 0.1)'; // Purple
      case 'Torque':
        return 'rgba(255, 152, 0, 0.1)'; // Orange
      case 'Inverter States':
        return 'rgba(0, 188, 212, 0.1)'; // Cyan
      case 'Isolation':
        return 'rgba(96, 125, 139, 0.1)'; // Blue Gray
      case 'Motor':
        return 'rgba(255, 193, 7, 0.1)'; // Amber
      default:
        return 'rgba(158, 158, 158, 0.1)'; // Gray
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      pt: 6, 
      height: 'calc(100% - 80px)', // Increased adjustment for navigation bar
      overflow: 'auto',
      // Much more significant padding to force extra space
      pb: 80, // Dramatically increased padding for visibility
      marginBottom: 16 // Additional margin to create more space
    }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Key System Metrics
      </Typography>
      
      {CATEGORY_ORDER.map(category => {
        if (!groupedMetrics[category] || groupedMetrics[category].length === 0) return null;
        
        return (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {category}
            </Typography>
            
            <Grid container spacing={2} sx={{ maxWidth: '1200px' }}>
              {groupedMetrics[category].map(metric => {
                const valueInfo = getValue(metric.key);
                const displayName = SIGNAL_DISPLAY_NAMES[metric.key] || metric.key.split('.').pop() || 'Unknown';
                
                return (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={metric.id}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        backgroundColor: getCategoryColor(category),
                        borderLeft: '4px solid',
                        borderColor: theme => {
                          const baseColor = getCategoryColor(category);
                          return baseColor.replace('0.1', '1');
                        },
                        transition: 'all 0.3s ease-in-out',
                        ...(valueInfo.isExceeding && {
                          borderColor: theme.palette.error.main
                        })
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {displayName}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        fontWeight="medium"
                        sx={{
                          color: valueInfo.isExceeding ? 'error.main' : 'text.primary',
                          transition: 'color 0.3s ease-in-out'
                        }}
                      >
                        {valueInfo.displayValue}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

export default KeyMetricsView;