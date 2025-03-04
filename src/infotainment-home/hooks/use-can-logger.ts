import { useState, useEffect, useRef, useCallback } from 'react';

// API configuration
const API_BASE_URL = 'http://localhost:8000';

export interface LogEntry {
  timestamp: string;
  [key: string]: any;
}

export interface LogStatus {
  is_logging: boolean;
  entries_count: number;
  current_log_id: number;
}

export interface LogFile {
  filename: string;
  size_bytes: number;
  created: string;
  id: number;
}

export const useCanLogger = () => {
  const [isLogging, setIsLogging] = useState(false);
  const [currentLogId, setCurrentLogId] = useState(0);
  const [entriesCount, setEntriesCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pollingInterval = useRef<number | null>(null);

  // Check initial logging status on mount
  useEffect(() => {
    fetchLoggingStatus();
    
    // Start polling for status updates
    pollingInterval.current = window.setInterval(() => {
      if (isLogging) {
        fetchLoggingStatus();
      }
    }, 1000);
    
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isLogging]);

  // Fetch current logging status from the server
  const fetchLoggingStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logging/status`);
      if (!response.ok) {
        throw new Error(`Failed to fetch logging status: ${response.statusText}`);
      }
      
      const status: LogStatus = await response.json();
      setIsLogging(status.is_logging);
      setCurrentLogId(status.current_log_id);
      setEntriesCount(status.entries_count);
    } catch (err) {
      console.error('Error fetching logging status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Start logging
  const startLogging = async (signalKeys?: string[]): Promise<boolean> => {
    try {
      const payload = signalKeys ? { signals_to_log: signalKeys } : {};
      
      console.log('Starting logging with signal keys:', payload);
      
      const response = await fetch(`${API_BASE_URL}/logging/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start logging: ${response.statusText}`);
      }
      
      const result = await response.json();
      setIsLogging(true);
      setCurrentLogId(result.log_id);
      setEntriesCount(0);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error starting logging:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  // Stop logging
  const stopLogging = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/logging/stop`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to stop logging: ${response.statusText}`);
      }
      
      const result = await response.json();
      setIsLogging(false);
      setError(null);
      
      // If we want to download the file automatically
      // if (result.status !== 'empty') {
      //   window.open(`${API_BASE_URL}/logging/download/${result.log_id}`, '_blank');
      // }
      
      return true;
    } catch (err) {
      console.error('Error stopping logging:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  // Toggle logging state
  const toggleLogging = useCallback(async (signalKeys?: string[]) => {
    if (isLogging) {
      await stopLogging();
    } else {
      await startLogging(signalKeys);
    }
  }, [isLogging]);

  // Get list of available logs
  const getLogList = async (): Promise<LogFile[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/logging/list`);
      if (!response.ok) {
        throw new Error(`Failed to fetch log list: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error fetching log list:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    }
  };

  // Download a specific log file
  const downloadLog = (logId: number) => {
    window.open(`${API_BASE_URL}/logging/download/${logId}`, '_blank');
  };

  return {
    isLogging,
    toggleLogging,
    currentLogId,
    currentLogEntries: entriesCount,
    error,
    getLogList,
    downloadLog
  };
};