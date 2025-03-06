import { API_ENDPOINTS } from '../config/api';

export interface VehicleData {
  [key: string]: number | string | boolean | object;
}

class ApiService {
  // Fetch vehicle data
  async getVehicleData(): Promise<VehicleData> {
    try {
      const response = await fetch(API_ENDPOINTS.VEHICLE_DATA);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      throw error;
    }
  }

  // Get CAN statistics
  async getCanStatistics(): Promise<any> {
    try {
      const response = await fetch(API_ENDPOINTS.CAN_STATISTICS);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching CAN statistics:', error);
      throw error;
    }
  }

  // Start logging
  async startLogging(signalKeys?: string[]): Promise<any> {
    try {
      const response = await fetch(API_ENDPOINTS.LOGGING.START, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signals_to_log: signalKeys }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start logging: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error starting logging:', error);
      throw error;
    }
  }

  // Stop logging
  async stopLogging(): Promise<any> {
    try {
      const response = await fetch(API_ENDPOINTS.LOGGING.STOP, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to stop logging: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error stopping logging:', error);
      throw error;
    }
  }

  // Other API methods as needed...
}

export const apiService = new ApiService();
export default apiService;