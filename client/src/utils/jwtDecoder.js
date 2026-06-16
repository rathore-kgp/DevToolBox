/**
 * Decodes a JWT without verifying its signature.
 * This is safe — anyone can decode a JWT; the signature is what proves authenticity.
 */
export const decodeJWT = (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token: must be a non-empty string');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: must have exactly 3 parts (header.payload.signature)');
  }

  const [headerB64, payloadB64, signature] = parts;

  const base64UrlDecode = (str) => {
    // Base64url uses - instead of + and _ instead of /
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad to multiple of 4
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    try {
      return JSON.parse(atob(padded));
    } catch {
      throw new Error('Failed to decode token segment — token may be malformed');
    }
  };

  const header = base64UrlDecode(headerB64);
  const payload = base64UrlDecode(payloadB64);

  // Analyze expiry
  const now = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp ? payload.exp < now : null;
  const expiresIn = payload.exp ? payload.exp - now : null;
  const issuedAt = payload.iat ? new Date(payload.iat * 1000).toISOString() : null;
  const expiresAt = payload.exp ? new Date(payload.exp * 1000).toISOString() : null;

  return {
    header,
    payload,
    signature,
    isExpired,
    expiresIn,
    issuedAt,
    expiresAt,
  };
};