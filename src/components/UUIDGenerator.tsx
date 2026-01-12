import { useState } from 'react';
import { RefreshCw, Copy, Check, Trash2 } from 'lucide-react';

type UUIDVersion = 'v4' | 'nil' | 'max';

interface GeneratedUUID {
    value: string;
    version: UUIDVersion;
}

function generateUUIDv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function generateNilUUID(): string {
    return '00000000-0000-0000-0000-000000000000';
}

function generateMaxUUID(): string {
    return 'ffffffff-ffff-ffff-ffff-ffffffffffff';
}

export default function UUIDGenerator() {
    const [uuids, setUuids] = useState<GeneratedUUID[]>([]);
    const [count, setCount] = useState(1);
    const [version, setVersion] = useState<UUIDVersion>('v4');
    const [copied, setCopied] = useState<string | null>(null);
    const [uppercase, setUppercase] = useState(false);
    const [noDashes, setNoDashes] = useState(false);

    const generateUUIDs = () => {
        const newUuids: GeneratedUUID[] = [];
        for (let i = 0; i < count; i++) {
            let value: string;
            switch (version) {
                case 'nil':
                    value = generateNilUUID();
                    break;
                case 'max':
                    value = generateMaxUUID();
                    break;
                default:
                    value = generateUUIDv4();
            }

            if (uppercase) value = value.toUpperCase();
            if (noDashes) value = value.replace(/-/g, '');

            newUuids.push({ value, version });
        }
        setUuids(newUuids);
    };

    const handleCopy = (value: string, key: string) => {
        navigator.clipboard.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const copyAll = () => {
        const text = uuids.map((u) => u.value).join('\n');
        navigator.clipboard.writeText(text);
        setCopied('all');
        setTimeout(() => setCopied(null), 2000);
    };

    const clearAll = () => {
        setUuids([]);
    };

    return (
        <div className="space-y-4">
            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Version</label>
                    <select
                        value={version}
                        onChange={(e) => setVersion(e.target.value as UUIDVersion)}
                        className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500"
                    >
                        <option value="v4">UUID v4 (Random)</option>
                        <option value="nil">Nil UUID</option>
                        <option value="max">Max UUID</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Count</label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={count}
                        onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500"
                    />
                </div>
            </div>

            {/* Format Options */}
            <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={uppercase}
                        onChange={(e) => setUppercase(e.target.checked)}
                        className="rounded bg-dark-800 border-dark-600 text-cyber-500 focus:ring-cyber-500"
                    />
                    Uppercase
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={noDashes}
                        onChange={(e) => setNoDashes(e.target.checked)}
                        className="rounded bg-dark-800 border-dark-600 text-cyber-500 focus:ring-cyber-500"
                    />
                    No dashes
                </label>
            </div>

            {/* Generate Button */}
            <button
                onClick={generateUUIDs}
                className="w-full py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 rounded-md transition-colors flex items-center justify-center gap-2"
            >
                <RefreshCw size={16} />
                Generate UUID{count > 1 ? 's' : ''}
            </button>

            {/* Results */}
            {uuids.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{uuids.length} UUID{uuids.length > 1 ? 's' : ''}</span>
                        <div className="flex gap-1">
                            <button
                                onClick={copyAll}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                            >
                                {copied === 'all' ? <Check size={10} className="text-cyber-400" /> : <Copy size={10} />}
                                Copy All
                            </button>
                            <button
                                onClick={clearAll}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] bg-dark-700 hover:bg-dark-600 text-red-400 rounded transition-colors"
                            >
                                <Trash2 size={10} />
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {uuids.map((uuid, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between px-3 py-2 bg-dark-800 border border-dark-700 rounded-md group"
                            >
                                <code className="text-xs font-mono text-cyber-300">{uuid.value}</code>
                                <button
                                    onClick={() => handleCopy(uuid.value, `uuid-${idx}`)}
                                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-dark-600 rounded transition-all"
                                >
                                    {copied === `uuid-${idx}` ? <Check size={12} className="text-cyber-400" /> : <Copy size={12} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
