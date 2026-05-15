import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // In dev, __VITE_API_URL__ is '' so socket.io uses the Vite proxy (connects to '/').
    // In production, it's the backend Render URL baked in at build time.
    const serverUrl = (typeof __VITE_API_URL__ !== 'undefined' && __VITE_API_URL__)
      ? __VITE_API_URL__
      : (import.meta.env.VITE_API_URL || undefined);
    const socket = io(serverUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
