import React, { useState, useRef, ReactNode } from 'react'
import { Paper, Box, useTheme, styled, alpha, Theme } from '@mui/material'

const DISMISS_THRESHOLD = 150

interface DraggableViewProps {
  onClose: () => void
  children: ReactNode
  containerZIndex?: number
}

const DragHandle = styled(Box)(({ theme }: { theme: Theme }) => ({
  width: '100%',
  height: theme.spacing(6),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing'
  }
}))

const DragIndicator = styled(Box)(({ theme }: { theme: Theme }) => ({
  width: 48,
  height: 4,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.text.secondary, 0.2)
}))

const ContentWrapper = styled(Box)({
  height: '100%',
  position: 'relative',
  overflow: 'hidden'
})

// Create a container that stays within the main content area
const DraggableContainer = styled(Box)({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  top: 0,
  overflow: 'hidden'
})

const DraggableView: React.FC<DraggableViewProps> = ({
  onClose,
  children,
  containerZIndex = 1
}): JSX.Element => {
  const theme = useTheme()
  const [dragY, setDragY] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)

  const handleTouchStart = (e: React.TouchEvent): void => {
    setIsDragging(true)
    startY.current = e.touches[0].clientY
    currentY.current = dragY
  }

  const handleTouchMove = (e: React.TouchEvent): void => {
    if (!isDragging) return

    const deltaY = e.touches[0].clientY - startY.current
    const newY = Math.max(0, currentY.current + deltaY)
    setDragY(newY)
  }

  const handleTouchEnd = (): void => {
    setIsDragging(false)

    if (dragY > DISMISS_THRESHOLD) {
      setDragY(window.innerHeight)
      setTimeout(onClose, theme.transitions.duration.standard)
    } else {
      setDragY(0)
    }
  }

  return (
    <DraggableContainer
      sx={{
        zIndex: containerZIndex,
        backgroundColor: alpha(
          theme.palette.background.default,
          Math.max(0, 1 - (dragY / DISMISS_THRESHOLD) * 0.7)
        )
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        <Paper
          elevation={8}
          sx={{
            height: '100%',
            transform: `translateY(${dragY}px)`,
            transition: isDragging
              ? 'none'
              : theme.transitions.create('transform', {
                  duration: theme.transitions.duration.standard,
                  easing: theme.transitions.easing.easeOut
                }),
            borderTopLeftRadius: theme.shape.borderRadius * 2,
            borderTopRightRadius: theme.shape.borderRadius * 2,
            pointerEvents: 'auto',
            bgcolor: 'background.paper'
          }}
        >
          <DragHandle
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <DragIndicator />
          </DragHandle>

          <ContentWrapper>{children}</ContentWrapper>
        </Paper>
      </Box>
    </DraggableContainer>
  )
}

export default DraggableView
