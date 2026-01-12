import { useState } from 'react';
import { Search, Copy, Check, Info } from 'lucide-react';

export default function RegexTester() {
    const [pattern, setPattern] = useState('');
    const [flags, setFlags] = useState('g');
    const [testString, setTestString] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const getMatches = () => {
        if (!pattern || !testString) return [];
        try {
            setError('');
            const regex = new RegExp(pattern, flags);
            const matches: { match: string; index: number; groups?: Record<string, string> }[] = [];

            if (flags.includes('g')) {
                let match;
                while ((match = regex.exec(testString)) !== null) {
                    matches.push({
                        match: match[0],
                        index: match.index,
                        groups: match.groups,
                    });
                    if (!flags.includes('g')) break;
                }
            } else {
                const match = regex.exec(testString);
                if (match) {
                    matches.push({
                        match: match[0],
                        index: match.index,
                        groups: match.groups,
                    });
                }
            }

            return matches;
        } catch (e) {
            setError((e as Error).message);
            return [];
        }
    };

    const highlightMatches = () => {
        if (!pattern || !testString) return testString;
        try {
            const regex = new RegExp(pattern, flags);
            return testString.replace(regex, '<mark class="bg-cyber-600/50 text-white px-0.5 rounded">$&</mark>');
        } catch {
            return testString;
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`/${pattern}/${flags}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const matches = getMatches();

    const quickPatterns = [
        { label: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
        { label: 'IP', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}' },
        { label: 'URL', pattern: 'https?://[\\w.-]+(?:/[\\w./-]*)?' },
        { label: 'Phone', pattern: '\\+?\\d{1,4}[-.\\s]?\\(?\\d{1,3}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}' },
    ];

    return (
        <div className="space-y-4">
            {/* Pattern Input */}
            <div>
                <label className="block text-xs text-gray-400 mb-1">Pattern</label>
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center bg-dark-800 border border-dark-600 rounded-md overflow-hidden focus-within:border-cyber-500">
                        <span className="px-2 text-gray-500">/</span>
                        <input
                            type="text"
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                            placeholder="Enter regex pattern..."
                            className="flex-1 py-2 bg-transparent text-sm focus:outline-none font-mono"
                        />
                        <span className="px-1 text-gray-500">/</span>
                        <input
                            type="text"
                            value={flags}
                            onChange={(e) => setFlags(e.target.value)}
                            className="w-12 py-2 bg-transparent text-sm focus:outline-none text-center font-mono"
                            placeholder="gi"
                        />
                    </div>
                    <button
                        onClick={handleCopy}
                        className="px-2 bg-dark-700 hover:bg-dark-600 rounded-md transition-colors"
                    >
                        {copied ? <Check size={16} className="text-cyber-400" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            {/* Quick Patterns */}
            <div className="flex flex-wrap gap-1">
                {quickPatterns.map((qp) => (
                    <button
                        key={qp.label}
                        onClick={() => setPattern(qp.pattern)}
                        className="px-2 py-1 text-[10px] bg-dark-800 hover:bg-dark-700 rounded transition-colors"
                    >
                        {qp.label}
                    </button>
                ))}
            </div>

            {/* Test String */}
            <div>
                <label className="block text-xs text-gray-400 mb-1">Test String</label>
                <textarea
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder="Enter text to test against..."
                    className="w-full h-20 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500 resize-none"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="p-2 bg-red-900/20 border border-red-800 rounded-md text-xs text-red-400">
                    {error}
                </div>
            )}

            {/* Highlighted Result */}
            {pattern && testString && !error && (
                <div>
                    <label className="block text-xs text-gray-400 mb-1">
                        Highlighted ({matches.length} match{matches.length !== 1 ? 'es' : ''})
                    </label>
                    <div
                        className="p-3 bg-dark-800 border border-dark-600 rounded-md text-sm font-mono break-all"
                        dangerouslySetInnerHTML={{ __html: highlightMatches() }}
                    />
                </div>
            )}

            {/* Matches List */}
            {matches.length > 0 && (
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Matches</label>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                        {matches.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-dark-800 rounded text-xs">
                                <span className="text-gray-500">@{m.index}</span>
                                <span className="font-mono text-cyber-400">{m.match}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
