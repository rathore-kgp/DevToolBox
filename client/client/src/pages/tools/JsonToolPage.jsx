import { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { useJsonTool } from '../../hooks/useJsonTool';
import { jsonToCSV, downloadCSV } from '../../utils/jsonToCsv';

const CopyButton = ({ text, label = 'Copy' }) => {
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
          {label}
        </>
      )}
    </button>
  );
};

const JsonToolsPage = () => {
  const { input, setInput, output, error, isValid, formatJSON, minifyJSON, parseJSON } = useJsonTool();
  const [csvError, setCsvError] = useState(null);

  const handleConvertToCSV = () => {
    setCsvError(null);
    const parsed = parseJSON(input);
    if (!parsed) return;
    try {
      const csv = jsonToCSV(parsed);
      downloadCSV(csv);
    } catch (e) {
      setCsvError(e.message);
    }
  };

  const toolIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h10M7 16h10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
    </svg>
  );

  return (
    <ToolLayout
      title="JSON Tools"
      description="Format, validate, minify, and convert JSON data — entirely in your browser."
      icon={toolIcon}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Input Panel ── */}
        <div className="card flex flex-col gap-4">
          {/* Panel header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
              <label className="font-semibold text-sm text-[#d8dbe8]">Input JSON</label>
            </div>
            {isValid !== null && (
              <span className={`badge text-[11px] ${isValid ? 'badge-green' : 'badge-red'}`}>
                {isValid ? '✓ Valid' : '✗ Invalid'}
              </span>
            )}
          </div>

          <textarea
            id="json-input"
            className="input-field font-mono text-sm h-72 resize-none"
            placeholder={'{\n  "key": "value"\n}'}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value) formatJSON(e.target.value);
            }}
          />

          {error && (
            <div className="flex items-start gap-2 text-[#f87171] text-xs p-3 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] font-mono">
              <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
              {error}
            </div>
          )}

          {csvError && (
            <div className="text-[#f87171] text-xs p-2 rounded bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
              {csvError}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              id="json-format-btn"
              onClick={() => formatJSON(input)}
              className="btn-primary text-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
              Format
            </button>
            <button
              id="json-minify-btn"
              onClick={() => minifyJSON(input)}
              className="btn-secondary text-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
              Minify
            </button>
            <button
              id="json-csv-btn"
              onClick={handleConvertToCSV}
              className="btn-primary text-sm"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export CSV
            </button>
            {input && (
              <button
                onClick={() => setInput('')}
                className="btn-ghost text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Output Panel ── */}
        <div className="card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#06b6d4]" />
              <label className="font-semibold text-sm text-[#d8dbe8]">Output</label>
            </div>
            {output && <CopyButton text={output} />}
          </div>

          <pre
            id="json-output"
            className="code-block flex-1 h-72 overflow-auto"
          >
            {output || (
              <span className="text-[#3d4263] italic">Output appears here…</span>
            )}
          </pre>

          {output && (
            <div className="flex items-center gap-2 text-xs text-[#545a7a] pt-1 border-t border-[#1c1f2e]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {output.length.toLocaleString()} characters · {new Blob([output]).size.toLocaleString()} bytes
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonToolsPage;