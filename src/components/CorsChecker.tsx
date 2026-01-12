import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface CorsResult {
    origin: string;
    allowed: boolean;
    credentials: boolean;
    methods: string;
    headers: string;
    error?: string;
}

export default function CorsChecker() {
    const [url, setUrl] = useState('');
    const [testOrigin, setTestOrigin] = useState('https://evil.com');
    const [result, setResult] = useState<CorsResult | null>(null);
    const [loading, setLoading] = useState(false);

    const checkCors = async () => {
        if (!url) return;
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(url, {
                method: 'OPTIONS',
                headers: {
                    'Origin': testOrigin,
                    'Access-Control-Request-Method': 'GET',
                },
                mode: 'cors',
            });

            const corsResult: CorsResult = {
                origin: response.headers.get('Access-Control-Allow-Origin') || 'Not set',
                allowed: response.headers.get('Access-Control-Allow-Origin') !== null,
                credentials: response.headers.get('Access-Control-Allow-Credentials') === 'true',
                methods: response.headers.get('Access-Control-Allow-Methods') || 'Not set',
                headers: response.headers.get('Access-Control-Allow-Headers') || 'Not set',
            };

            setResult(corsResult);
        } catch (error) {
            setResult({
                origin: 'N/A',
                allowed: false,
                credentials: false,
                methods: 'N/A',
                headers: 'N/A',
                error: 'CORS request blocked or network error',
            });
        }

        setLoading(false);
    };

    const getOriginStatus = () => {
        if (!result) return null;

        if (result.origin === '*') {
            return { icon: <AlertTriangle size={14} />, color: 'text-yellow-400', text: 'Wildcard (*) - Permissive' };
        }
        if (result.origin === testOrigin) {
            return { icon: <XCircle size={14} />, color: 'text-red-400', text: 'Origin Reflected - Vulnerable!' };
        }
        if (result.origin === 'null') {
            return { icon: <AlertTriangle size={14} />, color: 'text-orange-400', text: 'Null Origin Allowed' };
        }
        if (result.allowed) {
            return { icon: <CheckCircle size={14} />, color: 'text-green-400', text: 'Specific Origin Allowed' };
        }
        return { icon: <Shield size={14} />, color: 'text-gray-400', text: 'CORS Not Configured' };
    };

    const status = getOriginStatus();

    return (
        <div className="space-y-4">
            {/* URL Input */}
            <div>
                <label className="block text-xs text-gray-400 mb-1">Target URL</label>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/api/endpoint"
                    className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500"
                />
            </div>

            {/* Test Origin */}
            <div>
                <label className="block text-xs text-gray-400 mb-1">Test Origin</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={testOrigin}
                        onChange={(e) => setTestOrigin(e.target.value)}
                        placeholder="https://evil.com"
                        className="flex-1 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500"
                    />
                    <button
                        onClick={() => setTestOrigin('null')}
                        className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                    >
                        null
                    </button>
                </div>
            </div>

            {/* Check Button */}
            <button
                onClick={checkCors}
                disabled={!url || loading}
                className="w-full py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
            >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
                {loading ? 'Checking...' : 'Check CORS'}
            </button>

            {/* Results */}
            {result && (
                <div className="space-y-3">
                    {/* Status */}
                    {status && (
                        <div className={`flex items-center gap-2 p-2 rounded-md text-xs ${status.color} bg-dark-800 border border-dark-700`}>
                            {status.icon}
                            {status.text}
                        </div>
                    )}

                    {result.error ? (
                        <div className="p-2 bg-red-900/20 border border-red-800 rounded-md text-xs text-red-400">
                            {result.error}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="p-2 bg-dark-800 border border-dark-700 rounded-md">
                                <p className="text-[10px] text-gray-500">Access-Control-Allow-Origin</p>
                                <p className="text-xs font-mono text-cyber-300">{result.origin}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-dark-800 border border-dark-700 rounded-md">
                                    <p className="text-[10px] text-gray-500">Credentials</p>
                                    <p className={`text-xs font-mono ${result.credentials ? 'text-red-400' : 'text-green-400'}`}>
                                        {result.credentials ? 'true ⚠️' : 'false'}
                                    </p>
                                </div>
                                <div className="p-2 bg-dark-800 border border-dark-700 rounded-md">
                                    <p className="text-[10px] text-gray-500">Methods</p>
                                    <p className="text-xs font-mono text-gray-300 truncate">{result.methods}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vulnerability Check */}
                    {result.origin === testOrigin && result.credentials && (
                        <div className="p-2 bg-red-900/30 border border-red-700 rounded-md">
                            <p className="text-xs text-red-400 font-medium">🚨 Critical Vulnerability!</p>
                            <p className="text-[10px] text-red-300 mt-1">
                                Origin is reflected AND credentials are allowed. This allows full CORS bypass with cookie theft.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
