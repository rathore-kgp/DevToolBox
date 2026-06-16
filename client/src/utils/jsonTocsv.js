// src/utils/jsonTocsv.js

/**
 * Flattens a nested object into dot-notation keys.
 * { user: { name: "Alice", age: 25 } } → { "user.name": "Alice", "user.age": 25 }
 */
const flattenObject = (obj, prefix = '', result = {}) => {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, fullKey, result);
    } else if (Array.isArray(value)) {
      // Arrays: convert to JSON string (arrays-of-objects too complex for flat CSV)
      result[fullKey] = JSON.stringify(value);
    } else {
      result[fullKey] = value ?? ''; // Null/undefined → empty string
    }
  }
  return result;
};

/**
 * Converts a JSON array of objects to a CSV string.
 * @param {Array} jsonData - Must be an array of objects
 * @returns {string} CSV string
 */
export const jsonToCSV = (jsonData) => {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error('Input must be a non-empty JSON array of objects.');
  }

  if (typeof jsonData[0] !== 'object' || jsonData[0] === null) {
    throw new Error('Array elements must be objects.');
  }

  // Flatten each row
  const flatRows = jsonData.map(row => flattenObject(row));
  
  // Collect all unique headers across all rows (handles sparse data)
  const headers = [...new Set(flatRows.flatMap(row => Object.keys(row)))];

  // Build CSV
  const escapeCSVValue = (val) => {
    const str = String(val ?? '');
    // Wrap in quotes if contains comma, newline, or quote
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = flatRows.map(row => 
    headers.map(header => escapeCSVValue(row[header])).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (csvString, filename = 'export.csv') => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Free memory
};