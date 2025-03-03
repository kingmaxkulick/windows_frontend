/**
 * React Query hooks for fetching and transforming vehicle data from the backend.
 * Provides specialized hooks for different data needs (charging status, technical metrics, etc.).
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query'

// Updated VehicleData interface to match backend response
export interface VehicleData {
  [key: string]: number;
}

// Types based on your backend models
export interface VehicleState {
  primary_state: string
  sub_state: string
  status_flags: string[]
  fault_present: boolean
  message_counter: number
}

export interface FaultStatus {
  source: string | null
  type: string | null
  severity: number
  timestamp: number
  counter: number
  active: boolean
}

// Transformed interfaces for UI components
export interface ChargingStatus {
  isCharging: boolean
  batteryLevel: number
  timeRemaining: number
  chargingPower: number
  voltage: number
  current: number
}

export interface TechnicalMetrics {
  batteryPercent: number
  motorTemp: number
}

export interface TireMetrics {
  tire_temp: number[]
  tire_pressure: number[]
}

// API configuration
const API_BASE_URL = 'http://localhost:8000'
const POLLING_INTERVAL = 500 // Reduced polling frequency to avoid spam

const fetchWithError = async <T>(url: string): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`)
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    throw error
  }
}

// ✅ Main vehicle data hook
export const useVehicleData = (): UseQueryResult<VehicleData, Error> => {
  const result = useQuery<VehicleData>({
    queryKey: ['vehicleData'],
    queryFn: () => fetchWithError<VehicleData>('/vehicle_data'),
    refetchInterval: POLLING_INTERVAL,
    retry: 2, // Retry twice if API fails
    staleTime: 5000, // Reduce unnecessary re-fetching
  });
  
  console.log("🔍 API Response from Backend:", result.data);
  return result;
}

// ✅ Charging status hook
export const useChargingStatus = (): UseQueryResult<ChargingStatus, Error> => {
  return useQuery<VehicleData, Error, ChargingStatus>({
    queryKey: ['vehicleData'],
    queryFn: () => fetchWithError<VehicleData>('/vehicle_data'),
    select: (data) => ({
      isCharging: data["BMS_TX_STATE_3.App_State_App"] > 50, // Adjust threshold based on your data
      batteryLevel: data["BMS_TX_STATE_6.Cell_Avg_V"] || 0,
      timeRemaining: 120, // You may calculate this from available data
      chargingPower: data["BMS_TX_STATE_4.Power_W"] || 0,
      voltage: 240, // Assuming constant voltage
      current: (data["BMS_TX_STATE_4.Power_W"] || 0) / 240 // Calculate current from power
    }),
    refetchInterval: POLLING_INTERVAL,
    retry: 2,
  })
}

// ✅ Technical metrics hook
export const useTechnicalMetrics = (): UseQueryResult<TechnicalMetrics, Error> => {
  return useQuery<VehicleData, Error, TechnicalMetrics>({
    queryKey: ['vehicleData'],
    queryFn: () => fetchWithError<VehicleData>('/vehicle_data'),
    select: (data) => ({
      batteryPercent: data["BMS_TX_STATE_6.Cell_Avg_V"] || 0,
      motorTemp: data["BMS_TX_STATE_7.Cell_Temp_Avg_degC"] || 0
    }),
    refetchInterval: POLLING_INTERVAL,
    retry: 2,
  })
}

// ✅ Tire metrics hook
export const useTireMetrics = (): UseQueryResult<TireMetrics, Error> => {
  return useQuery<VehicleData, Error, TireMetrics>({
    queryKey: ['vehicleData'],
    queryFn: () => fetchWithError<VehicleData>('/vehicle_data'),
    select: (data) => ({
      tire_temp: [
        data["BMS_TX_STATE_7.Temp_1_degC"] || 0,
        data["BMS_TX_STATE_7.Temp_2_degC"] || 0,
        data["BMS_TX_STATE_7.Temp_3_degC"] || 0,
        data["BMS_TX_STATE_7.Temp_4_degC"] || 0
      ],
      tire_pressure: [0, 0, 0, 0] // Replace with actual tire pressure fields if available
    }),
    refetchInterval: POLLING_INTERVAL,
    retry: 2,
  })
}

// ✅ Vehicle state hook
export const useVehicleState = (): UseQueryResult<VehicleState, Error> => {
  return useQuery<VehicleData, Error, VehicleState>({
    queryKey: ['vehicleData'],
    queryFn: () => fetchWithError<VehicleData>('/vehicle_data'),
    select: (data) => ({
      primary_state: data["BMS_TX_STATE_3.App_State_App"] > 50 ? "CHARGE" : "IDLE",
      sub_state: "NORMAL",
      status_flags: [], // Or derive from relevant data fields
      fault_present: data["BMS_TX_STATE_2.DEM_Present"] > 0,
      message_counter: Math.floor(data["BMS_TX_STATE_1.Uptime_ms"] || 0)
    }),
    refetchInterval: POLLING_INTERVAL,
    retry: 2,
  });
}