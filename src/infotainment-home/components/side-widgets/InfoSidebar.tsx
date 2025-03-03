/**
 * Side panel component that displays vehicle information cards.
 * Shows driver profile, pack voltage information, and technical specifications.
 */

import React, { useEffect } from 'react';
import { Box, Stack } from '@mui/material';
import DriverProfile from './driver-profile/driver-profile';
import PackVoltageDisplay from './Range-info/pack-voltage-display';
import TechnicalSpecs from './tech-specs/tech-specs';
import { BMS_KEYS, INVERTER_KEYS } from '../../constants/can-keys';

interface InfoSidebarProps {
  vehicleData: Record<string, number> | undefined;
  isLoading: boolean;
  error: unknown;
  onBoxClick: (appName: string) => void;
  zIndex: number;
}

const InfoSidebar = ({ 
  vehicleData, 
  isLoading, 
  error, 
  onBoxClick, 
  zIndex 
}: InfoSidebarProps): JSX.Element => {
  const boxStyle = {
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.02)'
    }
  };

  // Debug: Log the vehicleData and key values
  useEffect(() => {
    if (vehicleData) {
      // Check both possible voltage values
      const synthVoltage = vehicleData['BMS_TX_STATE_5.Volt_Synth_x10_V'];
      const dcBusVoltage = vehicleData['M167_Voltage_Info.INV_DC_Bus_Voltage'];
      const volt1 = vehicleData['BMS_TX_STATE_5.Volt_1_x10_V'];
      const volt2 = vehicleData['BMS_TX_STATE_5.Volt_2_x10_V'];
      
      console.log('Voltage Values:', {
        'BMS_TX_STATE_5.Volt_Synth_x10_V': synthVoltage,
        'M167_Voltage_Info.INV_DC_Bus_Voltage': dcBusVoltage,
        'BMS_TX_STATE_5.Volt_1_x10_V': volt1,
        'BMS_TX_STATE_5.Volt_2_x10_V': volt2,
      });
    }
  }, [vehicleData]);

  // Try multiple voltage sources - use the first one that has a value
  let packVoltage = 0;
  if (!isLoading && !error && vehicleData) {
    // Try DC Bus Voltage first (from Inverter)
    packVoltage = vehicleData[INVERTER_KEYS.DC_BUS_VOLTAGE] ?? 0;
    
    // If that's 0, try the synthesized voltage
    if (packVoltage === 0) {
      packVoltage = vehicleData['BMS_TX_STATE_5.Volt_Synth_x10_V'] ?? 0;
    }
    
    // If still 0, try Volt_1
    if (packVoltage === 0) {
      packVoltage = vehicleData['BMS_TX_STATE_5.Volt_1_x10_V'] ?? 0;
    }
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '200px',
        zIndex
      }}
    >
      <Stack spacing={2}>
        <Box onClick={() => onBoxClick('Profile')} sx={boxStyle}>
          <DriverProfile />
        </Box>
        <Box onClick={() => onBoxClick('Voltage')} sx={boxStyle}>
          <PackVoltageDisplay voltage={packVoltage} />
        </Box>
        <Box onClick={() => onBoxClick('Technical')} sx={boxStyle}>
          <TechnicalSpecs 
            imdResPos={isLoading || error ? 0 : vehicleData?.[BMS_KEYS.IMD_RES_POS] ?? 0}
            imdResNeg={isLoading || error ? 0 : vehicleData?.[BMS_KEYS.IMD_RES_NEG] ?? 0}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default InfoSidebar;