import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Snackbar, Alert, IconButton } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCoBrowse } from './CoBrowseContext';
import PrivacyOverlay from './PrivacyOverlay';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

const CoBrowseManager: React.FC = () => {
    const { role, sessionId, status, createSession, joinSession, endSession, broadcast, lastEvent } = useCoBrowse();
    const location = useLocation();
    const navigate = useNavigate();
    const [isPrivate, setIsPrivate] = useState(false);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const [endDialogOpen, setEndDialogOpen] = useState(false);
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const [joinInputId, setJoinInputId] = useState('');
    const [remoteCursor, setRemoteCursor] = useState<{ x: number, y: number } | null>(null);
    const [flyingHearts, setFlyingHearts] = useState<{ id: number, left: number, delay: number, emoji: string }[]>([]);

    // ... (keep existing code up to handleJoin) ...

    // Privacy Logic: Check URL
    useEffect(() => {
        const privatePaths = ['/checkout/payment', '/account', '/profile', '/wallet'];
        const currentIsPrivate = privatePaths.some(path => location.pathname.includes(path));

        setIsPrivate(currentIsPrivate);

        // Notify guests if privacy state changes
        if (role === 'host') {
            broadcast('PRIVACY_TOGGLE', { isPrivate: currentIsPrivate });
        }
    }, [location, role, broadcast]);

    // Helper to generate CSS selector
    const getCssSelector = (el: Element): string => {
        if (el.id) return `#${el.id}`;
        if (el.tagName.toLowerCase() === 'body') return 'body';
        if (el.tagName.toLowerCase() === 'html') return 'html';

        // Optimization: if direct parent has ID, use that
        if (el.parentElement && el.parentElement.id) {
            let tag = el.tagName.toLowerCase();
            let siblings = Array.from(el.parentElement.children);
            let index = siblings.indexOf(el) + 1;
            return `#${el.parentElement.id} > ${tag}:nth-child(${index})`;
        }

        let path = [];
        while (el.parentElement) {
            let tag = el.tagName.toLowerCase();
            let siblings = Array.from(el.parentElement.children);
            let index = siblings.indexOf(el) + 1;
            path.unshift(`${tag}:nth-child(${index})`);
            el = el.parentElement;
        }
        return path.join(' > ');
    };

    // Helper to spawn hearts/emojis
    const spawnHearts = useCallback(() => {
        const emojis = ['😍', '😘', '💕', '❤️'];
        const newHearts = Array.from({ length: 15 }).map((_, i) => ({
            id: Date.now() + i,
            left: Math.random() * 100 - 50,
            delay: Math.random() * 0.8,
            emoji: emojis[Math.floor(Math.random() * emojis.length)]
        }));
        setFlyingHearts(prev => [...prev, ...newHearts]);

        setTimeout(() => {
            setFlyingHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
        }, 2500);
    }, []);

    // Inbound Events (Listen)
    useEffect(() => {
        if (!lastEvent) return;

        if (lastEvent.type === 'NAVIGATE') {
            if (location.pathname !== lastEvent.payload.path) {
                isSilentUpdate.current = true;
                navigate(lastEvent.payload.path);
                setTimeout(() => { isSilentUpdate.current = false; }, 100);
            }
        }

        if (lastEvent.type === 'CLICK') {
            console.log("Remote Click Received:", lastEvent.payload);
            isSilentUpdate.current = true;
            try {
                const element = document.querySelector(lastEvent.payload.selector) as HTMLElement;
                if (element) {
                    const ripple = document.createElement('div');
                    Object.assign(ripple.style, {
                        position: 'absolute',
                        left: `${lastEvent.payload.x}px`,
                        top: `${lastEvent.payload.y}px`,
                        width: '20px',
                        height: '20px',
                        background: 'rgba(255, 0, 0, 0.5)',
                        borderRadius: '50%',
                        zIndex: '9999',
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -50%)'
                    });
                    document.body.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 500);

                    element.click();
                    element.focus();
                }
            } catch (e) {
                console.error("Click error:", e);
            }
            setTimeout(() => { isSilentUpdate.current = false; }, 300);
        }

        if (lastEvent.type === 'INPUT') {
            isSilentUpdate.current = true;
            const element = document.querySelector(lastEvent.payload.selector) as HTMLInputElement;
            if (element) {
                element.value = lastEvent.payload.value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }
            setTimeout(() => { isSilentUpdate.current = false; }, 50);
        }

        if (lastEvent.type === 'PRIVACY_TOGGLE') {
            if (role === 'guest') setIsPrivate(lastEvent.payload.isPrivate);
        }

        if (lastEvent.type === 'SCROLL') {
            isSilentUpdate.current = true;
            window.scrollTo({
                top: lastEvent.payload.y,
                behavior: 'auto'
            });
            setTimeout(() => { isSilentUpdate.current = false; }, 50);
        }

        if (lastEvent.type === 'CURSOR_MOVE') {
            setRemoteCursor({ x: lastEvent.payload.x, y: lastEvent.payload.y });
        }

        if (lastEvent.type === 'PEER_DISCONNECTED') {
            setRemoteCursor(null);
            // Optional: Show a message that partner left?
            // alert("Partner disconnected");
        }

        // Trigger hearts on join
        if (lastEvent.type === 'SESSION_JOINED' || lastEvent.type === 'GUEST_JOINED') {
            spawnHearts();
        }

    }, [lastEvent, role, navigate, location.pathname, spawnHearts]);

    // Outbound Events (Broadcast)
    useEffect(() => {
        if (!sessionId) return;

        // ... (keep outbound logic)
        // Navigation Broadcast
        const privatePaths = ['/checkout/payment', '/account', '/profile', '/wallet'];
        const isTargetPrivate = privatePaths.some(path => location.pathname.includes(path));

        if (!isSilentUpdate.current) {
            if (role === 'guest' && isTargetPrivate) {
                // Block Guest -> Host private nav
            } else {
                broadcast('NAVIGATE', { path: location.pathname });
            }
        }

        const handleInput = (e: Event) => {
            if (isSilentUpdate.current) return;
            if (role === 'guest' && isTargetPrivate) return;

            const target = e.target as HTMLInputElement;
            if (target.type === 'password') return;

            if (inputTimeout) clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                const selector = getCssSelector(target);
                broadcast('INPUT', {
                    selector,
                    value: target.value
                });
            }, 300);
        };

        const handleClick = (e: MouseEvent) => {
            if (isSilentUpdate.current) return;
            if (role === 'guest' && isTargetPrivate) return;

            let target = e.target as Element;
            const interactive = target.closest('button, a, input, select, [role="button"]');
            if (interactive) target = interactive;

            if (target.closest && (target.closest('.MuiDialog-root') || target.closest('.MuiChip-root'))) return;

            const selector = getCssSelector(target);
            broadcast('CLICK', {
                selector,
                x: e.pageX,
                y: e.pageY
            });
        };

        const handleScroll = () => {
            if (timeout || isSilentUpdate.current) return;
            timeout = setTimeout(() => {
                broadcast('SCROLL', { y: window.scrollY });
                timeout = null!;
            }, 50);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (cursorTimeout) return;
            cursorTimeout = setTimeout(() => {
                broadcast('CURSOR_MOVE', { x: e.pageX, y: e.pageY });
                cursorTimeout = null!;
            }, 30);
        };

        let timeout: ReturnType<typeof setTimeout>;
        let cursorTimeout: ReturnType<typeof setTimeout>;
        let inputTimeout: ReturnType<typeof setTimeout>;

        window.addEventListener('click', handleClick, true);
        window.addEventListener('input', handleInput, true);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('click', handleClick, true);
            window.removeEventListener('input', handleInput, true);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            if (timeout) clearTimeout(timeout);
            if (cursorTimeout) clearTimeout(cursorTimeout);
            if (inputTimeout) clearTimeout(inputTimeout);
        };
    }, [location, role, sessionId, broadcast]);

    const handleJoin = () => {
        if (joinInputId.trim()) {
            joinSession(joinInputId.trim());
            setIsJoinDialogOpen(false);
        }
    };

    const handleCopy = () => {
        if (sessionId) {
            navigator.clipboard.writeText(sessionId);
            setShowCopySuccess(true);
            spawnHearts();
        }
    };

    const handleEndSession = () => {
        endSession();
        setRemoteCursor(null);
        setEndDialogOpen(false);
    };

    // Loop prevention flag
    const isSilentUpdate = React.useRef(false);

    // Couples Theme Colors
    const themeColor = '#E91E63'; // Pink/Rose
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(233, 30, 99, 0.15)',
    };

    return (
        <>
            {/* Privacy Overlay for Guests */}
            <PrivacyOverlay isVisible={role === 'guest' && isPrivate} />

            {/* Remote Partner Cursor (Heart Style) */}
            {remoteCursor && sessionId && !isPrivate && (
                <Box sx={{
                    position: 'absolute',
                    left: remoteCursor.x,
                    top: remoteCursor.y,
                    pointerEvents: 'none',
                    zIndex: 9999,
                    transform: 'translate(-50%, -50%)',
                    transition: 'top 0.1s cubic-bezier(0.2, 0.8, 0.2, 1), left 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <Box sx={{
                        filter: 'drop-shadow(0 2px 4px rgba(233,30,99,0.3))',
                        animation: 'pulse 1.5s infinite ease-in-out',
                        '@keyframes pulse': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)' } }
                    }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill={themeColor}>
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </Box>
                    <Box sx={{ mt: 0.5, bgcolor: themeColor, color: 'white', px: 1.5, py: 0.5, borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(233,30,99,0.2)' }}>
                        {role === 'host' ? 'Partner (Invited)' : 'Partner (Host)'}
                    </Box>
                </Box>
            )}

            {/* Floating Couples Dock */}
            <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1300, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'end' }}>
                {sessionId && (
                    <Box sx={{
                        ...glassStyle,
                        px: 2, py: 1, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 1.5,
                        animation: 'slideUp 0.3s ease-out',
                        '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
                    }}>
                        <Box sx={{ position: 'relative' }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: status === 'connected' ? '#4CAF50' : '#FFC107', boxShadow: `0 0 0 4px ${status === 'connected' ? 'rgba(76,175,80,0.2)' : 'rgba(255,193,7,0.2)'}` }} />
                        </Box>
                        <Box>
                            <Box sx={{ fontSize: '0.75rem', color: '#666', fontWeight: 500 }}>
                                {role === 'host' ? 'Hosting' : 'Joined '}
                            </Box>
                            <Box sx={{ fontSize: '0.65rem', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, position: 'relative', '&:hover': { color: themeColor } }}
                                onClick={handleCopy}>
                                <span>ID: {sessionId}</span>
                                <ContentCopyIcon sx={{ fontSize: 12 }} />

                                {flyingHearts.map(h => (
                                    <Box key={h.id} sx={{
                                        position: 'absolute', left: '50%', bottom: '100%', ml: `${h.left}px`,
                                        opacity: 0, fontSize: '1.2rem', pointerEvents: 'none',
                                        animation: `flyUp 1s ease-out forwards ${h.delay}s`,
                                        '@keyframes flyUp': { '0%': { transform: 'translateY(0) scale(0.5)', opacity: 1 }, '100%': { transform: 'translateY(-100px) scale(1.5)', opacity: 0 } }
                                    }}>{h.emoji}</Box>
                                ))}
                            </Box>
                        </Box>
                        <IconButton size="small" onClick={() => setEndDialogOpen(true)} sx={{ ml: 1, color: '#999', '&:hover': { color: 'red', bgcolor: 'rgba(255,0,0,0.1)' } }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}

                {!sessionId && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="contained" onClick={() => setIsJoinDialogOpen(true)}
                            sx={{ ...glassStyle, background: 'white', color: '#333', borderRadius: '30px', px: 3, py: 1.5, textTransform: 'none', fontWeight: 600, '&:hover': { background: '#f5f5f5' } }}
                            startIcon={<LinkIcon />}
                        >
                            Join Partner
                        </Button>
                        <Button variant="contained" onClick={createSession} disabled={status === 'connecting'}
                            sx={{ bgcolor: themeColor, color: 'white', borderRadius: '30px', px: 3, py: 1.5, textTransform: 'none', fontWeight: 600, boxShadow: '0 8px 20px rgba(233,30,99,0.3)', '&:hover': { bgcolor: '#D81B60' }, display: 'flex', gap: 1 }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                            Shop Together
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Copy Success Snackbar */}
            <Snackbar
                open={showCopySuccess}
                autoHideDuration={4000}
                onClose={() => setShowCopySuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setShowCopySuccess(false)}
                    icon={<span style={{ fontSize: '1.2rem' }}>💌</span>}
                    sx={{
                        width: '100%',
                        bgcolor: 'white',
                        color: '#333',
                        fontWeight: 600,
                        border: '1px solid rgba(233,30,99,0.2)',
                        boxShadow: '0 8px 24px rgba(233,30,99,0.15)',
                        '& .MuiAlert-icon': { mr: 1.5 }
                    }}
                >
                    <Box component="span" sx={{ color: themeColor }}>Code Copied!</Box> Share it with your partner ❤️
                </Alert>
            </Snackbar>

            <Dialog open={endDialogOpen} onClose={() => setEndDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4, textAlign: 'center', p: 1 } }}>
                <DialogTitle sx={{ fontSize: '2rem' }}>😩</DialogTitle>
                <DialogContent>
                    <Box sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>Ending t?</Box>
                    <Box sx={{ color: '#666' }}>Are you sure you want to stop shopping together?</Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button onClick={() => setEndDialogOpen(false)} sx={{ color: '#666' }}>No, stay</Button>
                    <Button onClick={handleEndSession} variant="contained" color="error" sx={{ borderRadius: 10 }}>End Session</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isJoinDialogOpen} onClose={() => setIsJoinDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', maxWidth: 400 } }}>
                <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
                    <Box sx={{ color: themeColor, fontSize: '2rem', mb: 1 }}>❤️</Box>
                    <Box sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>Join Your Partner</Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', color: '#666', mb: 3 }}>Enter the secret code shared by your partner to start shopping together.</Box>
                    <TextField autoFocus fullWidth variant="outlined" value={joinInputId} onChange={(e) => setJoinInputId(e.target.value)} placeholder="Paste  Code..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, '&.Mui-focused fieldset': { borderColor: themeColor } } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
                    <Button onClick={() => setIsJoinDialogOpen(false)} sx={{ color: '#666' }}>Cancel</Button>
                    <Button onClick={handleJoin} variant="contained" disabled={!joinInputId} sx={{ bgcolor: themeColor, borderRadius: 10, px: 4, '&:hover': { bgcolor: '#D81B60' } }}>Connect ❤️</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CoBrowseManager;
