import { useState } from 'react';
import { Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react';

interface HiddenInput {
    name: string;
    value: string;
    type: string;
    form: string;
}

export default function FormFinder() {
    const [inputs, setInputs] = useState<HiddenInput[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const findHiddenInputs = async () => {
        setLoading(true);
        setInputs([]);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) return;

            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const hiddenInputs = Array.from(document.querySelectorAll('input[type="hidden"]'));
                    const forms = Array.from(document.querySelectorAll('form'));

                    return hiddenInputs.map((input) => {
                        const el = input as HTMLInputElement;
                        const form = el.closest('form');
                        return {
                            name: el.name || el.id || '(unnamed)',
                            value: el.value || '',
                            type: 'hidden',
                            form: form?.id || form?.action || '(unnamed form)',
                        };
                    });
                },
            });

            setInputs(result[0]?.result || []);
        } catch (error) {
            console.error('Failed to find hidden inputs:', error);
        }

        setLoading(false);
    };

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const copyAll = () => {
        const text = inputs.map((i) => `${i.name}=${i.value}`).join('\n');
        navigator.clipboard.writeText(text);
        setCopied('all');
        setTimeout(() => setCopied(null), 2000);
    };

    // Identify potentially sensitive inputs
    const isSensitive = (name: string, value: string) => {
        const sensitivePatterns = ['token', 'csrf', 'nonce', 'secret', 'key', 'session', 'auth'];
        return sensitivePatterns.some((p) => name.toLowerCase().includes(p) || value.length > 32);
    };

    return (
        <div className="space-y-4">
            {/* Find Button */}
            <button
                onClick={findHiddenInputs}
                disabled={loading}
                className="w-full py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
            >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <EyeOff size={16} />}
                {loading ? 'Searching...' : 'Find Hidden Inputs'}
            </button>

            {/* Results */}
            {inputs.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{inputs.length} hidden inputs found</span>
                        <button
                            onClick={copyAll}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                        >
                            {copied === 'all' ? <Check size={10} className="text-cyber-400" /> : <Copy size={10} />}
                            Copy All
                        </button>
                    </div>

                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                        {inputs.map((input, idx) => (
                            <div
                                key={idx}
                                className={`p-2 bg-dark-800 border rounded-md group ${isSensitive(input.name, input.value)
                                        ? 'border-yellow-700/50'
                                        : 'border-dark-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-cyber-400">{input.name}</span>
                                            {isSensitive(input.name, input.value) && (
                                                <span className="px-1 py-0.5 text-[8px] bg-yellow-900/30 text-yellow-400 rounded">
                                                    Sensitive?
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-mono text-gray-400 truncate mt-0.5" title={input.value}>
                                            {input.value || '(empty)'}
                                        </p>
                                        <p className="text-[10px] text-gray-600 mt-0.5">Form: {input.form}</p>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(`${input.name}=${input.value}`, `input-${idx}`)}
                                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-dark-600 rounded transition-all"
                                    >
                                        {copied === `input-${idx}` ? <Check size={12} className="text-cyber-400" /> : <Copy size={12} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {inputs.length === 0 && !loading && (
                <div className="text-center py-8">
                    <EyeOff size={32} className="mx-auto text-gray-600 mb-2" />
                    <p className="text-xs text-gray-500">
                        Click to find hidden form inputs
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                        Useful for finding CSRF tokens, hidden parameters
                    </p>
                </div>
            )}
        </div>
    );
}
