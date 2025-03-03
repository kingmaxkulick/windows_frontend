/**
 * Centralized CAN bus signal keys and thresholds used throughout the application.
 * This file consolidates all CAN signal references to ensure consistency and reduce duplication.
 */

// ===== BATTERY MANAGEMENT SYSTEM (BMS) SIGNALS =====
export const BMS_KEYS = {
  // State signals
  UPTIME: 'BMS_TX_STATE_1.Uptime_ms',
  FAULT_PRESENT: 'BMS_TX_STATE_2.DEM_Present',
  APP_STATE: 'BMS_TX_STATE_3.App_State_App',
  
  // Power and energy signals
  POWER: 'BMS_TX_STATE_4.Power_W',
  
  // Voltage signals
  VOLT_1: 'BMS_TX_STATE_5.Volt_1_x10_V',
  VOLT_2: 'BMS_TX_STATE_5.Volt_2_x10_V',
  
  // Cell voltage signals
  CELL_MIN_VOLTAGE: 'BMS_TX_STATE_6.Cell_Min_V',
  CELL_MAX_VOLTAGE: 'BMS_TX_STATE_6.Cell_Max_V',
  CELL_AVG_VOLTAGE: 'BMS_TX_STATE_6.Cell_Avg_V',
  BATTERY_LEVEL: 'BMS_TX_STATE_6.Cell_Avg_V', // Alias for battery level calculations
  
  // Temperature signals
  CELL_TEMP_MIN: 'BMS_TX_STATE_7.Cell_Temp_Min_degC',
  CELL_TEMP_MAX: 'BMS_TX_STATE_7.Cell_Temp_Max_degC',
  CELL_TEMP_AVG: 'BMS_TX_STATE_7.Cell_Temp_Avg_degC',
  TEMP_1: 'BMS_TX_STATE_7.Temp_1_degC',
  TEMP_2: 'BMS_TX_STATE_7.Temp_2_degC',
  TEMP_3: 'BMS_TX_STATE_7.Temp_3_degC',
  TEMP_4: 'BMS_TX_STATE_7.Temp_4_degC',
  BATTERY_TEMP: 'BMS_TX_STATE_7.Cell_Temp_Max_degC', // Alias for highest battery temp
  
  // Isolation resistance signals
  IMD_RES_POS: 'BMS_TX_STATE_10.IMD_Res_Pos_kohm',
  IMD_RES_NEG: 'BMS_TX_STATE_10.IMD_Res_Neg_kohm'
};

// ===== INVERTER SIGNALS =====
export const INVERTER_KEYS = {
  // State signals
  INV_STATE: 'M170_Internal_States.INV_Inverter_State',
  INV_VSM_STATE: 'M170_Internal_States.INV_VSM_State',
  
  // Pack voltage (used for main display)
  PACK_VOLTAGE: 'M167_Voltage_Info.INV_DC_Bus_Voltage', // Primary pack voltage signal
  
  // Temperature signals
  INV_MODULE_A_TEMP: 'M160_Temperature_Set_1.INV_Module_A_Temp',
  INV_MODULE_B_TEMP: 'M160_Temperature_Set_1.INV_Module_B_Temp',
  INV_MODULE_C_TEMP: 'M160_Temperature_Set_1.INV_Module_C_Temp',
  INV_MOTOR_TEMP: 'M162_Temperature_Set_3.INV_Motor_Temp',
  INV_HOT_SPOT_TEMP: 'M162_Temperature_Set_3.INV_Hot_Spot_Temp',
  MOTOR_TEMP: 'M162_Temperature_Set_3.INV_Motor_Temp', // Alias for common usage
  
  // Current and voltage signals
  DC_BUS_CURRENT: 'M166_Current_Info.INV_DC_Bus_Current',
  DC_BUS_VOLTAGE: 'M167_Voltage_Info.INV_DC_Bus_Voltage',
  
  // Motor signals
  MOTOR_SPEED: 'M165_Motor_Position_Info.INV_Motor_Speed',
  
  // Torque signals
  COMMANDED_TORQUE: 'M172_Torque_And_Timer_Info.INV_Commanded_Torque',
  TORQUE_FEEDBACK: 'M172_Torque_And_Timer_Info.INV_Torque_Feedback'
};

// ===== VEHICLE STATE SIGNALS =====
export const VEHICLE_KEYS = {
  VEHICLE_STATE: 'Veh_States_Monitoring.br_vehicle_state',
  VEHICLE_MODE: 'br_vehicle_moding.Veh_Moding_State_Machine',
};

// ===== BMS COMMAND TEMPERATURE SIGNALS =====
// Generate keys for CMD1 through CMD15
export const BMS_CMD_TEMP_KEYS = Array.from({ length: 15 }, (_, i) => {
  const cmdNum = i + 1;
  return {
    [`CMD${cmdNum}_TEMP1`]: `BMS_TX_CMD_${cmdNum}.CellTemp1`,
    [`CMD${cmdNum}_TEMP2`]: `BMS_TX_CMD_${cmdNum}.CellTemp2`,
    [`CMD${cmdNum}_TEMP3`]: `BMS_TX_CMD_${cmdNum}.CellTemp3`,
    [`CMD${cmdNum}_TEMP4`]: `BMS_TX_CMD_${cmdNum}.CellTemp4`,
  };
}).reduce((acc, curr) => ({ ...acc, ...curr }), {});

/**
 * Groups CAN signals by their specific module or function
 */
export const SIGNAL_GROUPS = {
  BATTERY: [
    BMS_KEYS.CELL_MIN_VOLTAGE,
    BMS_KEYS.CELL_MAX_VOLTAGE,
    BMS_KEYS.CELL_AVG_VOLTAGE,
    BMS_KEYS.VOLT_1,
    BMS_KEYS.VOLT_2,
    INVERTER_KEYS.PACK_VOLTAGE,
  ],
  TEMPERATURE: [
    BMS_KEYS.CELL_TEMP_MIN,
    BMS_KEYS.CELL_TEMP_MAX,
    BMS_KEYS.CELL_TEMP_AVG,
    BMS_KEYS.TEMP_1,
    BMS_KEYS.TEMP_2,
    BMS_KEYS.TEMP_3,
    BMS_KEYS.TEMP_4,
    INVERTER_KEYS.INV_MOTOR_TEMP,
    INVERTER_KEYS.INV_HOT_SPOT_TEMP,
    INVERTER_KEYS.INV_MODULE_A_TEMP,
    INVERTER_KEYS.INV_MODULE_B_TEMP,
    INVERTER_KEYS.INV_MODULE_C_TEMP,
  ],
  ISOLATION: [
    BMS_KEYS.IMD_RES_POS,
    BMS_KEYS.IMD_RES_NEG,
  ],
  MOTOR: [
    INVERTER_KEYS.MOTOR_SPEED,
    INVERTER_KEYS.COMMANDED_TORQUE,
    INVERTER_KEYS.TORQUE_FEEDBACK,
    INVERTER_KEYS.INV_MOTOR_TEMP,
  ],
  INVERTER: [
    INVERTER_KEYS.INV_STATE,
    INVERTER_KEYS.INV_VSM_STATE,
    INVERTER_KEYS.DC_BUS_VOLTAGE,
    INVERTER_KEYS.DC_BUS_CURRENT,
    INVERTER_KEYS.PACK_VOLTAGE,
  ],
};

/**
 * Define threshold config types for type safety
 */
type RangeThresholdConfig = {
  minThreshold: number;
  maxThreshold: number;
};

type StandardThresholdConfig = {
  threshold: number;
  isHigherBad: boolean;
};

type ThresholdConfig = RangeThresholdConfig | StandardThresholdConfig;

/**
 * Thresholds for various signals, used for warning indicators
 * and status monitoring
 */
export const SIGNAL_THRESHOLDS: Record<string, ThresholdConfig> = {
  // Isolation thresholds (range-based)
  [BMS_KEYS.IMD_RES_NEG]: { minThreshold: 62000, maxThreshold: 66000 },
  [BMS_KEYS.IMD_RES_POS]: { minThreshold: 62000, maxThreshold: 66000 },
  
  // Voltage thresholds
  [INVERTER_KEYS.DC_BUS_VOLTAGE]: { threshold: 450, isHigherBad: true },
  [INVERTER_KEYS.PACK_VOLTAGE]: { threshold: 450, isHigherBad: true },
  [BMS_KEYS.CELL_MIN_VOLTAGE]: { threshold: 2.8, isHigherBad: false }, // Low voltage is bad
  [BMS_KEYS.CELL_MAX_VOLTAGE]: { threshold: 4.2, isHigherBad: true },
  [BMS_KEYS.VOLT_1]: { threshold: 480, isHigherBad: true },
  [BMS_KEYS.VOLT_2]: { threshold: 480, isHigherBad: true },
  
  // Temperature thresholds (higher values are concerning)
  [BMS_KEYS.CELL_TEMP_MIN]: { threshold: -10, isHigherBad: false }, // Too cold is bad
  [BMS_KEYS.CELL_TEMP_MAX]: { threshold: 45, isHigherBad: true },
  [BMS_KEYS.CELL_TEMP_AVG]: { threshold: 40, isHigherBad: true },
  [BMS_KEYS.TEMP_1]: { threshold: 50, isHigherBad: true },
  [BMS_KEYS.TEMP_2]: { threshold: 50, isHigherBad: true },
  [BMS_KEYS.TEMP_3]: { threshold: 50, isHigherBad: true },
  [BMS_KEYS.TEMP_4]: { threshold: 50, isHigherBad: true },
  [INVERTER_KEYS.INV_MOTOR_TEMP]: { threshold: 100, isHigherBad: true },
  [INVERTER_KEYS.INV_HOT_SPOT_TEMP]: { threshold: 85, isHigherBad: true },
  [INVERTER_KEYS.INV_MODULE_A_TEMP]: { threshold: 80, isHigherBad: true },
  [INVERTER_KEYS.INV_MODULE_B_TEMP]: { threshold: 80, isHigherBad: true },
  [INVERTER_KEYS.INV_MODULE_C_TEMP]: { threshold: 80, isHigherBad: true },
  
  // Current thresholds
  [INVERTER_KEYS.DC_BUS_CURRENT]: { threshold: 300, isHigherBad: true },
  
  // Torque thresholds
  [INVERTER_KEYS.COMMANDED_TORQUE]: { threshold: 250, isHigherBad: true },
  [INVERTER_KEYS.TORQUE_FEEDBACK]: { threshold: 250, isHigherBad: true },
};

/**
 * Type guard to determine if a threshold config is a range-based threshold
 */
function isRangeThreshold(config: ThresholdConfig): config is RangeThresholdConfig {
  return 'minThreshold' in config && 'maxThreshold' in config;
}

/**
 * Helper function to check if a signal value exceeds its threshold
 * @param key The CAN signal key
 * @param value The current value of the signal
 * @returns boolean indicating if threshold is exceeded
 */
export const isExceedingThreshold = (key: string, value: number): boolean => {
  const thresholdConfig = SIGNAL_THRESHOLDS[key];
  if (!thresholdConfig) return false;
  
  // Handle range-based thresholds (for isolation resistance)
  if (isRangeThreshold(thresholdConfig)) {
    return value < thresholdConfig.minThreshold || value > thresholdConfig.maxThreshold;
  }
  
  // Handle standard thresholds
  return thresholdConfig.isHigherBad ? value > thresholdConfig.threshold : value < thresholdConfig.threshold;
};

/**
 * Maps signal keys to display names for UI rendering
 */
export const SIGNAL_DISPLAY_NAMES: Record<string, string> = {
  [BMS_KEYS.IMD_RES_NEG]: 'IMD Res Neg',
  [BMS_KEYS.IMD_RES_POS]: 'IMD Res Pos',
  [INVERTER_KEYS.INV_VSM_STATE]: 'INV VSM State',
  [INVERTER_KEYS.DC_BUS_VOLTAGE]: 'DC Bus Voltage',
  [INVERTER_KEYS.PACK_VOLTAGE]: 'Pack Voltage',
  [BMS_KEYS.CELL_MIN_VOLTAGE]: 'Cell Min Voltage',
  [BMS_KEYS.CELL_MAX_VOLTAGE]: 'Cell Max Voltage',
  [INVERTER_KEYS.INV_STATE]: 'Inverter State',
  [INVERTER_KEYS.COMMANDED_TORQUE]: 'Commanded Torque',
  [BMS_KEYS.CELL_TEMP_MIN]: 'Cell Temp Min',
  [BMS_KEYS.CELL_TEMP_MAX]: 'Cell Temp Max',
  [BMS_KEYS.CELL_TEMP_AVG]: 'Cell Temp Avg',
  [BMS_KEYS.TEMP_1]: 'Temp 1',
  [BMS_KEYS.TEMP_2]: 'Temp 2',
  [BMS_KEYS.TEMP_3]: 'Temp 3',
  [BMS_KEYS.TEMP_4]: 'Temp 4',
  [INVERTER_KEYS.INV_MOTOR_TEMP]: 'Motor Temperature',
  [INVERTER_KEYS.TORQUE_FEEDBACK]: 'Torque Feedback',
  [BMS_KEYS.VOLT_1]: 'Voltage 1',
  [BMS_KEYS.VOLT_2]: 'Voltage 2',
  [INVERTER_KEYS.INV_HOT_SPOT_TEMP]: 'Hot Spot Temp',
  [INVERTER_KEYS.DC_BUS_CURRENT]: 'DC Bus Current',
  [INVERTER_KEYS.INV_MODULE_A_TEMP]: 'INV Module A Temp',
  [INVERTER_KEYS.INV_MODULE_B_TEMP]: 'INV Module B Temp',
  [INVERTER_KEYS.INV_MODULE_C_TEMP]: 'INV Module C Temp',
};

/**
 * Maps signal keys to their units for UI rendering
 */
export const SIGNAL_UNITS: Record<string, string> = {
  // Voltage units
  [BMS_KEYS.VOLT_1]: 'V',
  [BMS_KEYS.VOLT_2]: 'V',
  [BMS_KEYS.CELL_MIN_VOLTAGE]: 'V',
  [BMS_KEYS.CELL_MAX_VOLTAGE]: 'V',
  [BMS_KEYS.CELL_AVG_VOLTAGE]: 'V',
  [INVERTER_KEYS.DC_BUS_VOLTAGE]: 'V',
  [INVERTER_KEYS.PACK_VOLTAGE]: 'V',
  
  // Temperature units
  [BMS_KEYS.CELL_TEMP_MIN]: '°C',
  [BMS_KEYS.CELL_TEMP_MAX]: '°C',
  [BMS_KEYS.CELL_TEMP_AVG]: '°C',
  [BMS_KEYS.TEMP_1]: '°C',
  [BMS_KEYS.TEMP_2]: '°C',
  [BMS_KEYS.TEMP_3]: '°C',
  [BMS_KEYS.TEMP_4]: '°C',
  [INVERTER_KEYS.INV_MOTOR_TEMP]: '°C',
  [INVERTER_KEYS.INV_HOT_SPOT_TEMP]: '°C',
  [INVERTER_KEYS.INV_MODULE_A_TEMP]: '°C',
  [INVERTER_KEYS.INV_MODULE_B_TEMP]: '°C',
  [INVERTER_KEYS.INV_MODULE_C_TEMP]: '°C',
  
  // Current units
  [INVERTER_KEYS.DC_BUS_CURRENT]: 'A',
  
  // Torque units
  [INVERTER_KEYS.COMMANDED_TORQUE]: 'Nm',
  [INVERTER_KEYS.TORQUE_FEEDBACK]: 'Nm',
  
  // Resistance units
  [BMS_KEYS.IMD_RES_POS]: 'kΩ',
  [BMS_KEYS.IMD_RES_NEG]: 'kΩ',
  
  // Speed units
  [INVERTER_KEYS.MOTOR_SPEED]: 'RPM',
};

/**
 * Categorizes signals for UI organization
 */
export const SIGNAL_CATEGORIES: Record<string, string> = {
  [BMS_KEYS.IMD_RES_NEG]: 'Isolation',
  [BMS_KEYS.IMD_RES_POS]: 'Isolation',
  [INVERTER_KEYS.INV_VSM_STATE]: 'Inverter States',
  [INVERTER_KEYS.INV_STATE]: 'Inverter States',
  [INVERTER_KEYS.DC_BUS_VOLTAGE]: 'Voltage',
  [INVERTER_KEYS.PACK_VOLTAGE]: 'Voltage',
  [BMS_KEYS.CELL_MIN_VOLTAGE]: 'Battery',
  [BMS_KEYS.CELL_MAX_VOLTAGE]: 'Battery',
  [BMS_KEYS.CELL_AVG_VOLTAGE]: 'Battery',
  [BMS_KEYS.VOLT_1]: 'Voltage',
  [BMS_KEYS.VOLT_2]: 'Voltage',
  [INVERTER_KEYS.COMMANDED_TORQUE]: 'Torque',
  [INVERTER_KEYS.TORQUE_FEEDBACK]: 'Torque',
  [BMS_KEYS.CELL_TEMP_MIN]: 'Temperature',
  [BMS_KEYS.CELL_TEMP_MAX]: 'Temperature',
  [BMS_KEYS.CELL_TEMP_AVG]: 'Temperature',
  [BMS_KEYS.TEMP_1]: 'Temperature',
  [BMS_KEYS.TEMP_2]: 'Temperature',
  [BMS_KEYS.TEMP_3]: 'Temperature',
  [BMS_KEYS.TEMP_4]: 'Temperature',
  [INVERTER_KEYS.INV_MOTOR_TEMP]: 'Temperature',
  [INVERTER_KEYS.INV_HOT_SPOT_TEMP]: 'Temperature',
  [INVERTER_KEYS.INV_MODULE_A_TEMP]: 'Temperature',
  [INVERTER_KEYS.INV_MODULE_B_TEMP]: 'Temperature',
  [INVERTER_KEYS.INV_MODULE_C_TEMP]: 'Temperature',
  [INVERTER_KEYS.DC_BUS_CURRENT]: 'Current',
  [INVERTER_KEYS.MOTOR_SPEED]: 'Motor',
};

/**
 * Order of categories for display - with Isolation at the top
 */
export const CATEGORY_ORDER = [
  'Isolation',
  'Voltage',
  'Current',
  'Temperature',
  'Battery',
  'Torque',
  'Motor',
  'Inverter States'
];