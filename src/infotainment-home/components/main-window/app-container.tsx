// src/renderer/src/infotainment-home/components/main-window/AppContainer.tsx
import React from 'react'
import { Box } from '@mui/material'
import DraggableView from './draggable-view'

interface AppContainerProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

const AppContainer: React.FC<AppContainerProps> = ({ children, isOpen, onClose }) => {
  return (
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        // Ensure it fills the space between top-bar and nav-bar
        height: '100%',
        // Prevent content from overflowing
        overflow: 'hidden'
      }}
    >
      {isOpen && <DraggableView onClose={onClose}>{children}</DraggableView>}
    </Box>
  )
}

export default AppContainer
