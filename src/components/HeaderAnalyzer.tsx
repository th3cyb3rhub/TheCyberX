import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface HeaderResult {
    name: string;
    value: string | null;
    status: 'good' | 'warning' | 'bad' | 'missing';
    description: string;
}

const analyzeHeader = (name: string, value: string | null): HeaderResult => {
    const analysis: Record<string, (v: string | null) => Omit<HeaderResult, 'name' | 'value'>> = {
        'content-security-policy': (v) => {
            if (!v) return { status: 'bad', description: 'CSP not set - XSS protection missing' };
            if (v.includes('unsafe-inline') || v.includes('unsafe-eval')) {
                return { status: 'warning', description: 'CSP contains unsafe directives' };
            }
            return { status: 'good', description: 'CSP is configured' };
        },
        'x-frame-options': (v) => {
            if (!v) return { status: 'bad', description: 'Clickjacking protection missing' };
            if (v.toUpperCase() === 'DENY' || v.toUpperCase() === 'SAMEORIGIN') {
                return { status: 'good', description: 'Clickjacking protected' };
            }
            return { status: 'warning', description: 'Check X-Frame-Options value' };
        },
        'x-content-type-options': (v) => {
            if (!v) return { status: 'bad', description: 'MIME sniffing not prevented' };
            if (v.toLowerCase() === 'nosniff') {
                return { status: 'good', description: 'MIME sniffing prevented' };
            }
            return { status: 'warning', description: 'Invalid value' };
        },
        'strict-transport-security': (v) => {
            if (!v) return { status: 'bad', description: 'HSTS not enabled' };
            if (v.includes('max-age')) {
                const maxAge = parseInt(v.match(/max-age=(\d+)/)?.[1] || '0');
                if (maxAge >= 31536000) return { status: 'good', description: 'HSTS enabled (1+ year)' };
                return { status: 'warning', description: 'HSTS max-age is low' };
            }
            return { status: 'warning', description: 'HSTS misconfigured' };
        },
        'x-xss-protection': (v) => {
            if (!v) return { status: 'missing', description: 'XSS filter header not set (deprecated)' };
            if (v === '0') return { status: 'good', description: 'Disabled (recommended)' };
            return { status: 'warning', description: 'Enabled (can be bypassed)' };
        },
        'referrer-policy': (v) => {
            if (!v) return { status: 'warning', description: 'Referrer policy not set' };
            const safe = ['no-referrer', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin'];
            if (safe.includes(v.toLowerCase())) {
                return { status: 'good', description: 'Safe referrer policy' };
            }
            return { status: 'warning', description: 'May leak referrer info' };
        },
        'permissions-policy': (v) => {
            if (!v) return { status: 'missing', description: 'Feature policy not set' };
            return { status: 'good', description: 'Permissions policy configured' };
        },
        'access-control-allow-origin': (v) => {
            if (!v) return { status: 'missing', description: 'CORS not configured' };
            if (v === '*') return { status: 'warning', description: 'Wildcard CORS - permissive' };
            return { status: 'good', description: 'CORS configured' };
        },
    };

    const analyzer = analysis[name.toLowerCase()];
    if (analyzer) {
        return { name, value, ...analyzer(value) };
    }
    return { name, value, status: 'missing', description: 'Unknown header' };
};

const HEADERS_TO_CHECK = [
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'strict-transport-security',
    'x-xss-protection',
    'referrer-policy',
    'permissions-policy',
    'access-control-allow-origin',
];

export default function HeaderAnalyzer() {
    const [url, setUrl] = useState('');
    const [results, setResults] = useState<HeaderResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const analyzeHeaders = async () => {
        if (!url) return;
        setLoading(true);
        setError('');
        setResults([]);

        try {
            const response = await fetch(url, { method: 'GET', mode: 'cors' });

            const headerResults: HeaderResult[] = HEADERS_TO_CHECK.map((header) => {
                const value = response.headers.get(header);
                return analyzeHeader(header, value);
            });

            setResults(headerResults);
        } catch (err) {
            setError('Failed to fetch headers. Try using the current page instead.');
        }

        setLoading(false);
    };

    const analyzeCurrentPage = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.url) {
                setUrl(tabs[0].url);
            }
        });
    };

    const getIcon = (status: HeaderResult['status']) => {
        switch (status) {
            case 'good': return <CheckCircle size={14} className="text-green-400" />;
            case 'warning': return <AlertTriangle size={14} className="text-yellow-400" />;
            case 'bad': return <XCircle size={14} className="text-red-400" />;
            default: return <Shield size={14} className="text-gray-500" />;
        }
    };

    const getScore = () => {
        if (results.length === 0) return 0;
        const good = results.filter((r) => r.status === 'good').length;
        return Math.round((good / results.length) * 100);
    };

    return (
        <div className="space-y-4">
            {/* URL Input */}
            <div>
                <label className="block text-xs text-gray-400 mb-1">Target URL</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500"
                    />
                    <button
                        onClick={analyzeCurrentPage}
                        className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                        title="Use current page"
                    >
                        Current
                    </button>
                </div>
            </div>

            {/* Analyze Button */}
            <button
                onClick={analyzeHeaders}
                disabled={!url || loading}
                className="w-full py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
            >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
                {loading ? 'Analyzing...' : 'Analyze Headers'}
            </button>

            {error && (
                <div className="p-2 bg-red-900/20 border border-red-800 rounded-md text-xs text-red-400">
                    {error}
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-3">
                    {/* Score */}
                    <div className="flex items-center justify-between p-2 bg-dark-800 border border-dark-700 rounded-md">
                        <span className="text-xs text-gray-400">Security Score</span>
                        <span className={`text-lg font-bold ${getScore() >= 70 ? 'text-green-400' : getScore() >= 40 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                            {getScore()}%
                        </span>
                    </div>

                    {/* Header List */}
                    <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                        {results.map((result) => (
                            <div
                                key={result.name}
                                className="p-2 bg-dark-800 border border-dark-700 rounded-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-1.5">
                                        {getIcon(result.status)}
                                        <span className="text-xs font-medium text-gray-300">{result.name}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">{result.description}</p>
                                {result.value && (
                                    <p className="text-[10px] font-mono text-cyber-400 mt-1 truncate" title={result.value}>
                                        {result.value.substring(0, 60)}{result.value.length > 60 ? '...' : ''}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
