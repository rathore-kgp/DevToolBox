// src/pages/tools/EncodingToolsPage.jsx
import { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { encodeBase64, decodeBase64, fileToBase64 } from '../../utils/base64';
import { generateHash, generateUUID } from '../../utils/hashGenerator';

const TABS = [
  {
    id: 'Base64',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'Hash Generator',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
  },
  {
    id: 'UUID Generator',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
];

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

const EncodingToolsPage = () => {
  const [activeTab, setActiveTab] = useState('Base64');
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [base64Error, setBase64Error] = useState(null);

  const [hashInput, setHashInput] = useState('');
  const [hashAlgo, setHashAlgo] = useState('SHA-256');
  const [hashOutput, setHashOutput] = useState('');

  const [uuids, setUuids] = useState([]);
  const [uuidCount, setUuidCount] = useState(5);

  const handleBase64Encode = () => {
    try {
      setBase64Error(null);
      setBase64Output(encodeBase64(base64Input));
    } catch(e) { setBase64Error(e.message); }
  };

  const handleBase64Decode = () => {
    try {
      setBase64Error(null);
      setBase64Output(decodeBase64(base64Input));
    } catch(e) { setBase64Error(e.message); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setBase64Output(b64);
  };

  const handleGenerateHash = async () => {
    if (!hashInput) return;
    const hash = await generateHash(hashInput, hashAlgo);
    setHashOutput(hash);
  };

  const handleGenerateUUIDs = () => {
    const newUuids = Array.from({ length: uuidCount }, generateUUID);
    setUuids(newUuids);
  };

  const toolIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  return (
    <ToolLayout
      title="Encoding Tools"
      description="Base64 encode/decode, cryptographic hashing, and UUID generation — all in your browser."
      icon={toolIcon}
    >
      {/* Tab Navigation */}
      <div className="tab-nav w-fit">
        {TABS.map(({ id, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`tab-btn flex items-center gap-2 ${activeTab === id ? 'active' : ''}`}
          >
            {icon}
            {id}
          </button>
        ))}
      </div>

      {/* ─── Base64 Tab ─── */}
      {activeTab === 'Base64' && (
        <div className="card space-y-5 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-[#9099b5] mb-2">Input</label>
            <textarea
              className="input-field font-mono text-sm h-44"
              placeholder="Enter text to encode or a Base64 string to decode…"
              value={base64Input}
              onChange={e => setBase64Input(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <button onClick={handleBase64Encode} className="btn-primary text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Encode
            </button>
            <button onClick={handleBase64Decode} className="btn-primary text-sm" style={{ background: 'linear-gradient(135deg, #6d28d9, #5b21b6)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Decode
            </button>
            <label className="btn-primary text-sm cursor-pointer" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              Encode File
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            {base64Input && (
              <button onClick={() => { setBase64Input(''); setBase64Output(''); setBase64Error(null); }} className="btn-ghost text-sm">
                Clear
              </button>
            )}
          </div>

          {base64Error && (
            <div className="flex items-center gap-2 text-[#f87171] text-sm p-3 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
              {base64Error}
            </div>
          )}

          {base64Output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#9099b5]">Output</label>
                <CopyButton text={base64Output} />
              </div>
              <pre className="code-block max-h-48 overflow-auto">{base64Output}</pre>
            </div>
          )}
        </div>
      )}

      {/* ─── Hash Generator Tab ─── */}
      {activeTab === 'Hash Generator' && (
        <div className="card space-y-5 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-[#9099b5] mb-2">Text to hash</label>
            <textarea
              className="input-field font-mono text-sm h-36"
              placeholder="Enter text to generate a hash…"
              value={hashInput}
              onChange={e => {
                setHashInput(e.target.value);
                if (e.target.value) generateHash(e.target.value, hashAlgo).then(setHashOutput);
                else setHashOutput('');
              }}
            />
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <div>
              <label className="block text-xs font-medium text-[#6e758f] mb-1.5">Algorithm</label>
              <select
                value={hashAlgo}
                onChange={e => {
                  setHashAlgo(e.target.value);
                  if (hashInput) generateHash(hashInput, e.target.value).then(setHashOutput);
                }}
                className="input-field w-36"
              >
                {['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].map(a => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="self-end">
              <button onClick={handleGenerateHash} className="btn-primary text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                Generate
              </button>
            </div>
          </div>

          {hashOutput && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[#9099b5]">Hash output</span>
                  <span className="ml-2 badge badge-cyan text-[10px]">{hashAlgo}</span>
                </div>
                <CopyButton text={hashOutput} />
              </div>
              <div className="code-block break-all text-[#34d399] text-sm">{hashOutput}</div>
            </div>
          )}
        </div>
      )}

      {/* ─── UUID Generator Tab ─── */}
      {activeTab === 'UUID Generator' && (
        <div className="card space-y-5 animate-fade-in">
          <div className="flex gap-4 items-end flex-wrap">
            <div>
              <label className="block text-xs font-medium text-[#6e758f] mb-1.5">Count (1–100)</label>
              <input
                type="number"
                min="1" max="100"
                value={uuidCount}
                onChange={e => setUuidCount(Number(e.target.value))}
                className="input-field w-24"
              />
            </div>
            <button onClick={handleGenerateUUIDs} className="btn-primary text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Generate UUIDs
            </button>
            {uuids.length > 0 && (
              <CopyButton text={uuids.join('\n')} label="Copy All" />
            )}
          </div>

          {uuids.length > 0 && (
            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {uuids.map((uuid, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#080a0f] border border-[#1c1f2e] hover:border-[#3d4263] transition-colors group">
                  <span className="font-mono text-sm text-[#9099b5] group-hover:text-[#d8dbe8] transition-colors">{uuid}</span>
                  <CopyButton text={uuid} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default EncodingToolsPage;