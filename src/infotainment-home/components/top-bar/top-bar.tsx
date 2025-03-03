// src/components/status-bar/status-bar.tsx
import { type ReactElement } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import BrelleLogo from "../../../assets/Brelle-white-logo.svg";
import Typography from '@mui/material/Typography';

interface StatusBarProps {
  time?: string
  temperature?: string
  additionalContent?: React.ReactNode
}

const StatusBar = ({
  time = '12:00 PM',
  temperature = '72°F',
  additionalContent
}: StatusBarProps): ReactElement => {
  return (
    <Paper
      elevation={0}
      square
      sx={{
        height: '48px',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      {/* Add the Brelle logo with aligned text */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', mr: 2 }}>
        <img 
          src={BrelleLogo} 
          alt="Brelle Logo" 
          height="24"
          style={{ marginRight: '12px' }}
        />
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 'medium',
            color: 'text.secondary',
            fontSize: '0.75rem',
            lineHeight: 1,
            marginBottom: '-1px', // Fine-tune vertical alignment
            paddingLeft: '4px'   // Add a bit more space to the right of the logo
          }}
        >
          PROTOTYPE DEVELOPMENT TOOL
        </Typography>
      </Box>

      {/* Left side content slot */}
      {additionalContent && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>{additionalContent}</Box>
      )}

      {/* Right side time and temperature */}
      <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box component="span" sx={{ typography: 'body2' }}>
          {time}
        </Box>
        <Box component="span" sx={{ typography: 'body2' }}>
          {temperature}
        </Box>
      </Box>
    </Paper>
  )
}

export default StatusBar