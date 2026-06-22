import { useState, useMemo, useEffect } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { useDebounce } from '../../hooks/useDebounce';
import { safeRegexTest, buildHighlightSegments } from '../../utils/regexEngine';

const FLAG_OPTIONS = [
  { flag: 'g', label: 'g', title: 'Global — find all matches' },
  { flag: 'i', label: 'i', title: 'Case insensitive' },
  { flag: 'm', label: 'm', title: 'Multiline — ^ and $ match line boundaries' },
  { flag: 's', label: 's', title: 'Dotall — . matches newlines' },
];

const toolIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const RegexTesterPage = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');

  // Debounce both inputs — regex only recomputes 300ms after typing stops
  const debouncedPattern = useDebounce(pattern, 300);
  const debouncedTestString = useDebounce(testString, 300);

  const [result, setResult] = useState({ error: null, matches: [], isTimeout: false });
  const { error, matches, isTimeout } = result;

  useEffect(() => {
    if (!debouncedPattern || !debouncedTestString) {
      setResult({ error: null, matches: [], isTimeout: false });
      return;
    }

    let active = true;
    safeRegexTest(debouncedPattern, flags, debouncedTestString).then((res) => {
      if (active) setResult(res);
    });

    return () => { active = false; };
  }, [debouncedPattern, flags, debouncedTestString]);

  const segments = useMemo(() => {
    if (!debouncedTestString || !matches.length) return null;
    return buildHighlightSegments(debouncedTestString, matches);
  }, [debouncedTestString, matches]);

  const toggleFlag = (flag) => {
    setFlags(prev =>
      prev.includes(flag) ? prev.replace(flag, '') : prev + flag
    );
  };

  return (
    <ToolLayout
      title="Regex Tester"
      description="Real-time regex matching with capture group inspection."
      icon={toolIcon}
    >
      <div className="grid grid-cols-1 gap-4">

        {/* ── Pattern Input ── */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#545a7a] text-lg select-none">/</span>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="input-field font-mono flex-1"
              spellCheck={false}
            />
            <span className="font-mono text-[#545a7a] text-lg select-none">/{flags}</span>
          </div>

          {/* Flag Toggles */}
          <div className="flex gap-2 flex-wrap items-center">
            {FLAG_OPTIONS.map(({ flag, label, title }) => (
              <button
                key={flag}
                title={title}
                onClick={() => toggleFlag(flag)}
                className={`px-3 py-1.5 rounded-lg font-mono text-sm border transition-all duration-150 ${
                  flags.includes(flag)
                    ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-lg shadow-[#7c3aed]/25'
                    : 'bg-transparent text-[#545a7a] border-[#2d3148] hover:border-[#7c3aed] hover:text-[#a06efd]'
                }`}
              >
                {label}
              </button>
            ))}
            <span className="ml-auto text-sm text-[#545a7a] tabular-nums">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className={`p-3 rounded-lg text-sm font-mono border ${
            isTimeout
              ? 'bg-[rgba(245,158,11,0.08)] text-[#fbbf24] border-[rgba(245,158,11,0.3)]'
              : 'bg-[rgba(239,68,68,0.08)] text-[#f87171] border-[rgba(239,68,68,0.2)]'
          }`}>
            {error}
          </div>
        )}

        {/* ── Test String with Highlighting ── */}
        <div className="card space-y-3">
          <label className="font-semibold text-sm text-[#d8dbe8]">Test String</label>
          <div className="relative">
            {/* Transparent textarea on top for typing */}
            <textarea
              value={testString}
              onChange={e => setTestString(e.target.value)}
              className="input-field font-mono text-sm h-40 resize-none relative z-10 bg-transparent"
              placeholder="Enter test string here..."
              spellCheck={false}
            />
            {/* Highlighted overlay rendered beneath */}
            {segments && (
              <div className="absolute inset-0 font-mono text-sm p-[10px] pointer-events-none whitespace-pre-wrap break-all overflow-hidden rounded-lg z-0">
                {segments.map((seg, i) =>
                  seg.isMatch ? (
                    <mark
                      key={i}
                      style={{ background: 'rgba(124,58,237,0.35)', color: 'transparent', borderRadius: '3px' }}
                    >
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={i} style={{ color: 'transparent' }}>{seg.text}</span>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Match Details ── */}
        {matches.length > 0 && (
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-sm text-[#d8dbe8]">Match Details</label>
              <span className="badge badge-cyan text-[11px]">{matches.length} found</span>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-auto">
              {matches.map((match, i) => (
                <div key={i} className="flex gap-4 text-sm font-mono bg-[#080a0f] border border-[#1c1f2e] p-2.5 rounded-lg">
                  <span className="text-[#3d4263] min-w-[2rem]">#{i + 1}</span>
                  <span className="text-[#34d399]">"{match.value}"</span>
                  <span className="text-[#545a7a]">index: {match.index}–{match.end}</span>
                  {match.groups.length > 0 && (
                    <span className="text-[#a06efd]">
                      groups: [{match.groups.map(g => `"${g}"`).join(', ')}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default RegexTesterPage;