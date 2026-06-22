const jwt = require('jsonwebtoken');

// In-memory room state
// Structure: { roomId: { users: Map<socketId, userInfo>, document: string } }
const rooms = new Map();

const getOrCreateRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      document: '// Start coding together!\n',
    });
  }
  return rooms.get(roomId);
};

const initializeSocketServer = (io) => {
  // JWT Authentication Middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication token required.'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Attach user info to socket
      next();
    } catch (err) {
      next(new Error('Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.user.id})`);

    // === EVENT: Join Room ===
    socket.on('room:join', ({ roomId, username }) => {
      // Leave any existing rooms (one room at a time)
      const currentRooms = Array.from(socket.rooms).filter(r => r !== socket.id);
      currentRooms.forEach(room => {
        socket.leave(room);
        handleUserLeave(io, socket, room);
      });

      socket.join(roomId);

      const room = getOrCreateRoom(roomId);
      room.users.set(socket.id, {
        socketId: socket.id,
        userId: socket.user.id,
        username: username || `User-${socket.id.slice(0, 4)}`,
        color: generateUserColor(socket.id), // Deterministic color for cursor
        joinedAt: new Date().toISOString(),
      });

      // Send current document state to the newly joined user
      socket.emit('room:state', {
        document: room.document,
        users: Array.from(room.users.values()),
      });

      // Notify others in the room
      socket.to(roomId).emit('room:user-joined', {
        user: room.users.get(socket.id),
        users: Array.from(room.users.values()),
      });

      console.log(`👤 ${username} joined room: ${roomId}`);
    });

    // === EVENT: Document Change (Last-Write-Wins) ===
    socket.on('document:change', ({ roomId, content, cursorPosition }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // Update server-side document state
      room.document = content;

      // Broadcast to ALL OTHER clients in the room (not the sender)
      socket.to(roomId).emit('document:update', {
        content,
        cursorPosition,
        userId: socket.user.id,
        socketId: socket.id,
        timestamp: Date.now(),
      });
    });

    // === EVENT: Cursor Position Update ===
    socket.on('cursor:move', ({ roomId, position, selection }) => {
      socket.to(roomId).emit('cursor:update', {
        socketId: socket.id,
        userId: socket.user.id,
        position,
        selection,
      });
    });

    // === EVENT: Disconnect ===
    socket.on('disconnecting', () => {
      // `socket.rooms` still has rooms during 'disconnecting' (not in 'disconnect')
      socket.rooms.forEach(roomId => {
        if (roomId !== socket.id) {
          handleUserLeave(io, socket, roomId);
        }
      });
    });
  });
};

const handleUserLeave = (io, socket, roomId) => {
  const room = rooms.get(roomId);
  if (!room) return;

  const user = room.users.get(socket.id);
  room.users.delete(socket.id);

  io.to(roomId).emit('room:user-left', {
    socketId: socket.id,
    userId: socket.user?.id,
    users: Array.from(room.users.values()),
  });

  // Garbage collect empty rooms
  if (room.users.size === 0) {
    rooms.delete(roomId);
    console.log(`🗑️  Room ${roomId} cleaned up (empty)`);
  }
};

// Generate a deterministic color from a socket ID for user cursors
const generateUserColor = (socketId) => {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  const hash = socketId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

module.exports = { initializeSocketServer };