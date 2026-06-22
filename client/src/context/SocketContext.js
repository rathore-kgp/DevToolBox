import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '../store/slices/authSlice';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const accessToken = useSelector(selectAccessToken);

  useEffect(() => {
    if (!accessToken) return;

    // Establish connection with auth token
    socketRef.current = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token: accessToken },
      autoConnect: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [accessToken]); // Reconnect if token changes (e.g., after silent refresh)

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);