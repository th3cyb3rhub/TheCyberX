import { useState } from 'react';
import { Clock, Copy, Check, ArrowLeftRight } from 'lucide-react';

export default function Timestamp() {
    const [unixTimestamp, setUnixTimestamp] = useState('');
    const [humanDate, setHumanDate] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    const unixToHuman = () => {
        if (!unixTimestamp) return;
        const ts = parseInt(unixTimestamp);
        // Handle both seconds and milliseconds
        const date = new Date(ts > 9999999999 ? ts : ts * 1000);
        setHumanDate(date.toISOString());
    };

    const humanToUnix = () => {
        if (!humanDate) return;
        const date = new Date(humanDate);
        setUnixTimestamp(Math.floor(date.getTime() / 1000).toString());
    };

    const setNow = () => {
        const now = Math.floor(Date.now() / 1000);
        setUnixTimestamp(now.toString());
        setHumanDate(new Date().toISOString());
    };

    const handleCopy = (value: string, key: string) => {
        navigator.clipboard.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatDate = (date: Date) => {
        return {
            iso: date.toISOString(),
            local: date.toLocaleString(),
            utc: date.toUTCString(),
            relative: getRelativeTime(date),
        };
    };

    const getRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
        return 'just now';
    };

    const parsedDate = unixTimestamp ? new Date(parseInt(unixTimestamp) > 9999999999 ? parseInt(unixTimestamp) : parseInt(unixTimestamp) * 1000) : null;
    const formats = parsedDate && !isNaN(parsedDate.getTime()) ? formatDate(parsedDate) : null;

    return (
        <div className="space-y-4">
            {/* Quick Actions */}
            <button
                onClick={setNow}
                className="w-full py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 rounded-md transition-colors flex items-center justify-center gap-2"
            >
                <Clock size={16} />
                Current Timestamp
            </button>

            {/* Unix Timestamp */}
            <div>
                <label className="block text-xs text-gray-400 mb-1">Unix Timestamp</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={unixTimestamp}
                        onChange={(e) => setUnixTimestamp(e.target.value)}
                        placeholder="1704067200"
                        className="flex-1 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500 font-mono"
                    />
                    <button
                        onClick={unixToHuman}
                        className="px-3 py-2 bg-dark-700 hover:bg-dark-600 rounded-md transition-colors text-xs"
                    >
                        → Human
                    </button>
                    {unixTimestamp && (
                        <button
                            onClick={() => handleCopy(unixTimestamp, 'unix')}
                            className="p-2 bg-dark-700 hover:bg-dark-600 rounded-md transition-colors"
                        >
                            {copied === 'unix' ? <Check size={14} className="text-cyber-400" /> : <Copy size={14} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Human Date */}
            <div>
                <label className="block text-xs text-gray-400 mb-1">Human Readable</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={humanDate}
                        onChange={(e) => setHumanDate(e.target.value)}
                        placeholder="2024-01-01T00:00:00.000Z"
                        className="flex-1 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500 font-mono"
                    />
                    <button
                        onClick={humanToUnix}
                        className="px-3 py-2 bg-dark-700 hover:bg-dark-600 rounded-md transition-colors text-xs"
                    >
                        → Unix
                    </button>
                    {humanDate && (
                        <button
                            onClick={() => handleCopy(humanDate, 'human')}
                            className="p-2 bg-dark-700 hover:bg-dark-600 rounded-md transition-colors"
                        >
                            {copied === 'human' ? <Check size={14} className="text-cyber-400" /> : <Copy size={14} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Formatted Output */}
            {formats && (
                <div className="space-y-2">
                    <label className="block text-xs text-gray-400">Formats</label>
                    {Object.entries(formats).map(([key, value]) => (
                        <div
                            key={key}
                            className="flex items-center justify-between px-3 py-2 bg-dark-800 border border-dark-700 rounded-md group"
                        >
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase">{key}</span>
                                <p className="text-xs font-mono text-gray-300">{value}</p>
                            </div>
                            <button
                                onClick={() => handleCopy(value, key)}
                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-dark-600 rounded transition-all"
                            >
                                {copied === key ? <Check size={12} className="text-cyber-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
