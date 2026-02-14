import  { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import logo from '../../../assets/logo.png';

const LogoLoader = ({ progress, isComplete }: { progress: number; isComplete: boolean }) => {
    return (
        <motion.div
            animate={isComplete ? { y: -1000 } : { y: 0 }}
            transition={{ duration: 1.2, ease: [0.6, 0.05, -0.01, 0.9] }}
            style={{ 
                position: 'relative', 
                width: '350px', 
                height: '350px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {/* Background Logo (Dimmed) */}
            <Box
                component="img"
                src={logo}
                alt="Aether"
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: 0.2,
                    filter: 'grayscale(100%)',
                }}
            />

            {/* Foreground Logo (Filling Up) */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: `${progress}%`,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-end', // Align image to bottom so it reveals upwards
                    transition: 'height 0.1s linear'
                }}
            >
                <Box
                    component="img"
                    src={logo}
                    alt="Aether"
                    sx={{
                        width: '350px', // Must match container width
                        height: '350px', // Must match container height
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 10px rgba(253, 253, 253, 1))' // Gold glow
                    }}
                />
            </Box>
        </motion.div>
    );
};


export const AetherLoader = ({ isLoading, onLoadingComplete }: { isLoading: boolean; onLoadingComplete?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isLoading) {
      if (progress === 100) setProgress(0);
      setIsComplete(false);
      
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsComplete(true);
            // Trigger completion callback after fly animation (1.2s) + buffer
            if (onLoadingComplete) {
                setTimeout(() => {
                    onLoadingComplete();
                }, 1500); 
            }
            return 100;
          }
          const increment = Math.random() * 5 + 1; 
          return Math.min(prev + increment, 100);
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="aether-loader"
          initial={{ backgroundColor: '#000000' }}
          animate={isComplete ? { backgroundColor: 'rgba(0,0,0,0)' } : { backgroundColor: '#000000' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            overflow: 'hidden',
            pointerEvents: isComplete ? 'none' : 'auto' // Allow clicks through when complete
          }}
        >
          {/* Main Logo Animation */}
          <LogoLoader progress={progress} isComplete={isComplete} />

          {/* Text/Percentage Container - Fades out when complete/flying starts */}
          <motion.div
            animate={isComplete ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ width: '200px', mt: 4, position: 'relative' }}>
              {/* Background Line */}
              <Box sx={{ height: '1px', width: '100%', bgcolor: 'rgba(213, 162, 73, 0.2)' }} />
              
              {/* Progress Line */}
              <motion.div
                style={{
                  height: '1px',
                  backgroundColor: '#D5A249',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${progress}%`,
                  boxShadow: '0 0 10px #D5A249'
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography sx={{ color: '#666', fontSize: '0.7rem', letterSpacing: 3, textTransform: 'uppercase' }}>
                  Loading Aether
                </Typography>
                <Typography sx={{ color: '#D5A249', fontSize: '0.7rem', letterSpacing: 2, fontWeight: 'bold' }}>
                  {Math.floor(progress)}%
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
