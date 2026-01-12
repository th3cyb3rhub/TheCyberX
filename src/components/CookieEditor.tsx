import { useState, useEffect } from 'react';
import { Cookie, Trash2, Plus, Copy, Check, RefreshCw, Download } from 'lucide-react';

interface CookieData {
    name: string;
    value: string;
    domain: string;
    path: string;
    secure: boolean;
    httpOnly: boolean;
    sameSite: string;
    expirationDate?: number;
}

export default function CookieEditor() {
    const [cookies, setCookies] = useState<CookieData[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUrl, setCurrentUrl] = useState('');
    const [editingCookie, setEditingCookie] = useState<CookieData | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newCookie, setNewCookie] = useState({ name: '', value: '' });

    const loadCookies = async () => {
        setLoading(true);
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]?.url) {
                setCurrentUrl(tabs[0].url);
                const url = new URL(tabs[0].url);
                const allCookies = await chrome.cookies.getAll({ domain: url.hostname });
                setCookies(allCookies.map((c) => ({
                    name: c.name,
                    value: c.value,
                    domain: c.domain,
                    path: c.path,
                    secure: c.secure,
                    httpOnly: c.httpOnly,
                    sameSite: c.sameSite || 'unspecified',
                    expirationDate: c.expirationDate,
                })));
            }
        } catch (error) {
            console.error('Failed to load cookies:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCookies();
    }, []);

    const deleteCookie = async (cookie: CookieData) => {
        try {
            const url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
            await chrome.cookies.remove({ url, name: cookie.name });
            loadCookies();
        } catch (error) {
            console.error('Failed to delete cookie:', error);
        }
    };

    const addCookie = async () => {
        if (!newCookie.name || !newCookie.value) return;
        try {
            const url = new URL(currentUrl);
            await chrome.cookies.set({
                url: currentUrl,
                name: newCookie.name,
                value: newCookie.value,
                domain: url.hostname,
                path: '/',
            });
            setNewCookie({ name: '', value: '' });
            setShowAdd(false);
            loadCookies();
        } catch (error) {
            console.error('Failed to add cookie:', error);
        }
    };

    const copyValue = (name: string, value: string) => {
        navigator.clipboard.writeText(value);
        setCopied(name);
        setTimeout(() => setCopied(null), 2000);
    };

    const exportCookies = () => {
        const data = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
        navigator.clipboard.writeText(data);
        setCopied('export');
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Cookie size={16} className="text-cyber-400" />
                    <span className="text-xs text-gray-400">{cookies.length} cookies</span>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={loadCookies}
                        className="p-1.5 hover:bg-dark-700 rounded transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="p-1.5 hover:bg-dark-700 rounded transition-colors"
                        title="Add Cookie"
                    >
                        <Plus size={14} />
                    </button>
                    <button
                        onClick={exportCookies}
                        className="p-1.5 hover:bg-dark-700 rounded transition-colors"
                        title="Export All"
                    >
                        {copied === 'export' ? <Check size={14} className="text-cyber-400" /> : <Download size={14} />}
                    </button>
                </div>
            </div>

            {/* Add Cookie Form */}
            {showAdd && (
                <div className="p-3 bg-dark-800 border border-dark-700 rounded-md space-y-2">
                    <input
                        type="text"
                        value={newCookie.name}
                        onChange={(e) => setNewCookie({ ...newCookie, name: e.target.value })}
                        placeholder="Cookie name"
                        className="w-full px-2 py-1.5 text-xs bg-dark-900 border border-dark-600 rounded focus:outline-none focus:border-cyber-500"
                    />
                    <input
                        type="text"
                        value={newCookie.value}
                        onChange={(e) => setNewCookie({ ...newCookie, value: e.target.value })}
                        placeholder="Cookie value"
                        className="w-full px-2 py-1.5 text-xs bg-dark-900 border border-dark-600 rounded focus:outline-none focus:border-cyber-500"
                    />
                    <button
                        onClick={addCookie}
                        className="w-full py-1.5 text-xs bg-cyber-600 hover:bg-cyber-700 rounded transition-colors"
                    >
                        Add Cookie
                    </button>
                </div>
            )}

            {/* Cookie List */}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {cookies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-xs">
                        No cookies found for this domain
                    </div>
                ) : (
                    cookies.map((cookie) => (
                        <div
                            key={cookie.name}
                            className="p-2 bg-dark-800 border border-dark-700 rounded-md group hover:border-dark-600 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-cyber-400">{cookie.name}</span>
                                        <div className="flex gap-1">
                                            {cookie.secure && (
                                                <span className="px-1 py-0.5 text-[8px] bg-green-900/30 text-green-400 rounded">Secure</span>
                                            )}
                                            {cookie.httpOnly && (
                                                <span className="px-1 py-0.5 text-[8px] bg-yellow-900/30 text-yellow-400 rounded">HttpOnly</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-mono text-gray-400 truncate mt-0.5" title={cookie.value}>
                                        {cookie.value}
                                    </p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">
                                        {cookie.domain} • {cookie.path} • {cookie.sameSite}
                                    </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => copyValue(cookie.name, cookie.value)}
                                        className="p-1 hover:bg-dark-600 rounded"
                                        title="Copy value"
                                    >
                                        {copied === cookie.name ? <Check size={12} className="text-cyber-400" /> : <Copy size={12} />}
                                    </button>
                                    <button
                                        onClick={() => deleteCookie(cookie)}
                                        className="p-1 hover:bg-red-900/30 text-red-400 rounded"
                                        title="Delete"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
