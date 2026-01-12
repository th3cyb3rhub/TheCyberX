import { useState } from 'react';
import { MessageSquare, Copy, Check, RefreshCw, Code } from 'lucide-react';

interface ExtractedComment {
    type: 'html' | 'js';
    content: string;
    context: string;
}

export default function CommentFinder() {
    const [comments, setComments] = useState<ExtractedComment[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'html' | 'js'>('all');

    const findComments = async () => {
        setLoading(true);
        setComments([]);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) return;

            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const found: { type: string; content: string; context: string }[] = [];

                    // Find HTML comments
                    const walker = document.createTreeWalker(
                        document.documentElement,
                        NodeFilter.SHOW_COMMENT,
                        null
                    );

                    let node;
                    while ((node = walker.nextNode())) {
                        const content = node.textContent?.trim();
                        if (content && content.length > 2) {
                            found.push({
                                type: 'html',
                                content: content.substring(0, 500),
                                context: node.parentElement?.tagName || 'root',
                            });
                        }
                    }

                    // Find JS comments in inline scripts
                    const scripts = Array.from(document.querySelectorAll('script:not([src])'));
                    scripts.forEach((script) => {
                        const text = script.textContent || '';

                        // Single-line comments
                        const singleLine = text.match(/\/\/[^\n]+/g) || [];
                        singleLine.forEach((c) => {
                            if (c.length > 3) {
                                found.push({ type: 'js', content: c.substring(0, 200), context: 'inline script' });
                            }
                        });

                        // Multi-line comments
                        const multiLine = text.match(/\/\*[\s\S]*?\*\//g) || [];
                        multiLine.forEach((c) => {
                            if (c.length > 4 && !c.startsWith('/*!')) {
                                found.push({ type: 'js', content: c.substring(0, 200), context: 'inline script' });
                            }
                        });
                    });

                    return found;
                },
            });

            setComments(result[0]?.result || []);
        } catch (error) {
            console.error('Failed to find comments:', error);
        }

        setLoading(false);
    };

    const filteredComments = comments.filter((c) => filter === 'all' || c.type === filter);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const copyAll = () => {
        const text = filteredComments.map((c) => c.content).join('\n\n');
        navigator.clipboard.writeText(text);
        setCopied('all');
        setTimeout(() => setCopied(null), 2000);
    };

    // Detect potentially sensitive comments
    const isSensitive = (content: string) => {
        const patterns = ['todo', 'fixme', 'hack', 'bug', 'password', 'secret', 'api', 'key', 'token', 'debug', 'test', 'temp', 'admin'];
        return patterns.some((p) => content.toLowerCase().includes(p));
    };

    return (
        <div className="space-y-4">
            {/* Find Button */}
            <button
                onClick={findComments}
                disabled={loading}
                className="w-full py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
            >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                {loading ? 'Searching...' : 'Find Comments'}
            </button>

            {/* Filters */}
            {comments.length > 0 && (
                <div className="flex gap-1">
                    {(['all', 'html', 'js'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-2 py-1 text-[10px] rounded transition-colors ${filter === f ? 'bg-cyber-600 text-white' : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                                }`}
                        >
                            {f} ({f === 'all' ? comments.length : comments.filter((c) => c.type === f).length})
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
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                {filteredComments.length === 0 && !loading && (
                    <div className="text-center py-8">
                        <MessageSquare size={32} className="mx-auto text-gray-600 mb-2" />
                        <p className="text-xs text-gray-500">Find HTML and JavaScript comments</p>
                        <p className="text-[10px] text-gray-600 mt-1">May reveal developer notes, TODOs, debug info</p>
                    </div>
                )}
                {filteredComments.map((comment, idx) => (
                    <div
                        key={idx}
                        className={`p-2 bg-dark-800 border rounded-md group ${isSensitive(comment.content) ? 'border-yellow-700/50' : 'border-dark-700'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${comment.type === 'html' ? 'bg-orange-900/30 text-orange-400' : 'bg-yellow-900/30 text-yellow-400'
                                        }`}>
                                        {comment.type}
                                    </span>
                                    {isSensitive(comment.content) && (
                                        <span className="text-[8px] px-1.5 py-0.5 bg-red-900/30 text-red-400 rounded">
                                            Interesting!
                                        </span>
                                    )}
                                    <span className="text-[10px] text-gray-600">{comment.context}</span>
                                </div>
                                <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap break-all">
                                    {comment.content}
                                </pre>
                            </div>
                            <button
                                onClick={() => handleCopy(comment.content, `comment-${idx}`)}
                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-dark-600 rounded transition-all shrink-0"
                            >
                                {copied === `comment-${idx}` ? <Check size={12} className="text-cyber-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
