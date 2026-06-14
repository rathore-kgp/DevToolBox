import { useState, useCallback } from 'react';

export const useJsonTool = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(null);

  const parseJSON = useCallback((raw) => {
    try {
      const parsed = JSON.parse(raw);
      setError(null);
      setIsValid(true);
      return parsed;
    } catch (e) {
      // Parse error message to extract line/column if available
      setError(e.message);
      setIsValid(false);
      return null;
    }
  }, []);

  const formatJSON = useCallback((raw, indent = 2) => {
    const parsed = parseJSON(raw);
    if (parsed !== null) {
      setOutput(JSON.stringify(parsed, null, indent));
    }
  }, [parseJSON]);

  const minifyJSON = useCallback((raw) => {
    const parsed = parseJSON(raw);
    if (parsed !== null) {
      setOutput(JSON.stringify(parsed));
    }
  }, [parseJSON]);

  return { input, setInput, output, error, isValid, formatJSON, minifyJSON, parseJSON };
};