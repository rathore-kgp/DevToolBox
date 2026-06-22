import { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { convertCurlToCode } from '../../utils/codeGenerators';
import EmptyState from '../../components/ui/EmptyState';

const SAMPLE_CURL = `curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer token123' \\
  -d '{"name": "Alice", "email": "alice@example.com"}'`;

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
        copied
          ? 'bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(16,185,129,0.3)]'
          : 'bg-[#232638] text-[#9099b5] border border-[#2d3148] hover:border-[#7c3aed] hover:text-[#a06efd]'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
};

const CurlConverterPage = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('axios');

  const handleConvert = () => {
    setError(null);
    setResult(null);
    try {
      const converted = convertCurlToCode(input || SAMPLE_CURL);
      setResult(converted);
    } catch (e) {
      setError(e.message);
    }
  };

  const toolIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <ToolLayout
      title="cURL Converter"
      description="Transform cURL commands into Axios or Fetch code instantly."
      icon={toolIcon}
    >
      <div className="space-y-4">

        {/* ── Input Card ── */}
        <div className="card space-y-3">
          <label className="block text-sm font-medium text-[#9099b5]">cURL Command</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={SAMPLE_CURL}
            className="input-field font-mono text-sm h-36 resize-none"
            spellCheck={false}
          />
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleConvert} className="btn-primary text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Convert
            </button>
            <button
              onClick={() => { setInput(SAMPLE_CURL); setResult(null); setError(null); }}
              className="btn-secondary text-sm"
            >
              Load Sample
            </button>
            {input && (
              <button
                onClick={() => { setInput(''); setResult(null); setError(null); }}
                className="btn-ghost text-sm"
              >
                Clear
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 text-[#f87171] text-xs p-3 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] font-mono">
              <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* ── Empty State ── */}
        {!result && !error && (
          <EmptyState
            icon="↔"
            title="No cURL command yet"
            description="Paste a cURL command above and click Convert to generate code."
          />
        )}

        {/* ── Result ── */}
        {result && (
          <>
            {/* Parsed Summary */}
            <div className="card space-y-4">
              <h3 className="font-semibold text-sm text-[#d8dbe8]">Parsed Request</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-[#545a7a] text-xs mb-1">Method</p>
                  <p className="font-mono font-bold text-[#a06efd]">{result.parsed.method}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-[#545a7a] text-xs mb-1">URL</p>
                  <p className="font-mono text-sm text-[#d8dbe8] break-all">{result.parsed.url}</p>
                </div>
              </div>

              {Object.keys(result.parsed.headers).length > 0 && (
                <div>
                  <p className="text-[#545a7a] text-xs mb-2">Headers</p>
                  <div className="space-y-1">
                    {Object.entries(result.parsed.headers).map(([k, v]) => (
                      <div key={k} className="flex gap-3 text-xs font-mono py-1 border-b border-[#1c1f2e]">
                        <span className="text-[#a06efd] min-w-40">{k}</span>
                        <span className="text-[#d8dbe8]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.parsed.body && (
                <div>
                  <p className="text-[#545a7a] text-xs mb-2">Body</p>
                  <pre className="code-block text-xs max-h-32 overflow-auto">{result.parsed.body}</pre>
                </div>
              )}
            </div>

            {/* Code Output */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <div className="tab-nav w-fit">
                  {['axios', 'fetch'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    >
                      {tab === 'axios' ? 'Axios' : 'Fetch API'}
                    </button>
                  ))}
                </div>
                <CopyButton text={result[activeTab]} />
              </div>
              <pre className="code-block overflow-auto max-h-96">
                {result[activeTab]}
              </pre>
            </div>
          </>
        )}

      </div>
    </ToolLayout>
  );
};

export default CurlConverterPage;