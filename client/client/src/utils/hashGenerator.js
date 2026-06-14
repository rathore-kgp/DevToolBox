// Web Crypto API is available in all modern browsers — no library needed
const ALGORITHMS = {
  'SHA-1': 'SHA-1',
  'SHA-256': 'SHA-256',
  'SHA-384': 'SHA-384',
  'SHA-512': 'SHA-512',
};

export const generateHash = async (text, algorithm = 'SHA-256') => {
  if (!ALGORITHMS[algorithm]) {
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // crypto.subtle.digest is asynchronous — it uses native browser crypto
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexString = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
  return hexString;
};

// UUID v4 using cryptographically secure random values
export const generateUUID = () => {
  // crypto.randomUUID() is available in modern browsers and Node.js 14.17+
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Polyfill for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15);
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};