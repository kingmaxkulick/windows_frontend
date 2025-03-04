import React from 'react';
import { type ReactElement, useState } from 'react'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import {
  Navigation,
  Music2,
  Phone,
  Settings,
  Car,
  Radio,
  Calendar,
  Grid as GridIcon,
  Camera,
  Thermometer,
  BarChart // Import the BarChart icon for Plot View
} from 'lucide-react'
import AppDrawer from './navbar-apps'

interface BottomNavProps {
  activeApp: string | null
  onAppSelect: (app: string | null) => void
}

// Interface for the AppDrawer component
interface AppDrawerProps {
  open: boolean
  onClose: () => void
  apps: Array<{
    icon: JSX.Element
    label: string
  }>
  onAppSelect: (appLabel: string) => void
  activeApp: string | null
}

const primaryApps = [
  { icon: <Navigation size={28} />, label: 'Navigation' },
  { icon: <Music2 size={28} />, label: 'Music' },
  { icon: <Thermometer size={28} />, label: 'Climate' },
  { icon: <GridIcon size={28} />, label: 'Apps' }
]

const secondaryApps = [
  { icon: <Car size={28} />, label: 'Controls' },
  { icon: <Phone size={28} />, label: 'Phone' },
  { icon: <Radio size={28} />, label: 'Radio' },
  { icon: <BarChart size={28} />, label: 'Plot View' }, // Add Plot View app here
  { icon: <Calendar size={28} />, label: 'Calendar' },
  { icon: <Camera size={28} />, label: 'Camera' },
  { icon: <Settings size={28} />, label: 'Settings' }
]

const BottomNav = ({ activeApp, onAppSelect }: BottomNavProps): ReactElement => {
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false)

  const handleAppClick = (appLabel: string): void => {
    if (appLabel === 'Apps') {
      setIsAppDrawerOpen(true)
      return
    }

    // If clicking the active app, close it by setting activeApp to null
    if (appLabel === activeApp) {
      onAppSelect(null)
    } else {
      onAppSelect(appLabel)
    }
  }

  // Handler for app drawer selection that accepts a string only
  const handleAppDrawerSelect = (label: string): void => {
    handleAppClick(label)
    setIsAppDrawerOpen(false)
  }

  return (
    <>
      <Paper
        square
        elevation={0}
        sx={{
          bgcolor: 'rgba(220, 220, 225, 0.8)',
          borderTop: 1,
          borderColor: 'divider',
          py: 1,
          px: 2,
          height: '87px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Stack
            direction="row"
            spacing={4}
            sx={{
              width: '33.333%',
              justifyContent: 'center'
            }}
          >
            {primaryApps.map((app) => (
              <Paper
                key={app.label}
                elevation={0}
                onClick={() => handleAppClick(app.label)}
                sx={{
                  width: '80px',
                  p: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: activeApp === app.label ? 'primary.main' : 'transparent',
                  color: activeApp === app.label ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  },
                  transition: 'background-color 0.2s'
                }}
              >
                <Stack spacing={1} alignItems="center">
                  {app.icon}
                  <Box
                    sx={{
                      typography: 'caption',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%'
                    }}
                  >
                    {app.label}
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Paper>

      <AppDrawer
        open={isAppDrawerOpen}
        onClose={() => setIsAppDrawerOpen(false)}
        apps={secondaryApps}
        onAppSelect={handleAppDrawerSelect}
        activeApp={activeApp}
      />
    </>
  )
}

export default BottomNav