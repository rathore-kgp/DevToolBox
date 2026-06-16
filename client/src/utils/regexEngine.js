/**
 * Executes a regex match with a timeout to catch catastrophic backtracking.
 * Uses a Web Worker pattern concept — for simplicity we use a sync timeout flag.
 */
export const safeRegexTest = (pattern, flags, testString, timeoutMs = 2000) => {
  let regex;
  try {
    regex = new RegExp(pattern, flags);
  } catch (e) {
    return { error: `Invalid regex: ${e.message}`, matches: [], isTimeout: false };
  }

  // Reset lastIndex for global regexes to avoid stale state
  regex.lastIndex = 0;

  const matches = [];
  const startTime = performance.now();

  if (flags.includes('g')) {
    let match;
    while ((match = regex.exec(testString)) !== null) {
      // Timeout check inside the loop
      if (performance.now() - startTime > timeoutMs) {
        return {
          error: `⚠️ Execution timed out after ${timeoutMs}ms. This pattern may be vulnerable to ReDoS.`,
          matches,
          isTimeout: true,
        };
      }

      matches.push({
        value: match[0],
        index: match.index,
        end: match.index + match[0].length,
        groups: match.slice(1), // Capture groups
        namedGroups: match.groups || {},
      });

      // Prevent infinite loop on zero-length matches
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
    }
  } else {
    const match = regex.exec(testString);
    if (match) {
      matches.push({
        value: match[0],
        index: match.index,
        end: match.index + match[0].length,
        groups: match.slice(1),
        namedGroups: match.groups || {},
      });
    }
  }

  return { error: null, matches, isTimeout: false };
};

/**
 * Generates highlighted HTML from matches.
 * Returns array of {text, isMatch} segments for rendering.
 */
export const buildHighlightSegments = (testString, matches) => {
  if (!matches.length) return [{ text: testString, isMatch: false }];

  const segments = [];
  let lastIndex = 0;

  for (const match of matches) {
    if (match.index > lastIndex) {
      segments.push({ text: testString.slice(lastIndex, match.index), isMatch: false });
    }
    segments.push({ text: match.value, isMatch: true });
    lastIndex = match.end;
  }

  if (lastIndex < testString.length) {
    segments.push({ text: testString.slice(lastIndex), isMatch: false });
  }

  return segments;
};