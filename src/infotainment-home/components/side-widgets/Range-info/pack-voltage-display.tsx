import { type ReactElement } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import React from 'react'
import { INVERTER_KEYS } from '../../../constants/can-keys'

interface PackVoltageDisplayProps {
  // Using the DC bus voltage as pack voltage
  voltage: number
}

/**
 * Displays the pack voltage using the DC bus voltage from the inverter
 * Signal: M167_Voltage_Info.INV_DC_Bus_Voltage
 */
const PackVoltageDisplay = ({ voltage }: PackVoltageDisplayProps): ReactElement => {
  // Format the voltage to 1 decimal place
  const formattedVoltage = voltage.toFixed(1);
  
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'rgba(220, 220, 225, 0.8)',
        borderRadius: 1,
        p: 1.5,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Typography
        variant="body1"
        sx={{
          color: 'rgba(0, 0, 0, 1)',
          mb: 1
        }}
      >
        PACK VOLTAGE
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 1)' }}>
        {formattedVoltage} V
      </Typography>
    </Paper>
  )
}

export default PackVoltageDisplay