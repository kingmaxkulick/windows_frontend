import React, { useState, useCallback, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';

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
            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            const sum = numericValues.reduce((a, b) => a + b, 0);
            const avg = sum / numericValues.length;
            
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
        
        // Filter out non-numeric columns except time
        const numericColumns = allColumns.filter(col => 
          colInfo[col].type === 'number' && col !== defaultTimeColumn
        );
        
        // Auto-select up to 3 numeric columns
        const autoSelectedColumns = numericColumns.slice(0, 3);
        
        setCsvData(parsedData);
        setColumns(allColumns);
        setColumnInfo(colInfo);
        setSelectedColumns(autoSelectedColumns);
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
  
  // Format time values for display
  const formatTimeValue = (value: any): string => {
    if (timeColumn === 'timestamp' && typeof value === 'string') {
      // Try to extract time portion from ISO timestamp
      try {
        const date = new Date(value);
        return date.toLocaleTimeString();
      } catch {
        return value;
      }
    } else if (timeColumn === 'elapsed_ms' && typeof value === 'number') {
      // Convert milliseconds to seconds
      return `${(value / 1000).toFixed(1)}s`;
    }
    // Default fallback
    return String(value);
  };
  
  // Process data for the LineChart
  const getChartData = useCallback(() => {
    if (!csvData.length || !selectedColumns.length) return [];
    
    // Sort by time column if numeric
    let sortedData = [...csvData];
    if (columnInfo[timeColumn]?.type === 'number') {
      sortedData.sort((a, b) => a[timeColumn] - b[timeColumn]);
    }
    
    // Return only necessary data for the chart
    return sortedData.map(row => {
      const newRow: Record<string, any> = {
        [timeColumn]: row[timeColumn]
      };
      
      selectedColumns.forEach(col => {
        newRow[col] = row[col];
      });
      
      return newRow;
    });
  }, [csvData, selectedColumns, timeColumn, columnInfo]);
  
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
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [selectedColumns, columnInfo]);
  
  // Prepare chart data
  const chartData = getChartData();
  const yDomain = getYDomain();
  
  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
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
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={8}>
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
            </Grid>
          </Paper>
        </Grid>
        
        {/* Main Line Chart */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, height: 500 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedColumns.length ? 'Signal Values Over Time' : 'Upload a CSV file to view data'}
            </Typography>
            
            {csvData.length > 0 && selectedColumns.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={timeColumn} 
                    tickFormatter={formatTimeValue}
                    label={{ value: timeColumn, position: 'insideBottomRight', offset: -10 }}
                  />
                  <YAxis 
                    domain={yDomain} 
                    label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}`, '']}
                    labelFormatter={(value) => `Time: ${formatTimeValue(value)}`}
                  />
                  <Legend />
                  {selectedColumns.map((column, index) => (
                    <Line
                      key={column}
                      type="monotone"
                      dataKey={column}
                      stroke={COLORS[index % COLORS.length]}
                      dot={false}
                      activeDot={{ r: 8 }}
                      name={column}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box 
                sx={{ 
                  height: '85%', 
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
          </Paper>
        </Grid>
        
        {/* Column Statistics */}
        {selectedColumns.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Signal Statistics
              </Typography>
              <Grid container spacing={2}>
                {selectedColumns.map((column, index) => (
                  <Grid item xs={12} sm={6} md={4} key={column}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        borderLeft: `4px solid ${COLORS[index % COLORS.length]}` 
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {column}
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Min: {columnInfo[column]?.min.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Max: {columnInfo[column]?.max.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Avg: {columnInfo[column]?.avg.toFixed(2)}
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
  );
};

export default PlotView;