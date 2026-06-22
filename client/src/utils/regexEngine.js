/**
 * Executes a regex match with a timeout to catch catastrophic backtracking.
 * Uses a Web Worker pattern concept — for simplicity we use a sync timeout flag.
 */
export const safeRegexTest = (pattern, flags, testString, timeoutMs = 2000) => {
  return new Promise((resolve) => {
    try {
      new RegExp(pattern, flags);
    } catch (e) {
      return resolve({ error: `Invalid regex: ${e.message}`, matches: [], isTimeout: false });
    }

    const workerCode = `
      self.onmessage = function(e) {
        const { pattern, flags, testString } = e.data;
        try {
          const regex = new RegExp(pattern, flags);
          regex.lastIndex = 0;
          const matches = [];
          if (flags.includes('g')) {
            let match;
            while ((match = regex.exec(testString)) !== null) {
              matches.push({
                value: match[0],
                index: match.index,
                end: match.index + match[0].length,
                groups: match.slice(1),
                namedGroups: match.groups || {},
              });
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
          self.postMessage({ error: null, matches, isTimeout: false });
        } catch (err) {
          self.postMessage({ error: err.message, matches: [], isTimeout: false });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    const timeoutId = setTimeout(() => {
      worker.terminate();
      resolve({
        error: `⚠️ Execution timed out after ${timeoutMs}ms. This pattern may be vulnerable to ReDoS.`,
        matches: [],
        isTimeout: true,
      });
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timeoutId);
      worker.terminate();
      resolve(e.data);
    };

    worker.onerror = (err) => {
      clearTimeout(timeoutId);
      worker.terminate();
      resolve({ error: err.message, matches: [], isTimeout: false });
    };

    worker.postMessage({ pattern, flags, testString });
  });
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