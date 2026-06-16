import { useState, useMemo } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { useDebounce } from '../../hooks/useDebounce';
import { safeRegexTest, buildHighlightSegments } from '../../utils/regexEngine';

const FLAG_OPTIONS = [
  { flag: 'g', label: 'g', title: 'Global — find all matches' },
  { flag: 'i', label: 'i', title: 'Case insensitive' },
  { flag: 'm', label: 'm', title: 'Multiline — ^ and $ match line boundaries' },
  { flag: 's', label: 's', title: 'Dotall — . matches newlines' },
];

const RegexTesterPage = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');

  // Debounce both inputs — regex only recomputes 300ms after typing stops
  const debouncedPattern = useDebounce(pattern, 300);
  const debouncedTestString = useDebounce(testString, 300);

  // useMemo: recomputes only when debounced values change
  const { error, matches, isTimeout } = useMemo(() => {
    if (!debouncedPattern || !debouncedTestString) {
      return { error: null, matches: [], isTimeout: false };
    }
    return safeRegexTest(debouncedPattern, flags, debouncedTestString);
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
    <ToolLayout title="Regex Tester" description="Real-time regex matching with capture group inspection.">
      <div className="grid grid-cols-1 gap-4">
        {/* Pattern Input */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-gray-400 text-lg">/</span>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="input-field font-mono flex-1"
              spellCheck={false}
            />
            <span className="font-mono text-gray-400 text-lg">/{flags}</span>
          </div>
          
          {/* Flag Toggles */}
          <div className="flex gap-2">
            {FLAG_OPTIONS.map(({ flag, label, title }) => (
              <button
                key={flag}
                title={title}
                onClick={() => toggleFlag(flag)}
                className={`px-3 py-1 rounded font-mono text-sm border transition-colors ${
                  flags.includes(flag)
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-transparent text-gray-500 border-gray-300 dark:border-dark-border hover:border-brand-500'
                }`}
              >
                {label}
              </button>
            ))}
            <span className="ml-auto text-sm text-gray-500">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
        </div>

        {error && (
          <div className={`p-3 rounded-lg text-sm font-mono ${
            isTimeout ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200'
          }`}>
            {error}
          </div>
        )}

        {/* Test String with Highlighting */}
        <div className="card space-y-3">
          <label className="font-semibold text-sm">Test String</label>
          <div className="relative">
            {/* Transparent textarea on top for typing */}
            <textarea
              value={testString}
              onChange={e => setTestString(e.target.value)}
              className="input-field font-mono text-sm h-40 resize-none relative z-10 bg-transparent"
              placeholder="Enter test string here..."
              spellCheck={false}
            />
            {/* Highlighted overlay (rendered beneath but visually on top via CSS) */}
            {segments && (
              <div className="absolute inset-0 font-mono text-sm p-[9px] pointer-events-none whitespace-pre-wrap break-all overflow-hidden rounded-lg z-0">
                {segments.map((seg, i) =>
                  seg.isMatch ? (
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded">
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={i} className="text-transparent">{seg.text}</span>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Match Details */}
        {matches.length > 0 && (
          <div className="card">
            <label className="font-semibold text-sm mb-3 block">Match Details</label>
            <div className="space-y-2 max-h-60 overflow-auto">
              {matches.map((match, i) => (
                <div key={i} className="flex gap-4 text-sm font-mono bg-gray-50 dark:bg-dark-bg p-2 rounded">
                  <span className="text-gray-400">#{i + 1}</span>
                  <span className="text-green-600 dark:text-green-400">"{match.value}"</span>
                  <span className="text-gray-500">index: {match.index}–{match.end}</span>
                  {match.groups.length > 0 && (
                    <span className="text-purple-600 dark:text-purple-400">
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