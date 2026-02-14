import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, GlobalStyles } from "@mui/material";

type CursorType = 'default' | 'view' | 'explore' | 'transparent' | 'discover';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const [cursorType, setCursorType] = useState<CursorType>('default');

  // Use refs for values that change constantly to avoid re-renders
  const mouse = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      const target = e.target as HTMLElement;

      // Check for different cursor triggers with priority
      
      // 1. Transparent (Icons inside cards) - Highest Priority
      // Use closest to find if we are effectively 'inside' a marked element
      if (target.closest("[data-cursor='transparent']")) {
        setCursorType('transparent');
        return;
      }

      // 2. Explore (Categories)
      if (target.closest("[data-cursor='explore']")) {
        setCursorType('explore');
        return;
      }

      // 3. View (Products)
      if (target.closest("[data-cursor='view']")) {
        setCursorType('view');
        return;
      }

      // 4. Discover (Split Banner)
      if (target.closest("[data-cursor='discover']")) {
        setCursorType('discover');
        return;
      }

      // Default
      setCursorType('default');
    };

    window.addEventListener("mousemove", move);

    const animate = () => {
      // Smooth lerp (Linear Interpolation) for fluid movement
      position.current.x += (mouse.current.x - position.current.x) * 0.15;
      position.current.y += (mouse.current.y - position.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0) translate(-50%, -50%)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Helper to determine cursor styles based on type
  const getCursorStyles = () => {
    switch (cursorType) {
      case 'view':
        return {
          width: 100,
          height: 100,
          bg: "#D5A249",
          text: "VIEW",
          border: "none",
          mixBlend: "normal" as const
        };
      case 'explore':
        return {
          width: 120,
          height: 120,
          bg: "#1a1a1a",
          text: "EXPLORE NOW",
          border: "none",
          mixBlend: "normal" as const
        };
      case 'discover':
        return {
          width: 120,
          height: 120,
          bg: "#000000", // Black color
          text: "DISCOVER ME",
          border: "none",
          mixBlend: "normal" as const
        };
      case 'transparent':
        return {
          width: 20,  // Slightly larger than icon
          height: 20,
          bg: "transparent",
          text: "",
          border: "1px solid rgba(0, 0, 0, 0.8)", // Visible ring
          mixBlend: "normal" as const
        };
      default:
        return {
          width: 20,
          height: 20,
          bg: "rgba(0,0,0,0.8)",
          text: "",
          border: "1px solid rgba(255,255,255,0.2)",
          mixBlend: "normal" as const
        };
    }
  };

  const styles = getCursorStyles();

  return (
    <>
      <GlobalStyles
        styles={{
          "*": { cursor: "none !important" },
          "body, html": { cursor: "none !important", height: '100%', overflowX: 'hidden' },
          /* Ensure no default cursors override our custom one */
          "a, button, [role='button'], input, textarea, select, .MuiButtonBase-root": { cursor: "none !important" },
          "[data-cursor='transparent']": { cursor: "none !important" } 
        }}
      />
      <Box
        ref={cursorRef}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform", 
        }}
      >
        <Box
          sx={{
            width: styles.width,
            height: styles.height,
            borderRadius: "50%",
            backgroundColor: styles.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s, height 0.3s",
            mixBlendMode: styles.mixBlend,
            border: styles.border,
            textAlign: 'center',
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
                opacity: (cursorType === 'view' || cursorType === 'explore' || cursorType === 'discover') ? 1 : 0, 
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: cursorType === 'explore' ? '0.7rem' : '0.9rem',
                transition: 'opacity 0.2s 0.1s',
                display: (cursorType === 'view' || cursorType === 'explore' || cursorType === 'discover') ? 'block' : 'none',
                width: '100%',
                lineHeight: 1.2
            }}
          >
            {styles.text}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default CustomCursor;
