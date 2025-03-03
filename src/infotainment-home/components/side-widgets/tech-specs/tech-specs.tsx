import React from 'react';
import { type ReactElement } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

interface TechnicalSpecsProps {
  imdResPos: number
  imdResNeg: number
}

const TechnicalSpecs = ({ 
  imdResPos,
  imdResNeg
}: TechnicalSpecsProps): ReactElement => {
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
        M.R.A.H. DEV VALS
      </Typography>
      <Stack spacing={1}>
        <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 1)' }}>
          IMD RES POS: {imdResPos.toFixed(1)}kΩ
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 1)' }}>
          IMD RES NEG: {imdResNeg.toFixed(1)}kΩ
        </Typography>
      </Stack>
    </Paper>
  )
}

export default TechnicalSpecs