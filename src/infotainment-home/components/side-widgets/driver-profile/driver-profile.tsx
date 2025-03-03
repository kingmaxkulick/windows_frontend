import { type ReactElement, useState } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { UserPlus } from 'lucide-react'
import Modal from '@mui/material/Modal'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

interface Driver {
  id: string
  name: string
}

const DriverProfile = (): ReactElement => {
  const [openModal, setOpenModal] = useState(false)
  const [newDriverName, setNewDriverName] = useState('')
  const [drivers, setDrivers] = useState<Driver[]>([{ id: '1', name: 'Guest' }])
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0].id)

  const handleAddDriver = (): void => {
    if (newDriverName.trim()) {
      const newDriver: Driver = {
        id: Date.now().toString(),
        name: newDriverName.trim()
      }
      setDrivers([...drivers, newDriver])
      setSelectedDriverId(newDriver.id)
      setNewDriverName('')
      setOpenModal(false)
    }
  }

  const handleModalClose = (): void => {
    setOpenModal(false)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewDriverName(e.target.value)
  }

  const currentDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0]

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'rgba(220, 220, 225, 0.8)',
          borderRadius: 1,
          p: 1.5,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(0, 0, 0, 1)'
            }}
          >
            DRIVER PROFILE
          </Typography>
          <IconButton size="small" onClick={() => setOpenModal(true)} sx={{ color: '#9c27b0' }}>
            <UserPlus size={16} />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#9c27b0'
            }}
          >
            {currentDriver.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: 'rgba(0, 0, 0, 1)'
              }}
            >
              {currentDriver.name}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Add Driver Modal */}
      <Modal open={openModal} onClose={handleModalClose} aria-labelledby="add-driver-modal">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'rgba(220, 220, 225, 0.8)',
            borderRadius: 1,
            p: 3,
            outline: 'none'
          }}
        >
          <Typography variant="body1" sx={{ mb: 2, color: 'rgba(0, 0, 0, 1)' }}>
            Add New Driver
          </Typography>
          <TextField
            fullWidth
            label="Driver Name"
            value={newDriverName}
            onChange={handleNameChange}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#9c27b0'
                },
                '&:hover fieldset': {
                  borderColor: '#9c27b0'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#9c27b0'
                }
              }
            }}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleModalClose} sx={{ color: '#9c27b0' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddDriver}
              disabled={!newDriverName.trim()}
              sx={{
                bgcolor: '#9c27b0',
                '&:hover': {
                  bgcolor: '#7b1fa2'
                }
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  )
}

export default DriverProfile
