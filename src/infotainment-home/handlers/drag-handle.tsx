import { type ReactElement, useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'

interface DragHandleProps {
  onClose: () => void
  isVisible?: boolean
}

const DragHandle = ({ onClose, isVisible = true }: DragHandleProps): ReactElement => {
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [offsetY, setOffsetY] = useState(0)

  const CLOSE_THRESHOLD = 100 // Distance in pixels needed to trigger close

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent): void => {
    setIsDragging(true)
    setStartY('touches' in e ? e.touches[0].clientY : e.clientY)
    setOffsetY(0)
  }

  const handleTouchMove = (e: TouchEvent | MouseEvent): void => {
    if (!isDragging) return

    const currentY =
      'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY
    const newOffset = currentY - startY

    // Only allow downward dragging
    if (newOffset > 0) {
      setOffsetY(newOffset)
      console.log('Dragging:', newOffset) // Debug log
    }
  }

  const handleTouchEnd = (): void => {
    if (!isDragging) return

    console.log('Touch end, offset:', offsetY) // Debug log
    if (offsetY > CLOSE_THRESHOLD) {
      console.log('Threshold reached, calling onClose') // Debug log
      onClose()
    }
    setIsDragging(false)
    setOffsetY(0)
  }

  useEffect((): (() => void) => {
    if (isDragging) {
      window.addEventListener('mousemove', handleTouchMove)
      window.addEventListener('mouseup', handleTouchEnd)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)
    }

    return (): void => {
      window.removeEventListener('mousemove', handleTouchMove)
      window.removeEventListener('mouseup', handleTouchEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, offsetY]) // Added offsetY to dependencies

  if (!isVisible) {
    return <Box component="span" sx={{ display: 'none' }} />
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: `translateX(-50%) translateY(${offsetY}px)`,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '12px',
        cursor: 'grab',
        userSelect: 'none',
        transition: !isDragging ? 'transform 0.2s' : 'none',
        zIndex: 10
      }}
      onMouseDown={handleTouchStart}
      onTouchStart={handleTouchStart}
    >
      <Box
        sx={{
          width: 32,
          height: 4,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.common.white, 0.3),
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.common.white, 0.4)
          }
        }}
      />
    </Box>
  )
}

export default DragHandle
