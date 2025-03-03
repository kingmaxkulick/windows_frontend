import React, { useEffect } from 'react';
import { Box } from '@mui/material';

interface SplashScreenProps {
  videoSrc: string;
  onComplete: () => void;
  skipDuration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  videoSrc,
  onComplete,
  skipDuration = 10000
}) => {
  useEffect(() => {
    // Auto-skip after duration
    const timer = setTimeout(() => {
      onComplete();
    }, skipDuration);
    
    return () => clearTimeout(timer);
  }, [onComplete, skipDuration]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        bgcolor: 'black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Main video */}
      <video
        src={videoSrc}
        autoPlay
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
        onEnded={onComplete}
        playsInline
      />
      
      {/* No skip button */}
    </Box>
  );
};

export default SplashScreen;