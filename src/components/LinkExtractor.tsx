import { useState } from 'react';
import { Link, Copy, Check, RefreshCw, ExternalLink, Filter } from 'lucide-react';

interface ExtractedLink {
    href: string;
    text: string;
    type: 'internal' | 'external' | 'anchor' | 'js' | 'mailto' | 'tel';
}

export default function LinkExtractor() {
    const [links, setLinks] = useState<ExtractedLink[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<string>('all');
    const [copied, setCopied] = useState<string | null>(null);

    const extractLinks = async () => {
        setLoading(true);
        setLinks([]);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id || !tab?.url) return;

            const currentHost = new URL(tab.url).hostname;

            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (hostname) => {
                    const anchors = Array.from(document.querySelectorAll('a[href]'));
                    return anchors.map((a) => {
                        const el = a as HTMLAnchorElement;
                        const href = el.href;
                        let type = 'internal';

                        if (href.startsWith('javascript:')) type = 'js';
                        else if (href.startsWith('mailto:')) type = 'mailto';
                        else if (href.startsWith('tel:')) type = 'tel';
                        else if (href.startsWith('#')) type = 'anchor';
                        else {
                            try {
                                const linkHost = new URL(href).hostname;
                                if (linkHost !== hostname) type = 'external';
                            } catch { }
                        }

                        return {
                            href,
                            text: el.textContent?.trim().substring(0, 50) || '',
                            type,
                        };
                    });
                },
                args: [currentHost],
            });

            const extracted = result[0]?.result || [];
            // Deduplicate by href
            const unique = extracted.filter((l: ExtractedLink, i: number, arr: ExtractedLink[]) =>
                arr.findIndex((x: ExtractedLink) => x.href === l.href) === i
            );
            setLinks(unique);
        } catch (error) {
            console.error('Failed to extract links:', error);
        }

        setLoading(false);
    };

    const filteredLinks = links.filter((l) => filter === 'all' || l.type === filter);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const copyAll = () => {
        const text = filteredLinks.map((l) => l.href).join('\n');
        navigator.clipboard.writeText(text);
        setCopied('all');
        setTimeout(() => setCopied(null), 2000);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'internal': return 'bg-green-900/30 text-green-400';
            case 'external': return 'bg-blue-900/30 text-blue-400';
            case 'js': return 'bg-yellow-900/30 text-yellow-400';
            case 'mailto': return 'bg-purple-900/30 text-purple-400';
            case 'anchor': return 'bg-gray-900/30 text-gray-400';
            default: return 'bg-dark-700 text-gray-400';
        }
    };

    const counts = {
        all: links.length,
        internal: links.filter((l) => l.type === 'internal').length,
        external: links.filter((l) => l.type === 'external').length,
        js: links.filter((l) => l.type === 'js').length,
    };

    return (
        <div className="space-y-4">
            {/* Extract Button */}
            <button
                onClick={extractLinks}
                disabled={loading}
                className="w-full py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
            >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Link size={16} />}
                {loading ? 'Extracting...' : 'Extract Links'}
            </button>

            {/* Filters */}
            {links.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                    {['all', 'internal', 'external', 'js'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-2 py-1 text-[10px] rounded transition-colors ${filter === f ? 'bg-cyber-600 text-white' : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                                }`}
                        >
                            {f} ({counts[f as keyof typeof counts]})
                        </button>
                    ))}
                    <button
                        onClick={copyAll}
                        className="ml-auto px-2 py-1 text-[10px] bg-dark-700 hover:bg-dark-600 rounded flex items-center gap-1"
                    >
                        {copied === 'all' ? <Check size={10} className="text-cyber-400" /> : <Copy size={10} />}
                        Copy
                    </button>
                </div>
            )}

            {/* Results */}
            <div className="space-y-1 max-h-[280px] overflow-y-auto">
                {filteredLinks.length === 0 && !loading && (
                    <p className="text-center text-xs text-gray-500 py-4">
                        Click Extract to find all links on the page
                    </p>
                )}
                {filteredLinks.map((link, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between px-2 py-1.5 bg-dark-800 border border-dark-700 rounded group hover:border-dark-600"
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded shrink-0 ${getTypeColor(link.type)}`}>
                                {link.type}
                            </span>
                            <span className="text-[10px] font-mono text-gray-300 truncate">{link.href}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleCopy(link.href, `link-${idx}`)}
                                className="p-1 hover:bg-dark-600 rounded"
                            >
                                {copied === `link-${idx}` ? <Check size={10} className="text-cyber-400" /> : <Copy size={10} />}
                            </button>
                            <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-dark-600 rounded"
                            >
                                <ExternalLink size={10} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
