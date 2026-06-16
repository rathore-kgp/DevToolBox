import { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { decodeJWT } from '../../utils/jwtDecoder';
import axiosInstance from '../../services/axiosInstance';

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const JSONDisplay = ({ data }) => (
  <pre className="bg-gray-50 dark:bg-dark-bg p-4 rounded-lg font-mono text-sm overflow-auto whitespace-pre-wrap">
    {JSON.stringify(data, null, 2)}
  </pre>
);

const JwtToolPage = () => {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [decodeError, setDecodeError] = useState(null);

  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState('HS256');
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDecode = () => {
    setDecodeError(null);
    setDecoded(null);
    try {
      const result = decodeJWT(token);
      setDecoded(result);
    } catch (e) {
      setDecodeError(e.message);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const { data } = await axiosInstance.post('/tools/jwt/verify', {
        token, secret, algorithm
      });
      setVerifyResult(data);
    } catch (e) {
      setVerifyResult({ valid: false, message: e.response?.data?.error || 'Request failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <ToolLayout title="JWT Decoder + Verifier" description="Decode JWT payloads client-side or verify signatures server-side.">
      <div className="space-y-4">
        {/* Token Input */}
        <div className="card space-y-3">
          <label className="font-semibold text-sm">JWT Token</label>
          <textarea
            value={token}
            onChange={e => { setToken(e.target.value); setDecoded(null); setVerifyResult(null); }}
            className="input-field font-mono text-sm h-28 resize-none"
            placeholder="Paste your JWT here..."
          />
          <div className="flex gap-2">
            <button onClick={handleDecode} className="btn-primary text-sm">Decode (Client-Side)</button>
            <button onClick={() => setToken(SAMPLE_JWT)} className="btn-primary text-sm bg-gray-500 hover:bg-gray-600">Load Sample</button>
          </div>
          {decodeError && <p className="text-red-500 text-sm font-mono">{decodeError}</p>}
        </div>

        {decoded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-pink-500">Header</h3>
                <span className="text-xs bg-gray-100 dark:bg-dark-bg px-2 py-0.5 rounded font-mono">{decoded.header.alg}</span>
              </div>
              <JSONDisplay data={decoded.header} />
            </div>
            <div className="card space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-purple-500">Payload</h3>
                {decoded.isExpired !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    decoded.isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {decoded.isExpired ? 'EXPIRED' : `Valid for ${Math.floor(decoded.expiresIn / 60)}m`}
                  </span>
                )}
              </div>
              <JSONDisplay data={decoded.payload} />
              {decoded.expiresAt && (
                <p className="text-xs text-gray-500">Expires: {decoded.expiresAt}</p>
              )}
            </div>
            <div className="card space-y-2">
              <h3 className="font-semibold text-sm text-cyan-500">Signature</h3>
              <p className="font-mono text-xs break-all text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg p-3 rounded">
                {decoded.signature}
              </p>
              <p className="text-xs text-gray-500">Signature verification requires the secret (see below)</p>
            </div>
          </div>
        )}

        {/* Signature Verification */}
        <div className="card space-y-3">
          <h3 className="font-semibold text-sm">Signature Verification (Server-Side)</h3>
          <p className="text-xs text-gray-500">Your secret is sent to our backend over HTTPS and never logged or stored.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="Enter JWT secret..."
              />
            </div>
            <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} className="input-field">
              {['HS256', 'HS384', 'HS512'].map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <button onClick={handleVerify} disabled={isVerifying || !token || !secret} className="btn-primary text-sm w-fit">
            {isVerifying ? 'Verifying...' : 'Verify Signature'}
          </button>

          {verifyResult && (
            <div className={`p-4 rounded-lg border ${
              verifyResult.valid
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            }`}>
              <p className="font-semibold">{verifyResult.valid ? '✓ Signature Valid' : '✗ Signature Invalid'}</p>
              <p className="text-sm mt-1">{verifyResult.message}</p>
              {verifyResult.valid && verifyResult.decoded && (
                <JSONDisplay data={verifyResult.decoded} />
              )}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JwtToolPage;