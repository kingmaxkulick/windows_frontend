import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  autoPlay = true,
  muted = true,
  loop = false,
  onEnded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement) return;

    const handleLoadedData = () => {
      console.log('Video loaded successfully:', src);
      setIsLoading(false);
      
      // Ensure video plays automatically
      if (autoPlay && videoElement.paused) {
        videoElement.play().catch(e => {
          console.error('Error playing video:', e);
          setError('Failed to autoplay video. Browser may require user interaction first.');
        });
      }
    };

    const handleError = (e: Event) => {
      console.error('Video load error:', e);
      setIsLoading(false);
      setError(`Failed to load video. Please check file path and format.`);
    };

    const handleEnded = () => {
      if (onEnded) {
        onEnded();
      }
    };

    // Register event listeners
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('ended', handleEnded);

    // Clean up event listeners
    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [src, autoPlay, onEnded]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}

      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'error.main',
            p: 2,
            zIndex: 2
          }}
        >
          {error}
        </Box>
      )}

      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        controls={false}
        playsInline
      />
    </Box>
  );
};

export default VideoPlayer;