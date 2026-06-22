// Text encode/decode
export const encodeBase64 = (str) => {
  try {
    // btoa only handles ASCII — use TextEncoder for full Unicode support
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, byte => String.fromCodePoint(byte)).join('');
    return btoa(binString);
  } catch (e) {
    throw new Error('Encoding failed: ' + e.message);
  }
};

export const decodeBase64 = (str) => {
  try {
    const binString = atob(str);
    const bytes = Uint8Array.from(binString, char => char.codePointAt(0));
    return new TextDecoder().decode(bytes);
  } catch (e) {
    throw new Error('Invalid Base64 string.');
  }
};

// File encode to Base64 (returns a Promise)
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:image/png;base64,ABC123..." — we extract just the data part
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};