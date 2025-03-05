import React from 'react'
import { type ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Fade from '@mui/material/Fade'
import { ChevronUp, ChevronDown } from 'lucide-react'
import acIcon from '../../../assets/ac.png'
import driverSeatIcon from '../../../assets/seat (2).png'
import passengerSeatIcon from '../../../assets/seat (2) right.png'

interface ClimateControlProps {
  open: boolean
  onClose: () => void
}

const ClimateControl = ({ open, onClose }: ClimateControlProps): ReactElement => {
  const [driverTemp, setDriverTemp] = useState(70)
  const [passengerTemp, setPassengerTemp] = useState(70)

  const adjustTemperature = (
    currentTemp: number,
    setTemp: (temp: number) => void,
    increment: boolean
  ): void => {
    const newTemp = increment ? currentTemp + 1 : currentTemp - 1
    if (newTemp >= 60 && newTemp <= 85) {
      setTemp(newTemp)
    }
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <Box
          onClick={onClose}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'transparent',
            zIndex: 1200
          }}
        />
      )}

      {/* Climate Controls */}
      <Fade in={open}>
        <Box
          sx={{
            position: 'fixed',
            bottom: '96px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '800px',
            zIndex: 1300
          }}
        >
          <Paper
            elevation={8}
            sx={{
              bgcolor: 'rgba(40, 40, 40, 0.95)',
              py: 1,
              px: 2,
              mx: 2,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {/* Left Side Controls */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <img src={driverSeatIcon} alt="Driver Seat" width={24} height={24} />
              </IconButton>

              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={() => adjustTemperature(driverTemp, setDriverTemp, false)}
                  sx={{ color: 'text.primary' }}
                >
                  <ChevronDown size={24} />
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: 45, textAlign: 'center' }}>
                  {driverTemp}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => adjustTemperature(driverTemp, setDriverTemp, true)}
                  sx={{ color: 'text.primary' }}
                >
                  <ChevronUp size={24} />
                </IconButton>
              </Stack>

              <IconButton size="small">
                <img src={acIcon} alt="Driver AC" width={24} height={24} />
              </IconButton>
            </Stack>

            {/* Right Side Controls */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton size="small">
                <img src={acIcon} alt="Passenger AC" width={24} height={24} />
              </IconButton>

              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={() => adjustTemperature(passengerTemp, setPassengerTemp, false)}
                  sx={{ color: 'text.primary' }}
                >
                  <ChevronDown size={24} />
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: 45, textAlign: 'center' }}>
                  {passengerTemp}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => adjustTemperature(passengerTemp, setPassengerTemp, true)}
                  sx={{ color: 'text.primary' }}
                >
                  <ChevronUp size={24} />
                </IconButton>
              </Stack>

              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <img src={passengerSeatIcon} alt="Passenger Seat" width={24} height={24} />
              </IconButton>
            </Stack>
          </Paper>
        </Box>
      </Fade>
    </>
  )
}

export default ClimateControl
