import { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ToolLayout from '../../components/tools/ToolLayout';
import { useCollabRoom } from '../../hooks/useCollabRoom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useTheme } from '../../hooks/useTheme';
import { useSocket } from '../../context/SocketContext';

const UserAvatar = ({ user }) => (
  <div
    title={user.username}
    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-dark-bg"
    style={{ backgroundColor: user.color }}
  >
    {user.username[0].toUpperCase()}
  </div>
);

const statusConfig = {
  connected: { color: 'bg-green-500', label: 'Connected' },
  reconnecting: { color: 'bg-yellow-500', label: 'Reconnecting...' },
  disconnected: { color: 'bg-red-500', label: 'Disconnected' },
  connecting: { color: 'bg-gray-400', label: 'Connecting...' },
};

const CodeRoomPage = () => {
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [socketError, setSocketError] = useState(null);
  const currentUser = useSelector(selectCurrentUser);
  const { isDark } = useTheme();
  const socket = useSocket();

  const {
    document,
    users,
    handleDocumentChange,
    handleCursorMove,
  } = useCollabRoom(roomId, currentUser?.username);

  // Connection status listeners
  useState(() => {
    if (!socket) return;
    socket.on('connect', () => {
      setConnectionStatus('connected');
      setSocketError(null);
    });
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.on('reconnecting', () => setConnectionStatus('reconnecting'));
    socket.on('connect_error', (err) => {
      setConnectionStatus('disconnected');
      setSocketError('Could not connect to collaboration server. Please refresh.');
    });
  }, [socket]);

  const joinRoom = () => {
    if (inputRoomId.trim()) {
      setRoomId(inputRoomId.trim());
    }
  };

  const generateRoomId = () => {
    const id = Math.random().toString(36).slice(2, 9).toUpperCase();
    setInputRoomId(id);
  };

  if (!roomId) {
    return (
      <ToolLayout title="Code Room" description="Real-time collaborative code editor with WebSockets.">
        <div className="max-w-md mx-auto card space-y-4">
          <h2 className="font-semibold text-lg">Join or Create a Room</h2>
          <div className="flex gap-2">
            <input
              value={inputRoomId}
              onChange={e => setInputRoomId(e.target.value.toUpperCase())}
              placeholder="Enter Room ID (e.g., ABC1234)"
              className="input-field flex-1 font-mono uppercase"
              onKeyDown={e => e.key === 'Enter' && joinRoom()}
            />
            <button onClick={generateRoomId} className="btn-primary text-sm bg-gray-500 hover:bg-gray-600">
              Random
            </button>
          </div>
          <button onClick={joinRoom} disabled={!inputRoomId.trim()} className="btn-primary w-full">
            Join Room
          </button>
          <p className="text-xs text-gray-500 text-center">Share the Room ID with collaborators. Up to 10 users per room.</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Socket Error Banner */}
      {socketError && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 text-red-600 dark:text-red-400 text-sm">
          {socketError}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-brand-500">#{roomId}</span>

          {/* Connection Status */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusConfig[connectionStatus].color}`} />
            <span className="text-xs text-gray-500">{statusConfig[connectionStatus].label}</span>
          </div>

          {/* Copy Room ID */}
          <button
            onClick={() => navigator.clipboard.writeText(roomId)}
            className="text-xs text-brand-500 hover:underline"
          >
            Copy Room ID
          </button>

          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="text-sm border border-gray-200 dark:border-dark-border rounded px-2 py-1 bg-transparent"
          >
            {['javascript', 'typescript', 'python', 'json', 'html', 'css', 'markdown'].map(l => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Active Users */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{users.length} online</span>
          <div className="flex -space-x-2">
            {users.slice(0, 5).map(user => (
              <UserAvatar key={user.socketId} user={user} />
            ))}
            {users.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs border-2 border-white">
                +{users.length - 5}
              </div>
            )}
          </div>
          <button
            onClick={() => setRoomId('')}
            className="ml-2 text-xs text-red-400 hover:text-red-600"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={language}
          value={document}
          theme={isDark ? 'vs-dark' : 'light'}
          onChange={handleDocumentChange}
          onMount={(editor) => {
            editor.onDidChangeCursorPosition((e) => {
              handleCursorMove(e.position);
            });
          }}
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            minimap: { enabled: false },
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-gray-200 dark:border-dark-border text-xs text-gray-400 flex justify-between">
        <span>Last-write-wins sync • Changes auto-saved to room</span>
        <div className="flex items-center gap-4">
          <span>{document.length} chars</span>
          <button
            onClick={() => navigator.clipboard.writeText(document)}
            className="text-brand-500 hover:underline"
          >
            Copy Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeRoomPage;