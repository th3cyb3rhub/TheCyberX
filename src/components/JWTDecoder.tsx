import { useState } from 'react';
import { Copy, Check, AlertTriangle, CheckCircle } from 'lucide-react';

interface JWTPayload {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string;
    isValid: boolean;
    error?: string;
}

function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return {
                header: {},
                payload: {},
                signature: '',
                isValid: false,
                error: 'Invalid JWT format. Expected 3 parts separated by dots.',
            };
        }

        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const signature = parts[2];

        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp && payload.exp < now;
        const isNotYetValid = payload.nbf && payload.nbf > now;

        return {
            header,
            payload,
            signature,
            isValid: !isExpired && !isNotYetValid,
            error: isExpired ? 'Token is expired' : isNotYetValid ? 'Token is not yet valid' : undefined,
        };
    } catch (error) {
        return {
            header: {},
            payload: {},
            signature: '',
            isValid: false,
            error: 'Failed to decode JWT. Make sure it\'s a valid token.',
        };
    }
}

function formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
}

export default function JWTDecoder() {
    const [token, setToken] = useState('');
    const [decoded, setDecoded] = useState<JWTPayload | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const handleDecode = () => {
        if (!token.trim()) return;
        setDecoded(decodeJWT(token.trim()));
    };

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const renderPayloadValue = (key: string, value: unknown): string => {
        if ((key === 'exp' || key === 'iat' || key === 'nbf') && typeof value === 'number') {
            return `${value} (${formatTimestamp(value)})`;
        }
        return JSON.stringify(value);
    };

    return (
        <div className="space-y-4">
            {/* Input */}
            <div>
                <label className="block text-xs text-gray-400 mb-1">JWT Token</label>
                <textarea
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
                    className="w-full h-20 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500 resize-none font-mono text-xs"
                />
            </div>

            {/* Decode Button */}
            <button
                onClick={handleDecode}
                disabled={!token.trim()}
                className="w-full py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md transition-colors"
            >
                Decode JWT
            </button>

            {/* Results */}
            {decoded && (
                <div className="space-y-3">
                    {/* Status */}
                    <div className={`flex items-center gap-2 p-2 rounded-md text-xs ${decoded.isValid
                            ? 'bg-green-900/30 text-green-400 border border-green-800'
                            : 'bg-red-900/30 text-red-400 border border-red-800'
                        }`}>
                        {decoded.isValid ? (
                            <><CheckCircle size={14} /> Token is valid</>
                        ) : (
                            <><AlertTriangle size={14} /> {decoded.error || 'Token is invalid'}</>
                        )}
                    </div>

                    {/* Header */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-400">Header</label>
                            <button
                                onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), 'header')}
                                className="p-1 hover:bg-dark-700 rounded transition-colors"
                            >
                                {copied === 'header' ? <Check size={12} className="text-cyber-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <pre className="p-2 bg-dark-800 border border-dark-600 rounded-md text-xs font-mono overflow-x-auto text-blue-400">
                            {JSON.stringify(decoded.header, null, 2)}
                        </pre>
                    </div>

                    {/* Payload */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-400">Payload</label>
                            <button
                                onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), 'payload')}
                                className="p-1 hover:bg-dark-700 rounded transition-colors"
                            >
                                {copied === 'payload' ? <Check size={12} className="text-cyber-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <div className="p-2 bg-dark-800 border border-dark-600 rounded-md text-xs font-mono space-y-1">
                            {Object.entries(decoded.payload).map(([key, value]) => (
                                <div key={key} className="flex">
                                    <span className="text-purple-400">{key}:</span>
                                    <span className="ml-2 text-green-400 break-all">{renderPayloadValue(key, value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Signature */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Signature</label>
                        <div className="p-2 bg-dark-800 border border-dark-600 rounded-md text-xs font-mono text-orange-400 break-all">
                            {decoded.signature}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
