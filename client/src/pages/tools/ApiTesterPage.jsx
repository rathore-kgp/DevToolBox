import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setUrl, setMethod, setHeaders, setBody, clearResponse,
  sendProxyRequest, fetchCollections, saveCollection, loadRequest,
  selectUrl, selectMethod, selectHeaders, selectBody,
  selectResponse, selectIsLoading, selectError, selectCollections,
} from '../../store/slices/apiTesterSlice';
import KeyValueEditor from '../../components/tools/KeyValueEditor';
import { getStatusColor, getStatusBg } from '../../utils/statusColors';
import EmptyState from '../../components/ui/EmptyState';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];

const METHOD_COLORS = {
  GET:    'text-[#10b981]',
  POST:   'text-[#7c3aed]',
  PUT:    'text-[#f59e0b]',
  PATCH:  'text-[#06b6d4]',
  DELETE: 'text-[#f87171]',
  HEAD:   'text-[#545a7a]',
};

const ApiTesterPage = () => {
  const dispatch = useDispatch();
  const url = useSelector(selectUrl);
  const method = useSelector(selectMethod);
  const headers = useSelector(selectHeaders);
  const body = useSelector(selectBody);
  const response = useSelector(selectResponse);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const collections = useSelector(selectCollections);

  const [activeTab, setActiveTab] = useState('headers');
  const [responseTab, setResponseTab] = useState('body');
  const [collectionName, setCollectionName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCollections, setShowCollections] = useState(false);

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  const handleSend = useCallback(() => {
    const enabledHeaders = headers
      .filter(h => h.enabled && h.key)
      .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

    dispatch(sendProxyRequest({
      url,
      method,
      headers: enabledHeaders,
      body: ['GET', 'HEAD'].includes(method) ? undefined : body,
    }));
  }, [dispatch, url, method, headers, body]);

  const handleSaveCollection = () => {
    if (!collectionName.trim()) return;
    const enabledHeaders = headers
      .filter(h => h.enabled && h.key)
      .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

    dispatch(saveCollection({
      name: collectionName,
      requests: [{ name: url, url, method, headers: enabledHeaders, body }],
    }));
    setCollectionName('');
    setShowSaveModal(false);
  };

  const handleLoadRequest = (request) => {
    dispatch(loadRequest(request));
    setShowCollections(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f0e7ff]">API Tester</h1>
          <p className="text-[#545a7a] text-sm mt-1">Send HTTP requests through our secure proxy</p>
        </div>
        <button
          onClick={() => setShowCollections(!showCollections)}
          className="text-sm text-[#a06efd] hover:text-[#7c3aed] transition-colors border border-[#7c3aed]/30 px-3 py-1.5 rounded-lg"
        >
          {showCollections ? 'Hide' : 'Show'} Collections
        </button>
      </div>

      <div className="flex gap-4">
        {/* ── Main Panel ── */}
        <div className="flex-1 space-y-3">

          {/* URL Bar */}
          <div className="flex gap-2 p-4 rounded-2xl border border-[#1c1f2e] bg-[#0d0f17]/60">
            <select
              value={method}
              onChange={e => dispatch(setMethod(e.target.value))}
              className={`bg-[#0d0f17] border border-[#2d3148] rounded-lg px-3 py-2 text-sm font-bold font-mono ${METHOD_COLORS[method]} focus:outline-none focus:border-[#7c3aed]`}
            >
              {METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <input
              type="url"
              value={url}
              onChange={e => dispatch(setUrl(e.target.value))}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 bg-[#0d0f17] border border-[#2d3148] rounded-lg px-3 py-2 text-sm font-mono text-[#d8dbe8] placeholder-[#3d4263] focus:outline-none focus:border-[#7c3aed] transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />

            <button
              onClick={handleSend}
              disabled={isLoading || !url}
              className="px-5 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Sending...
                </span>
              ) : 'Send'}
            </button>
          </div>

          {/* Request Tabs */}
          <div className="rounded-2xl border border-[#1c1f2e] bg-[#0d0f17]/60 overflow-hidden">
            <div className="flex border-b border-[#1c1f2e]">
              {['headers', 'body'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-[#a06efd] border-b-2 border-[#7c3aed]'
                      : 'text-[#545a7a] hover:text-[#d8dbe8]'
                  }`}
                >
                  {tab}
                  {tab === 'headers' && (
                    <span className="ml-2 text-xs bg-[#1c1f2e] px-1.5 py-0.5 rounded-full">
                      {headers.filter(h => h.enabled && h.key).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === 'headers' && (
                <KeyValueEditor
                  pairs={headers}
                  onChange={(pairs) => dispatch(setHeaders(pairs))}
                  placeholder="Header"
                />
              )}
              {activeTab === 'body' && (
                <div className="space-y-2">
                  {['GET', 'HEAD'].includes(method) ? (
                    <p className="text-[#545a7a] text-sm text-center py-4">
                      {method} requests cannot have a body
                    </p>
                  ) : (
                    <textarea
                      value={body}
                      onChange={e => dispatch(setBody(e.target.value))}
                      placeholder='{"key": "value"}'
                      className="w-full bg-[#0d0f17] border border-[#2d3148] rounded-lg px-3 py-2 text-sm font-mono text-[#d8dbe8] placeholder-[#3d4263] focus:outline-none focus:border-[#7c3aed] h-40 resize-none transition-colors"
                      spellCheck={false}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
{/* Empty state — show when no response yet */}
{!response && !error && !isLoading && (
  <EmptyState
    icon="⚡"
    title="No request sent yet"
    description="Enter a URL above and click Send to make your first request."
  />
)}
          {/* ── Response Panel ── */}
          {(response || error || isLoading) && (
            <div className="rounded-2xl border border-[#1c1f2e] bg-[#0d0f17]/60 overflow-hidden">
              {/* Response Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c1f2e]">
                <div className="flex items-center gap-3">
                  {response && (
                    <>
                      <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${getStatusBg(response.status)} ${getStatusColor(response.status)}`}>
                        {response.status} {response.statusText}
                      </span>
                      <span className="text-xs text-[#545a7a]">{response.duration}ms</span>
                      <span className="text-xs text-[#545a7a]">
                        {(response.size / 1024).toFixed(2)} KB
                      </span>
                    </>
                  )}
                  {isLoading && <span className="text-sm text-[#545a7a]">Waiting for response...</span>}
                  {error && <span className="text-sm text-[#f87171]">{error}</span>}
                </div>

                {response && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSaveModal(true)}
                      className="text-xs text-[#a06efd] hover:text-[#7c3aed] transition-colors"
                    >
                      Save Request
                    </button>
                    <button
                      onClick={() => dispatch(clearResponse())}
                      className="text-xs text-[#545a7a] hover:text-[#f87171] transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Response Tabs */}
              {response && (
                <>
                  <div className="flex border-b border-[#1c1f2e]">
                    {['body', 'headers'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setResponseTab(tab)}
                        className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
                          responseTab === tab
                            ? 'text-[#a06efd] border-b-2 border-[#7c3aed]'
                            : 'text-[#545a7a] hover:text-[#d8dbe8]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="p-4">
                    {responseTab === 'body' && (
                      <div className="relative">
                        <button
                          onClick={() => navigator.clipboard.writeText(
                            typeof response.data === 'object'
                              ? JSON.stringify(response.data, null, 2)
                              : response.data
                          )}
                          className="absolute top-2 right-2 text-xs text-[#a06efd] hover:text-[#7c3aed] z-10"
                        >
                          Copy
                        </button>
                        <pre className="bg-[#060810] rounded-lg p-4 text-sm font-mono text-[#d8dbe8] overflow-auto max-h-96 whitespace-pre-wrap break-all">
                          {typeof response.data === 'object'
                            ? JSON.stringify(response.data, null, 2)
                            : response.data || 'Empty response'}
                        </pre>
                      </div>
                    )}

                    {responseTab === 'headers' && (
                      <div className="space-y-1">
                        {Object.entries(response.headers || {}).map(([key, value]) => (
                          <div key={key} className="flex gap-3 text-xs font-mono py-1 border-b border-[#1c1f2e]">
                            <span className="text-[#a06efd] min-w-40">{key}</span>
                            <span className="text-[#d8dbe8] break-all">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Collections Sidebar ── */}
        {showCollections && (
          <div className="w-64 shrink-0 rounded-2xl border border-[#1c1f2e] bg-[#0d0f17]/60 p-4 space-y-3 h-fit">
            <h3 className="text-sm font-semibold text-[#d8dbe8]">Collections</h3>
            {collections.length === 0 ? (
              <p className="text-xs text-[#545a7a] text-center py-4">
                No saved collections yet
              </p>
            ) : (
              <div className="space-y-2">
                {collections.map((col) => (
                  <div key={col._id} className="space-y-1">
                    <p className="text-xs font-semibold text-[#a06efd]">{col.name}</p>
                    {col.requests?.map((req) => (
                      <button
                        key={req._id}
                        onClick={() => handleLoadRequest(req)}
                        className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1c1f2e] transition-colors"
                      >
                        <span className={`text-[10px] font-bold font-mono ${METHOD_COLORS[req.method] || 'text-[#545a7a]'}`}>
                          {req.method}
                        </span>
                        <span className="text-xs text-[#6e758f] truncate">{req.name || req.url}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Save Modal ── */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0d0f17] border border-[#2d3148] rounded-2xl p-6 w-80 space-y-4">
            <h3 className="text-[#f0e7ff] font-semibold">Save to Collection</h3>
            <input
              type="text"
              value={collectionName}
              onChange={e => setCollectionName(e.target.value)}
              placeholder="Collection name..."
              className="w-full bg-[#060810] border border-[#2d3148] rounded-lg px-3 py-2 text-sm text-[#d8dbe8] placeholder-[#3d4263] focus:outline-none focus:border-[#7c3aed]"
              onKeyDown={e => e.key === 'Enter' && handleSaveCollection()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-sm text-[#545a7a] hover:text-[#d8dbe8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCollection}
                disabled={!collectionName.trim()}
                className="px-4 py-2 text-sm bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTesterPage;