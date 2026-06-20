import { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { convertCurlToCode } from '../../utils/codeGenerators';
import EmptyState from '../../components/ui/EmptyState';

const SAMPLE_CURL = `curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer token123' \\
  -d '{"name": "Alice", "email": "alice@example.com"}'`;

const CurlConverterPage = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('axios');

  const handleConvert = () => {
    setError(null);
    try {
      const converted = convertCurlToCode(input || SAMPLE_CURL);
      setResult(converted);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <ToolLayout title="cURL Converter" description="Transform cURL commands into Axios or Fetch code instantly.">
      <div className="space-y-4">

        {/* Input Card */}
        <div className="card space-y-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={SAMPLE_CURL}
            className="input-field font-mono text-sm h-36 resize-none"
            spellCheck={false}
          />
          <div className="flex gap-2">
            <button onClick={handleConvert} className="btn-primary text-sm">
              Convert
            </button>
            <button
              onClick={() => { setInput(SAMPLE_CURL); setResult(null); }}
              className="btn-primary text-sm bg-gray-500 hover:bg-gray-600"
            >
              Load Sample
            </button>
          </div>
          {error && <p className="text-red-500 text-sm font-mono">{error}</p>}
        </div>

        {/* Empty State — show when no result yet */}
        {!result && !error && (
          <EmptyState
            icon="↔"
            title="No cURL command yet"
            description="Paste a cURL command above and click Convert to generate code."
          />
        )}

        {/* Result */}
        {result && (
          <>
            {/* Parsed Summary */}
            <div className="card">
              <h3 className="font-semibold text-sm mb-3">Parsed Request</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Method</p>
                  <p className="font-mono font-bold text-brand-500">{result.parsed.method}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-gray-500 text-xs">URL</p>
                  <p className="font-mono text-sm break-all">{result.parsed.url}</p>
                </div>
              </div>
              {Object.keys(result.parsed.headers).length > 0 && (
                <div className="mt-3">
                  <p className="text-gray-500 text-xs mb-1">Headers</p>
                  {Object.entries(result.parsed.headers).map(([k, v]) => (
                    <div key={k} className="font-mono text-xs">
                      <span className="text-purple-500">{k}</span>: {v}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Code Output */}
            <div className="card">
              <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-dark-bg p-1 rounded-lg w-fit">
                {['axios', 'fetch'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-white dark:bg-dark-surface shadow-sm text-brand-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {tab === 'axios' ? 'Axios' : 'Fetch API'}
                  </button>
                ))}
                <button
                  onClick={() => navigator.clipboard.writeText(result[activeTab])}
                  className="ml-4 text-xs text-brand-500 hover:text-brand-600 px-2"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-50 dark:bg-dark-bg p-4 rounded-lg font-mono text-sm overflow-auto whitespace-pre-wrap">
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