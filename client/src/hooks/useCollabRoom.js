import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export const useCollabRoom = (roomId, username) => {
  const socket = useSocket();
  const [document, setDocument] = useState('');
  const [users, setUsers] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const isLocalChange = useRef(false); // Prevent echo handling

  useEffect(() => {
    if (!socket || !roomId) return;

    // Join the room
    socket.emit('room:join', { roomId, username });

    // Receive initial room state
    socket.on('room:state', ({ document: doc, users: roomUsers }) => {
      setDocument(doc);
      setUsers(roomUsers);
      setIsConnected(true);
    });

    // Another user's document update
    socket.on('document:update', ({ content, socketId }) => {
      if (socketId !== socket.id) {
        isLocalChange.current = true; // Flag so onChange doesn't re-broadcast
        setDocument(content);
      }
    });

    // User joined/left events
    socket.on('room:user-joined', ({ users: roomUsers }) => setUsers(roomUsers));
    socket.on('room:user-left', ({ users: roomUsers }) => {
      setUsers(roomUsers);
      // Remove cursor for disconnected user
      setRemoteCursors(prev => {
        const updated = { ...prev };
        // We'd need socketId from the event to delete — add it to the event payload
        return updated;
      });
    });

    // Remote cursor updates
    socket.on('cursor:update', ({ socketId, position, color }) => {
      setRemoteCursors(prev => ({ ...prev, [socketId]: { position, color } }));
    });

    return () => {
      socket.off('room:state');
      socket.off('document:update');
      socket.off('room:user-joined');
      socket.off('room:user-left');
      socket.off('cursor:update');
    };
  }, [socket, roomId, username]);

  const handleDocumentChange = useCallback((newContent) => {
    // If this change came from a remote update, don't re-broadcast
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }
    setDocument(newContent);
    socket?.emit('document:change', { roomId, content: newContent });
  }, [socket, roomId]);

  const handleCursorMove = useCallback((position) => {
    socket?.emit('cursor:move', { roomId, position });
  }, [socket, roomId]);

  return {
    document,
    users,
    remoteCursors,
    isConnected,
    handleDocumentChange,
    handleCursorMove,
  };
};