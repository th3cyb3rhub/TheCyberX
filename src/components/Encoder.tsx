import { useState } from 'react';
import { Copy, Check, ArrowLeftRight } from 'lucide-react';

type EncodingType = 'base64' | 'url' | 'html' | 'hex' | 'unicode' | 'binary';

const encodingTypes: { id: EncodingType; label: string }[] = [
    { id: 'base64', label: 'Base64' },
    { id: 'url', label: 'URL' },
    { id: 'html', label: 'HTML' },
    { id: 'hex', label: 'Hex' },
    { id: 'unicode', label: 'Unicode' },
    { id: 'binary', label: 'Binary' },
];

function encode(text: string, type: EncodingType): string {
    try {
        switch (type) {
            case 'base64':
                return btoa(unescape(encodeURIComponent(text)));
            case 'url':
                return encodeURIComponent(text);
            case 'html':
                return text.replace(/[&<>"']/g, (char) => {
                    const entities: Record<string, string> = {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#39;',
                    };
                    return entities[char] || char;
                });
            case 'hex':
                return text
                    .split('')
                    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
                    .join('');
            case 'unicode':
                return text
                    .split('')
                    .map((c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
                    .join('');
            case 'binary':
                return text
                    .split('')
                    .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
                    .join(' ');
            default:
                return text;
        }
    } catch {
        return 'Error encoding';
    }
}

function decode(text: string, type: EncodingType): string {
    try {
        switch (type) {
            case 'base64':
                return decodeURIComponent(escape(atob(text)));
            case 'url':
                return decodeURIComponent(text);
            case 'html':
                const doc = new DOMParser().parseFromString(text, 'text/html');
                return doc.documentElement.textContent || '';
            case 'hex':
                return text
                    .match(/.{1,2}/g)
                    ?.map((byte) => String.fromCharCode(parseInt(byte, 16)))
                    .join('') || '';
            case 'unicode':
                return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
                    String.fromCharCode(parseInt(hex, 16))
                );
            case 'binary':
                return text
                    .split(' ')
                    .map((bin) => String.fromCharCode(parseInt(bin, 2)))
                    .join('');
            default:
                return text;
        }
    } catch {
        return 'Error decoding';
    }
}

export default function Encoder() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [encodingType, setEncodingType] = useState<EncodingType>('base64');
    const [copied, setCopied] = useState(false);

    const handleEncode = () => {
        setOutput(encode(input, encodingType));
    };

    const handleDecode = () => {
        setOutput(decode(input, encodingType));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSwap = () => {
        setInput(output);
        setOutput('');
    };

    return (
        <div className="space-y-4">
            {/* Encoding Type Selector */}
            <div className="flex flex-wrap gap-2">
                {encodingTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setEncodingType(type.id)}
                        className={`px-3 py-1.5 text-xs rounded-md transition-colors ${encodingType === type.id
                                ? 'bg-cyber-600 text-white'
                                : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div>
                <label className="block text-xs text-gray-400 mb-1">Input</label>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter text to encode/decode..."
                    className="w-full h-24 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500 resize-none"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={handleEncode}
                    className="flex-1 py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 rounded-md transition-colors"
                >
                    Encode
                </button>
                <button
                    onClick={handleDecode}
                    className="flex-1 py-2 text-sm font-medium bg-dark-700 hover:bg-dark-600 rounded-md transition-colors"
                >
                    Decode
                </button>
                <button
                    onClick={handleSwap}
                    className="p-2 bg-dark-700 hover:bg-dark-600 rounded-md transition-colors"
                    title="Swap input/output"
                >
                    <ArrowLeftRight size={18} />
                </button>
            </div>

            {/* Output */}
            <div className="relative">
                <label className="block text-xs text-gray-400 mb-1">Output</label>
                <textarea
                    value={output}
                    readOnly
                    placeholder="Result will appear here..."
                    className="w-full h-24 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md resize-none"
                />
                {output && (
                    <button
                        onClick={handleCopy}
                        className="absolute top-7 right-2 p-1.5 bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={14} className="text-cyber-400" /> : <Copy size={14} />}
                    </button>
                )}
            </div>
        </div>
    );
}
