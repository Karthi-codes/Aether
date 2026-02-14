import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

// Types
type Role = 'host' | 'guest' | null;
type SessionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface CoBrowseContextType {
  role: Role;
  sessionId: string | null;
  status: SessionStatus;
  createSession: () => void;
  joinSession: (id: string) => void;
  endSession: () => void;
  broadcast: (type: string, payload?: any) => void;
  lastEvent: any;
}

const CoBrowseContext = createContext<CoBrowseContextType | null>(null);

export const CoBrowseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>('disconnected');
  const [lastEvent, setLastEvent] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback((): Promise<WebSocket> => {
    // ... (existing code)
    return new Promise((resolve, reject) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            resolve(wsRef.current);
            return;
        }

        console.log("Attempting to connect to WS...");
        setStatus('connecting');
         // Auto-detect WebSocket URL: explicit env > derived from API URL > localhost fallback
        const getWsUrl = () => {
            if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
            if (import.meta.env.VITE_API_URL) {
                // Derive WS URL from API URL (https://x.com/api -> wss://x.com)
                return import.meta.env.VITE_API_URL
                    .replace(/\/api$/, '')
                    .replace(/^https:/, 'wss:')
                    .replace(/^http:/, 'ws:');
            }
            return 'ws://localhost:8080';
        };
        const wsUrl = getWsUrl();
        console.log("Connecting to:", wsUrl);
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log("WS Connected");
            setStatus('connected');
            resolve(ws);
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("WS Message:", data);
                handleServerMessage(data);
            } catch(e) { console.error("WS Parse Error", e); }
        };

        ws.onclose = () => {
            console.log("WS Closed");
            setStatus('disconnected');
            setRole(null);
            setSessionId(null);
        };

        ws.onerror = (e) => {
            console.error("WS Error", e);
            setStatus('error');
            reject(e);
        };

        wsRef.current = ws;
    });
  }, []);

  const handleServerMessage = (data: any) => {
      setLastEvent(data);
      switch (data.type) {
          case 'SESSION_CREATED':
              setSessionId(data.sessionId);
              setRole('host');
              break;
          case 'SESSION_JOINED':
              setSessionId(data.sessionId);
              setRole('guest');
              break;
          default:
              break;
      }
  };

  const createSession = useCallback(async () => {
    try {
        const ws = await connect();
        ws.send(JSON.stringify({ type: 'CREATE_SESSION' }));
    } catch (e) {
        alert("Failed to connect to Co-Browse Server. Is it running?");
    }
  }, [connect]);

  const joinSession = useCallback(async (id: string) => {
    try {
        const ws = await connect();
        ws.send(JSON.stringify({ type: 'JOIN_SESSION', sessionId: id }));
    } catch (e) {
        alert("Failed to connect to Co-Browse Server.");
    }
  }, [connect]);

  const endSession = useCallback(() => {
    if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
    }
    setRole(null);
    setSessionId(null);
    setLastEvent(null);
    setStatus('disconnected');
  }, []);

  const broadcast = useCallback((type: string, payload?: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && sessionId) {
        wsRef.current.send(JSON.stringify({ type, sessionId, payload }));
    }
  }, [sessionId]);

  return (
    <CoBrowseContext.Provider value={{ role, sessionId, status, createSession, joinSession, endSession, broadcast, lastEvent }}>
      {children}
    </CoBrowseContext.Provider>
  );
};

export const useCoBrowse = () => {
    const context = useContext(CoBrowseContext);
    if (!context) throw new Error("useCoBrowse must be used within CoBrowseProvider");
    return context;
};
