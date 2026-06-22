import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ToolLayout from '../../components/tools/ToolLayout';
import { useCollabRoom } from '../../hooks/useCollabRoom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useTheme } from '../../hooks/useTheme';
import { useSocket } from '../../context/SocketContext';

// Bug 4 fix: proper project hex tokens — no dark: / bg-gray-* / text-brand-* classes
const statusConfig = {
  connected:    { dot: 'bg-[#34d399]', label: 'Connected' },
  reconnecting: { dot: 'bg-[#fbbf24]', label: 'Reconnecting...' },
  disconnected: { dot: 'bg-[#f87171]', label: 'Disconnected' },
  connecting:   { dot: 'bg-[#545a7a]', label: 'Connecting...' },
};

const UserAvatar = ({ user }) => (
  <div
    title={user.username}
    // Bug 4 fix: dark:border-dark-bg → border-[#0d0f17]
    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#0d0f17]"
    style={{ backgroundColor: user.color }}
  >
    {user.username[0].toUpperCase()}
  </div>
);

const toolIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

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
    // Bug 5 fix: renamed from `document` to `docContent` to avoid shadowing the
    // global window.document object, which would break useTheme & any other DOM calls.
    document: docContent,
    users,
    handleDocumentChange,
    handleCursorMove,
  } = useCollabRoom(roomId, currentUser?.username);

  // Bug 1 fix: was useState() — must be useEffect()
  // Bug 2 fix: named handlers so they can be properly removed in cleanup
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setConnectionStatus('connected');
      setSocketError(null);
    };
    const onDisconnect = () => setConnectionStatus('disconnected');
    const onReconnecting = () => setConnectionStatus('reconnecting');
    const onConnectError = () => {
      setConnectionStatus('disconnected');
      setSocketError('Could not connect to collaboration server. Please refresh.');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnecting', onReconnecting);
    socket.on('connect_error', onConnectError);

    // Cleanup: remove exactly the handlers we added, not all listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnecting', onReconnecting);
      socket.off('connect_error', onConnectError);
    };
  }, [socket]);

  const joinRoom = () => {
    if (inputRoomId.trim()) setRoomId(inputRoomId.trim());
  };

  const generateRoomId = () => {
    const id = Math.random().toString(36).slice(2, 9).toUpperCase();
    setInputRoomId(id);
  };

  // ── Join screen ──
  if (!roomId) {
    return (
      <ToolLayout
        title="Code Room"
        description="Real-time collaborative code editor. Share a Room ID to code together."
        icon={toolIcon}
      >
        <div className="max-w-md mx-auto">
          <div className="card space-y-5">
            <div>
              <h2 className="font-semibold text-lg text-[#d8dbe8] mb-1">Join or Create a Room</h2>
              <p className="text-sm text-[#545a7a]">
                Enter any Room ID or generate a random one to start collaborating.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                value={inputRoomId}
                onChange={e => setInputRoomId(e.target.value.toUpperCase())}
                placeholder="Enter Room ID (e.g., ABC1234)"
                className="input-field flex-1 font-mono uppercase"
                onKeyDown={e => e.key === 'Enter' && joinRoom()}
              />
              {/* Bug 3 fix: btn-secondary replaces btn-primary bg-gray-500 hover:bg-gray-600 */}
              <button onClick={generateRoomId} className="btn-secondary text-sm">
                Random
              </button>
            </div>

            <button
              onClick={joinRoom}
              disabled={!inputRoomId.trim()}
              className="btn-primary w-full justify-center"
            >
              Join Room
            </button>

            <p className="text-xs text-[#545a7a] text-center">
              Share the Room ID with collaborators. Up to 10 users per room.
            </p>
          </div>
        </div>
      </ToolLayout>
    );
  }

  const status = statusConfig[connectionStatus] ?? statusConfig.connecting;

  // ── Editor screen ──
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-2xl border border-[#1c1f2e] overflow-hidden">

      {/* Socket Error Banner — Bug 4 fix: was bg-red-50 dark:bg-red-900/20 */}
      {socketError && (
        <div className="px-4 py-2 bg-[rgba(239,68,68,0.08)] border-b border-[rgba(239,68,68,0.2)] text-[#f87171] text-sm">
          {socketError}
        </div>
      )}

      {/* Toolbar — Bug 4 fix: was bg-white dark:bg-dark-surface / border-gray-200 dark:border-dark-border */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1c1f2e] bg-[#0d0f17]/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Room ID — Bug 4 fix: was text-brand-500 */}
          <span className="font-mono text-sm font-bold text-[#a06efd]">#{roomId}</span>

          {/* Connection Status */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            {/* Bug 4 fix: was text-gray-500 */}
            <span className="text-xs text-[#545a7a]">{status.label}</span>
          </div>

          {/* Copy Room ID — Bug 4 fix: was text-brand-500 hover:underline */}
          <button
            onClick={() => navigator.clipboard.writeText(roomId)}
            className="text-xs text-[#a06efd] hover:text-[#7c3aed] hover:underline transition-colors"
          >
            Copy ID
          </button>

          {/* Language Selector — Bug 4 fix: was border-gray-200 dark:border-dark-border */}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="input-field text-sm py-1 w-36"
          >
            {['javascript', 'typescript', 'python', 'json', 'html', 'css', 'markdown'].map(l => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Active Users */}
        <div className="flex items-center gap-3">
          {/* Bug 4 fix: was text-gray-500 */}
          <span className="text-xs text-[#545a7a]">{users.length} online</span>
          <div className="flex -space-x-2">
            {users.slice(0, 5).map(user => (
              <UserAvatar key={user.socketId} user={user} />
            ))}
            {/* Bug 4 fix: was bg-gray-400 border-white */}
            {users.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-[#232638] border-2 border-[#0d0f17] flex items-center justify-center text-[#9099b5] text-xs">
                +{users.length - 5}
              </div>
            )}
          </div>
          <button
            onClick={() => setRoomId('')}
            className="text-xs text-[#f87171] hover:text-[#fca5a5] transition-colors border border-[rgba(239,68,68,0.25)] px-2 py-1 rounded-lg hover:bg-[rgba(239,68,68,0.08)]"
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
          value={docContent}
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

      {/* Footer — Bug 4 fix: was border-gray-200 dark:border-dark-border text-gray-400 text-brand-500 */}
      <div className="px-4 py-1.5 border-t border-[#1c1f2e] bg-[#0d0f17]/80 text-xs text-[#545a7a] flex justify-between">
        <span>Last-write-wins sync · Changes auto-saved to room</span>
        <div className="flex items-center gap-4">
          {/* Bug 5 fix: was document.length — now uses renamed docContent */}
          <span>{docContent.length} chars</span>
          <button
            onClick={() => navigator.clipboard.writeText(docContent)}
            className="text-[#a06efd] hover:text-[#7c3aed] hover:underline transition-colors"
          >
            Copy Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeRoomPage;