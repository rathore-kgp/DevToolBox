import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export const useCollabRoom = (roomId, username) => {
  const socket = useSocket();
  const [document, setDocument] = useState('');
  const [users, setUsers] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const isLocalChange = useRef(false); // Prevent echo handling

  useEffect(() => {
    if (!socket || !roomId) return;

    // Join the room
    socket.emit('room:join', { roomId, username });

    // Bug fix: Use named handler references so socket.off() removes ONLY our
    // specific handler — not every listener on that event.
    const onRoomState = ({ document: doc, users: roomUsers }) => {
      setDocument(doc);
      setUsers(roomUsers);
      setIsConnected(true);
    };

    const onDocumentUpdate = ({ content, socketId }) => {
      if (socketId !== socket.id) {
        isLocalChange.current = true;
        setDocument(content);
      }
    };

    const onUserJoined = ({ users: roomUsers }) => setUsers(roomUsers);

    // Bug fix: Read the leaving user's socketId from the event payload and
    // delete their cursor so it no longer lingers on screen.
    const onUserLeft = ({ users: roomUsers, socketId: leftSocketId }) => {
      setUsers(roomUsers);
      if (leftSocketId) {
        setRemoteCursors(prev => {
          const updated = { ...prev };
          delete updated[leftSocketId];
          return updated;
        });
      }
    };

    const onCursorUpdate = ({ socketId, position, color }) => {
      setRemoteCursors(prev => ({ ...prev, [socketId]: { position, color } }));
    };

    // Server rejects the join once a room hits its user cap — surface it
    // instead of silently doing nothing (previously unhandled).
    const onRoomFull = ({ max }) => {
      setJoinError(`This room is full (max ${max} users). Try another Room ID.`);
    };

    const onDocumentRejected = ({ reason }) => {
      setJoinError(reason || 'That change was rejected by the server.');
    };

    socket.on('room:state',      onRoomState);
    socket.on('document:update', onDocumentUpdate);
    socket.on('room:user-joined', onUserJoined);
    socket.on('room:user-left',  onUserLeft);
    socket.on('cursor:update',   onCursorUpdate);
    socket.on('room:full',       onRoomFull);
    socket.on('document:rejected', onDocumentRejected);

    return () => {
      // Pass the exact handler reference — only removes OUR listener
      socket.off('room:state',      onRoomState);
      socket.off('document:update', onDocumentUpdate);
      socket.off('room:user-joined', onUserJoined);
      socket.off('room:user-left',  onUserLeft);
      socket.off('cursor:update',   onCursorUpdate);
      socket.off('room:full',       onRoomFull);
      socket.off('document:rejected', onDocumentRejected);
      socket.emit('room:leave', { roomId });
    };
  }, [socket, roomId, username]);

  const handleDocumentChange = useCallback((newContent) => {
    // Bug fix: Monaco calls onChange(undefined) on initial mount — guard here
    // to prevent broadcasting undefined and crashing docContent.length in the UI.
    if (newContent === undefined || newContent === null) return;

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
    joinError,
    handleDocumentChange,
    handleCursorMove,
  };
};