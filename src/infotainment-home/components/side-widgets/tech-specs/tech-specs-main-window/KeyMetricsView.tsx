import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  useTheme, 
  Button, 
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useVehicleData } from '../../../../hooks/vehicle-hooks';
import { useCanLogger } from '../../../../hooks/use-can-logger';
import SaveIcon from '@mui/icons-material/Save';
import StopIcon from '@mui/icons-material/Stop';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ListIcon from '@mui/icons-material/List';
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

// Add types for the log files
interface LogFile {
  filename: string;
  size_bytes: number;
  created: string;
  id: number;
}

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
  const { data, isLoading, error: dataError } = useVehicleData();
  const theme = useTheme();
  const { 
    isLogging, 
    toggleLogging, 
    currentLogEntries, 
    currentLogId,
    error: loggerError,
    getLogList,
    downloadLog
  } = useCanLogger();
  
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');
  
  // Get grouped metrics
  const groupedMetrics = groupMetrics();
  
  // Show error in snackbar if logger has an error
  useEffect(() => {
    if (loggerError) {
      setSnackbarMessage(loggerError);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [loggerError]);
  
  // Fetch the list of log files
  const fetchLogFiles = async () => {
    const files = await getLogList();
    setLogFiles(files);
  };
  
  // Handle menu open/close
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
    fetchLogFiles();
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle log file download
  const handleDownloadLog = (logId: number) => {
    downloadLog(logId);
    handleMenuClose();
    setSnackbarMessage(`Downloading log file keymetrics-${logId}.csv`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Handle logger toggle with feedback
  const handleToggleLogger = async () => {
    if (isLogging) {
      await toggleLogging();
      setSnackbarMessage(`Stopped logging. Saved file keymetrics-${currentLogId}.csv`);
      setSnackbarSeverity('success');
    } else {
      // Get all the keys we're currently displaying
      const keysToLog: string[] = [];
      CATEGORY_ORDER.forEach(category => {
        if (groupedMetrics[category]) {
          groupedMetrics[category].forEach(metric => {
            keysToLog.push(metric.key);
          });
        }
      });
      
      // Only log keys that are displayed in the metrics view
      await toggleLogging(keysToLog);
      setSnackbarMessage(`Started logging ${keysToLog.length} signals with ID ${currentLogId + 1}`);
      setSnackbarSeverity('info');
    }
    setSnackbarOpen(true);
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Function to get and format value
  const getValue = (key: string) => {
    if (isLoading || dataError || !data || data[key] === undefined) {
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
      height: 'calc(100% - 80px)',
      overflow: 'auto',
      pb: 80,
      marginBottom: 16 
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4">
          Key System Metrics
        </Typography>
        
        {/* Logger Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip 
            title={isLogging 
              ? `Currently logging (${currentLogEntries} entries)` 
              : "Start logging CAN messages"
            }
          >
            <Button
              variant="contained"
              color={isLogging ? "error" : "primary"}
              onClick={handleToggleLogger}
              startIcon={isLogging ? <StopIcon /> : <SaveIcon />}
              sx={{
                transition: 'all 0.3s',
                position: 'relative',
                minWidth: '160px',
                mr: 1
              }}
            >
              {isLogging ? (
                <>
                  Stop Logging 
                  <Box component="span" sx={{ ml: 1, fontSize: '0.8rem', opacity: 0.8 }}>
                    ({currentLogEntries})
                  </Box>
                </>
              ) : (
                "Start Logging"
              )}
              
              {isLogging && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 12,
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                      mr: 1,
                      animation: 'pulse 1.5s infinite',
                      '@keyframes pulse': {
                        '0%': {
                          opacity: 1,
                        },
                        '50%': {
                          opacity: 0.4,
                        },
                        '100%': {
                          opacity: 1,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Button>
          </Tooltip>
          
          {/* Menu for log files */}
          <Tooltip title="Log files">
            <IconButton
              color="primary"
              onClick={handleMenuOpen}
              sx={{ 
                bgcolor: theme.palette.background.paper,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { 
                maxHeight: 300,
                width: 300
              }
            }}
          >
            <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
              Available Log Files
            </Typography>
            
            {logFiles.length === 0 && (
              <MenuItem disabled>
                <ListItemText primary="No log files available" />
              </MenuItem>
            )}
            
            {logFiles.map((file) => (
              <MenuItem key={file.id} onClick={() => handleDownloadLog(file.id)}>
                <ListItemIcon>
                  <FileDownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={file.filename} 
                  secondary={`${formatFileSize(file.size_bytes)} • ${new Date(file.created).toLocaleString()}`}
                />
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
      
      {/* Categories and Metrics Display */}
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
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KeyMetricsView;