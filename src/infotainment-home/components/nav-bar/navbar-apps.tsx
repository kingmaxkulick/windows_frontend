import React from 'react'
import { type ReactElement } from 'react'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'

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

const AppDrawer = ({
  open,
  onClose,
  apps,
  onAppSelect,
  activeApp
}: AppDrawerProps): ReactElement => {
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
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200
          }}
        />
      )}

      {/* App Grid */}
      <Fade in={open}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: '96px', // Height of bottom nav
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '400px',
            bgcolor: 'background.paper',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 3,
            zIndex: 1300,
            overflowY: 'auto',
            // Hide scrollbar
            scrollbarWidth: 'none', // Firefox
            '&::-webkit-scrollbar': {  // Chrome, Safari, Edge
              display: 'none'
            },
            msOverflowStyle: 'none', // IE and Edge
          }}
        >
          <Grid
            container
            spacing={2}
          >
            {apps.map((app) => (
              <Grid item xs={4} sm={3} key={app.label}>
                <Paper
                  elevation={0}
                  onClick={() => {
                    onAppSelect(app.label)
                    onClose()
                  }}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: activeApp === app.label ? 'action.selected' : 'transparent',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Stack spacing={1} alignItems="center">
                    <Box sx={{ color: 'text.secondary' }}>
                      {app.icon}
                    </Box>
                    <Box
                      sx={{
                        typography: 'caption',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%',
                        color: 'text.secondary', // Grey text color
                      }}
                    >
                      {app.label}
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Fade>
    </>
  )
}

export default AppDrawer