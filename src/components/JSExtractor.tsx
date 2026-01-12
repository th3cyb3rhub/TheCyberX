import { useState } from 'react';
import { FileCode, Copy, Check, RefreshCw, ExternalLink } from 'lucide-react';

interface Endpoint {
    method: string;
    path: string;
    source: string;
}

export default function JSExtractor() {
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [scripts, setScripts] = useState<string[]>([]);
    const [copied, setCopied] = useState<string | null>(null);

    const extractEndpoints = async () => {
        setLoading(true);
        setEndpoints([]);
        setScripts([]);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) return;

            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const scripts = Array.from(document.querySelectorAll('script[src]'))
                        .map((s) => (s as HTMLScriptElement).src);

                    const inlineScripts = Array.from(document.querySelectorAll('script:not([src])'))
                        .map((s) => s.textContent || '');

                    return { scripts, inlineScripts };
                },
            });

            const { scripts: externalScripts, inlineScripts } = result[0]?.result || { scripts: [], inlineScripts: [] };
            setScripts(externalScripts);

            const foundEndpoints: Endpoint[] = [];

            // Patterns to find endpoints
            const patterns = [
                /['"`](\/api\/[^'"`\s]+)['"`]/g,
                /['"`](\/v\d+\/[^'"`\s]+)['"`]/g,
                /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,
                /axios\.[a-z]+\s*\(\s*['"`]([^'"`]+)['"`]/g,
                /\.get\s*\(\s*['"`]([^'"`]+)['"`]/g,
                /\.post\s*\(\s*['"`]([^'"`]+)['"`]/g,
                /\.put\s*\(\s*['"`]([^'"`]+)['"`]/g,
                /\.delete\s*\(\s*['"`]([^'"`]+)['"`]/g,
                /url:\s*['"`]([^'"`]+)['"`]/g,
                /endpoint:\s*['"`]([^'"`]+)['"`]/g,
            ];

            // Extract from inline scripts
            inlineScripts.forEach((script: string) => {
                patterns.forEach((pattern) => {
                    let match;
                    while ((match = pattern.exec(script)) !== null) {
                        const path = match[1];
                        if (path && !path.includes('${') && path.length < 200) {
                            foundEndpoints.push({
                                method: pattern.source.includes('post') ? 'POST' :
                                    pattern.source.includes('put') ? 'PUT' :
                                        pattern.source.includes('delete') ? 'DELETE' : 'GET',
                                path,
                                source: 'inline',
                            });
                        }
                    }
                });
            });

            // Deduplicate
            const unique = foundEndpoints.filter((e, i, arr) =>
                arr.findIndex((x) => x.path === e.path) === i
            );

            setEndpoints(unique);
        } catch (error) {
            console.error('Failed to extract endpoints:', error);
        }

        setLoading(false);
    };

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const copyAll = () => {
        const text = endpoints.map((e) => e.path).join('\n');
        navigator.clipboard.writeText(text);
        setCopied('all');
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-4">
            {/* Extract Button */}
            <button
                onClick={extractEndpoints}
                disabled={loading}
                className="w-full py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
            >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <FileCode size={16} />}
                {loading ? 'Extracting...' : 'Extract Endpoints'}
            </button>

            {/* Scripts Found */}
            {scripts.length > 0 && (
                <div className="p-2 bg-dark-800 border border-dark-700 rounded-md">
                    <p className="text-[10px] text-gray-500 mb-1">External Scripts Found: {scripts.length}</p>
                    <div className="max-h-16 overflow-y-auto">
                        {scripts.slice(0, 5).map((s, i) => (
                            <p key={i} className="text-[10px] font-mono text-gray-400 truncate">{s}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            {endpoints.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{endpoints.length} endpoints found</span>
                        <button
                            onClick={copyAll}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                        >
                            {copied === 'all' ? <Check size={10} className="text-cyber-400" /> : <Copy size={10} />}
                            Copy All
                        </button>
                    </div>

                    <div className="space-y-1 max-h-[260px] overflow-y-auto">
                        {endpoints.map((endpoint, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between px-2 py-1.5 bg-dark-800 border border-dark-700 rounded group hover:border-dark-600"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${endpoint.method === 'POST' ? 'bg-yellow-900/30 text-yellow-400' :
                                            endpoint.method === 'PUT' ? 'bg-blue-900/30 text-blue-400' :
                                                endpoint.method === 'DELETE' ? 'bg-red-900/30 text-red-400' :
                                                    'bg-green-900/30 text-green-400'
                                        }`}>
                                        {endpoint.method}
                                    </span>
                                    <span className="text-xs font-mono text-gray-300 truncate">{endpoint.path}</span>
                                </div>
                                <button
                                    onClick={() => handleCopy(endpoint.path, `ep-${idx}`)}
                                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-dark-600 rounded transition-all"
                                >
                                    {copied === `ep-${idx}` ? <Check size={10} className="text-cyber-400" /> : <Copy size={10} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {endpoints.length === 0 && !loading && (
                <p className="text-center text-xs text-gray-500 py-4">
                    Click Extract to find API endpoints in page scripts
                </p>
            )}
        </div>
    );
}
