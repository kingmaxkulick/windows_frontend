import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import Papa from 'papaparse';
import { 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

// Interface for parsed CSV data
interface CsvData {
  timestamp: string;
  elapsed_ms: number;
  [key: string]: any;
}

// Interface for CSV column info
interface ColumnInfo {
  name: string;
  min: number;
  max: number;
  avg: number;
  type: 'number' | 'string' | 'unknown';
}

// Time resolution options
type TimeResolution = 'milliseconds' | 'seconds' | 'minutes';

// Range selection interfaces
interface TimeRange {
  start: number;
  end: number;
}

// Available color palette for lines
const COLORS = [
  '#00ADB5', // primary teal
  '#FF5722', // orange
  '#673AB7', // purple
  '#2196F3', // blue
  '#4CAF50', // green
  '#FFC107', // amber
  '#E91E63', // pink
  '#795548', // brown
  '#607D8B', // blue grey
  '#9C27B0', // deep purple
];

// Time conversion factors (to milliseconds)
const TIME_FACTORS = {
  milliseconds: 1,
  seconds: 1000,
  minutes: 60 * 1000
};

const PlotView: React.FC = () => {
  // State for CSV data handling
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [columnInfo, setColumnInfo] = useState<Record<string, ColumnInfo>>({});
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [timeColumn, setTimeColumn] = useState<string>('elapsed_ms');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  
  // Time resolution and range state
  const [timeResolution, setTimeResolution] = useState<TimeResolution>('seconds');
  const [timeRange, setTimeRange] = useState<TimeRange>({ start: 0, end: 0 });
  const [globalTimeRange, setGlobalTimeRange] = useState<TimeRange>({ start: 0, end: 0 });
  
  // Convert raw time data to the current resolution
  const convertTimeValue = (msValue: number): number => {
    return msValue / TIME_FACTORS[timeResolution];
  };
  
  // Process the CSV file
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFilename(file.name);
    setIsLoading(true);
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          setIsLoading(false);
          return;
        }
        
        // Extract data and columns
        const parsedData = results.data as CsvData[];
        if (parsedData.length === 0) {
          setError('CSV file contains no data rows');
          setIsLoading(false);
          return;
        }
        
        // Get all column names
        const allColumns = Object.keys(parsedData[0]);
        
        // Calculate column statistics and determine type
        const colInfo: Record<string, ColumnInfo> = {};
        allColumns.forEach(col => {
          const values = parsedData.map(row => row[col]).filter(val => val !== null && val !== undefined);
          const numericValues = values.filter(val => typeof val === 'number') as number[];
          
          if (numericValues.length > 0) {
            const min = parseFloat(Math.min(...numericValues).toFixed(2));
            const max = parseFloat(Math.max(...numericValues).toFixed(2));
            const sum = numericValues.reduce((a, b) => a + b, 0);
            const avg = parseFloat((sum / numericValues.length).toFixed(2));
            
            colInfo[col] = {
              name: col,
              min,
              max,
              avg,
              type: 'number'
            };
          } else {
            colInfo[col] = {
              name: col,
              min: 0,
              max: 0,
              avg: 0,
              type: typeof values[0] === 'string' ? 'string' : 'unknown'
            };
          }
        });
        
        // Automatically select timestamp or elapsed_ms as time column if available
        let defaultTimeColumn = 'elapsed_ms';
        if (allColumns.includes('elapsed_ms')) {
          defaultTimeColumn = 'elapsed_ms';
        } else if (allColumns.includes('timestamp')) {
          defaultTimeColumn = 'timestamp';
        }
        
        // Sort the data by time
        let timeData = [...parsedData];
        if (defaultTimeColumn === 'elapsed_ms') {
          timeData.sort((a, b) => (a.elapsed_ms as number) - (b.elapsed_ms as number));
        }
        
        // Set the global time range based on the sorted data
        if (defaultTimeColumn === 'elapsed_ms' && timeData.length > 0) {
          const startTime = timeData[0].elapsed_ms as number;
          const endTime = timeData[timeData.length - 1].elapsed_ms as number;
          
          setGlobalTimeRange({
            start: startTime,
            end: endTime
          });
          
          setTimeRange({
            start: startTime,
            end: endTime
          });
        }
        
        setCsvData(timeData);
        setColumns(allColumns);
        setColumnInfo(colInfo);
        setSelectedColumns([]);
        setTimeColumn(defaultTimeColumn);
        setIsLoading(false);
      },
      error: (error) => {
        setError(`Error reading CSV file: ${error.message}`);
        setIsLoading(false);
      }
    });
    
    // Reset file input so the same file can be selected again
    event.target.value = '';
  }, []);
  
  // Handle column selection
  const handleColumnSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedColumns(event.target.value as string[]);
  };
  
  // Handle time column selection
  const handleTimeColumnSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTimeColumn(event.target.value as string);
  };
  
  // Handle time resolution change
  const handleTimeResolutionChange = (
    event: React.MouseEvent<HTMLElement>,
    newResolution: TimeResolution | null
  ) => {
    if (newResolution !== null) {
      setTimeResolution(newResolution);
    }
  };
  
  // Format time values for display based on selected resolution
  const formatTimeValue = (value: any): string => {
    if (timeColumn === 'timestamp' && typeof value === 'string') {
      // Handle timestamp strings
      try {
        const date = new Date(value);
        return date.toLocaleTimeString();
      } catch {
        return value;
      }
    } else if (timeColumn === 'elapsed_ms' && typeof value === 'number') {
      // Format based on the selected time unit
      switch (timeResolution) {
        case 'milliseconds':
          return `${value.toFixed(0)} ms`;
        case 'seconds':
          return `${value.toFixed(2)} s`;
        case 'minutes':
          const minutes = Math.floor(value / 60);
          const seconds = (value % 60).toFixed(1);
          return `${minutes}:${seconds.padStart(4, '0')}`;
      }
    }
    // Default fallback
    return String(value);
  };
  
  // Process data for the chart with filtering by time range
  const getChartData = useCallback(() => {
    if (!csvData.length || !selectedColumns.length) return [];
    
    // Filter and convert time
    const filteredData = csvData.filter(row => {
      if (timeColumn !== 'elapsed_ms') return true;
      
      const timeValue = row[timeColumn] as number;
      return timeValue >= timeRange.start && timeValue <= timeRange.end;
    });
    
    // Map to new data points
    return filteredData.map(row => {
      const rowData: Record<string, any> = {};
      
      // Handle time column - convert to appropriate unit
      if (timeColumn === 'elapsed_ms') {
        const msValue = row[timeColumn] as number;
        rowData[timeColumn] = convertTimeValue(msValue);
        rowData.originalMs = msValue;  // Keep original for reference
      } else {
        rowData[timeColumn] = row[timeColumn];
      }
      
      // Add selected data columns
      selectedColumns.forEach(col => {
        rowData[col] = row[col];
      });
      
      return rowData;
    });
  }, [csvData, selectedColumns, timeColumn, timeRange, timeResolution]);
  
  // Get domain for Y axis
  const getYDomain = useCallback(() => {
    if (!selectedColumns.length) return [0, 100];
    
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    
    selectedColumns.forEach(col => {
      if (columnInfo[col]) {
        min = Math.min(min, columnInfo[col].min);
        max = Math.max(max, columnInfo[col].max);
      }
    });
    
    // Add some padding
    const padding = Math.max(0.1, (max - min) * 0.1);
    return [Math.max(0, min - padding), max + padding];
  }, [selectedColumns, columnInfo]);
  
  // Get the appropriate time unit label
  const getTimeUnitLabel = (): string => {
    switch (timeResolution) {
      case 'milliseconds':
        return 'Time (ms)';
      case 'seconds':
        return 'Time (sec)';
      case 'minutes':
        return 'Time (min)';
      default:
        return 'Time';
    }
  };
  
  // Handle time range slider changes
  const handleTimeRangeChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      const [start, end] = newValue;
      setTimeRange({
        start: (start / 100) * (globalTimeRange.end - globalTimeRange.start) + globalTimeRange.start,
        end: (end / 100) * (globalTimeRange.end - globalTimeRange.start) + globalTimeRange.start
      });
    }
  };
  
  // Zoom in - increase detail by showing a narrower range
  const handleZoomIn = () => {
    const range = timeRange.end - timeRange.start;
    const center = (timeRange.start + timeRange.end) / 2;
    const newRange = range / 2;
    
    setTimeRange({
      start: Math.max(globalTimeRange.start, center - newRange / 2),
      end: Math.min(globalTimeRange.end, center + newRange / 2)
    });
  };
  
  // Zoom out - decrease detail by showing a wider range
  const handleZoomOut = () => {
    const range = timeRange.end - timeRange.start;
    const center = (timeRange.start + timeRange.end) / 2;
    const newRange = range * 2;
    
    setTimeRange({
      start: Math.max(globalTimeRange.start, center - newRange / 2),
      end: Math.min(globalTimeRange.end, center + newRange / 2)
    });
  };
  
  // Reset zoom to show full range
  const handleResetZoom = () => {
    setTimeRange({
      start: globalTimeRange.start,
      end: globalTimeRange.end
    });
  };
  
  // Pan left/right
  const handlePan = (direction: 'left' | 'right') => {
    const range = timeRange.end - timeRange.start;
    const panAmount = range * 0.2; // Pan by 20% of the visible range
    
    if (direction === 'left') {
      setTimeRange({
        start: Math.max(globalTimeRange.start, timeRange.start - panAmount),
        end: timeRange.end - panAmount
      });
    } else {
      setTimeRange({
        start: timeRange.start + panAmount,
        end: Math.min(globalTimeRange.end, timeRange.end + panAmount)
      });
    }
  };
  
  // Jump to start/end
  const handleJumpToEdge = (edge: 'start' | 'end') => {
    const range = timeRange.end - timeRange.start;
    
    if (edge === 'start') {
      setTimeRange({
        start: globalTimeRange.start,
        end: globalTimeRange.start + range
      });
    } else {
      setTimeRange({
        start: globalTimeRange.end - range,
        end: globalTimeRange.end
      });
    }
  };
  
  // Calculate slider range values (0-100)
  const getSliderValue = (): number[] => {
    if (globalTimeRange.start === globalTimeRange.end) return [0, 100];
    
    const totalRange = globalTimeRange.end - globalTimeRange.start;
    const startPercent = ((timeRange.start - globalTimeRange.start) / totalRange) * 100;
    const endPercent = ((timeRange.end - globalTimeRange.start) / totalRange) * 100;
    
    return [startPercent, endPercent];
  };
  
  // Prepare chart data
  const chartData = getChartData();
  const yDomain = getYDomain();
  const sliderValue = getSliderValue();
  
  // Calculate time stats
  const visibleRangeMs = timeRange.end - timeRange.start;
  const visibleRangeFormatted = formatTimeValue(convertTimeValue(visibleRangeMs));
  const totalRangeMs = globalTimeRange.end - globalTimeRange.start;
  const percentVisible = Math.round((visibleRangeMs / totalRangeMs) * 100);
  
  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto', // This allows scrolling the entire container
    }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Metrics Plot View
        </Typography>
        
        {/* CSV Upload Section */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              component="label"
              startIcon={<Upload />}
              disabled={isLoading}
            >
              Upload CSV
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileUpload}
              />
            </Button>
            
            {isLoading && <CircularProgress size={24} />}
            
            {filename && !isLoading && (
              <Typography variant="body2" color="text.secondary">
                File: {filename}
              </Typography>
            )}
            
            {error && (
              <Alert severity="error" sx={{ flexGrow: 1 }}>
                {error}
              </Alert>
            )}
          </Stack>
        </Paper>
        
        <Grid container spacing={3}>
          {/* Data Selection Controls */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {/* Time Column Selector */}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth disabled={columns.length === 0}>
                    <InputLabel id="time-column-label">Time Axis</InputLabel>
                    <Select
                      labelId="time-column-label"
                      value={timeColumn}
                      onChange={handleTimeColumnSelect}
                      label="Time Axis"
                    >
                      {columns.map(col => (
                        <MenuItem key={col} value={col}>
                          {col}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Signal Columns Selector */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={columns.length === 0}>
                    <InputLabel id="columns-label">Select Signals</InputLabel>
                    <Select
                      labelId="columns-label"
                      multiple
                      value={selectedColumns}
                      onChange={handleColumnSelect}
                      input={<OutlinedInput label="Select Signals" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300
                          }
                        }
                      }}
                    >
                      {columns
                        .filter(col => col !== timeColumn && columnInfo[col]?.type === 'number')
                        .map(col => (
                          <MenuItem key={col} value={col}>
                            <Checkbox checked={selectedColumns.indexOf(col) > -1} />
                            <ListItemText primary={col} />
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Time Resolution Selection */}
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Time Resolution
                    </Typography>
                    <ToggleButtonGroup
                      value={timeResolution}
                      exclusive
                      onChange={handleTimeResolutionChange}
                      aria-label="time resolution"
                      disabled={columns.length === 0 || timeColumn !== 'elapsed_ms'}
                      size="small"
                      sx={{ justifySelf: 'flex-end' }}
                    >
                      <ToggleButton value="milliseconds">ms</ToggleButton>
                      <ToggleButton value="seconds">sec</ToggleButton>
                      <ToggleButton value="minutes">min</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Main Chart Container */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2, height: 500 }}>
              {/* Chart Title and Controls */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 1 
              }}>
                <Typography variant="h6">
                  {selectedColumns.length ? 'Signal Values Over Time' : 'Upload a CSV file to view data'}
                </Typography>
                
                {/* Navigation Controls */}
                {csvData.length > 0 && selectedColumns.length > 0 && (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Jump to Start">
                      <IconButton onClick={() => handleJumpToEdge('start')} size="small">
                        <ChevronsLeft size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Pan Left">
                      <IconButton onClick={() => handlePan('left')} size="small">
                        <ArrowLeft size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom Out">
                      <IconButton onClick={handleZoomOut} size="small">
                        <ZoomOut size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset View">
                      <IconButton onClick={handleResetZoom} size="small">
                        <RefreshCw size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom In">
                      <IconButton onClick={handleZoomIn} size="small">
                        <ZoomIn size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Pan Right">
                      <IconButton onClick={() => handlePan('right')} size="small">
                        <ArrowRight size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Jump to End">
                      <IconButton onClick={() => handleJumpToEdge('end')} size="small">
                        <ChevronsRight size={18} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              </Box>
              
              {/* Time Range Slider */}
              {csvData.length > 0 && selectedColumns.length > 0 && timeColumn === 'elapsed_ms' && (
                <Box sx={{ px: 2, py: 1 }}>
                  <Slider
                    value={sliderValue}
                    onChange={handleTimeRangeChange}
                    aria-labelledby="time-range-slider"
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => {
                      const ms = (value / 100) * (globalTimeRange.end - globalTimeRange.start) + globalTimeRange.start;
                      return formatTimeValue(convertTimeValue(ms));
                    }}
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mt: 0.5
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeValue(convertTimeValue(globalTimeRange.start))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Showing {visibleRangeFormatted} range ({percentVisible}% of total)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeValue(convertTimeValue(globalTimeRange.end))}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {/* Main Chart */}
              <Box 
                sx={{ 
                  height: 'calc(100% - 100px)', // Adjust based on header and slider height
                  width: '100%',
                  position: 'relative',
                }}
              >
                {csvData.length > 0 && selectedColumns.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={chartData} 
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey={timeColumn} 
                        tickFormatter={formatTimeValue}
                        label={{ 
                          value: getTimeUnitLabel(), 
                          position: 'insideBottomRight', 
                          offset: -10 
                        }}
                        type={timeColumn === 'elapsed_ms' ? 'number' : 'category'}
                        domain={timeColumn === 'elapsed_ms' ? ['auto', 'auto'] : undefined}
                      />
                      <YAxis 
                        domain={yDomain}
                        label={{ 
                          value: 'Value', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: -5
                        }}
                        tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
                      />
                      <RechartsTooltip 
                        formatter={(value, name) => [
                          typeof value === 'number' ? value.toFixed(2) : value,
                          name
                        ]}
                        labelFormatter={(value) => {
                          if (timeColumn === 'elapsed_ms') {
                            return `Time: ${formatTimeValue(value)}`;
                          }
                          return `Time: ${value}`;
                        }}
                      />
                      <Legend />
                      {selectedColumns.map((column, index) => (
                        <Line
                          key={column}
                          type="monotone"
                          dataKey={column}
                          stroke={COLORS[index % COLORS.length]}
                          dot={chartData.length < 100} // Only show dots if fewer than 100 points
                          activeDot={{ r: 8 }}
                          name={column}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      {csvData.length === 0 
                        ? "Upload a CSV file to visualize data" 
                        : "Select at least one signal to plot"}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Data info panel with selected time range details */}
          {csvData.length > 0 && selectedColumns.length > 0 && (
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Visible Time Range
                      </Typography>
                      <Typography variant="subtitle2">
                        {formatTimeValue(convertTimeValue(timeRange.start))} — {formatTimeValue(convertTimeValue(timeRange.end))}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Points Visible
                      </Typography>
                      <Typography variant="subtitle2">
                        {chartData.length} / {csvData.length} ({Math.round((chartData.length / csvData.length) * 100)}%)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
          
          {/* Signal Statistics */}
          {selectedColumns.length > 0 && (
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Signal Statistics
                </Typography>
                <Grid container spacing={2}>
                  {selectedColumns.map((column, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={column}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          borderLeft: `4px solid ${COLORS[index % COLORS.length]}`,
                          height: '100%'
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                          {column}
                        </Typography>
                        <Stack spacing={1}>
                          <Typography variant="body2" display="flex" justifyContent="space-between">
                            <span>Min:</span> <strong>{columnInfo[column]?.min.toFixed(2)}</strong>
                          </Typography>
                          <Typography variant="body2" display="flex" justifyContent="space-between">
                            <span>Max:</span> <strong>{columnInfo[column]?.max.toFixed(2)}</strong>
                          </Typography>
                          <Typography variant="body2" display="flex" justifyContent="space-between">
                            <span>Avg:</span> <strong>{columnInfo[column]?.avg.toFixed(2)}</strong>
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default PlotView;