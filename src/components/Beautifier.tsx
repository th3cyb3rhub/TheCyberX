import { useState } from 'react';
import { Code, Copy, Check, Minimize2, Maximize2 } from 'lucide-react';

type FormatType = 'json' | 'js' | 'html' | 'css' | 'xml';

export default function Beautifier() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [formatType, setFormatType] = useState<FormatType>('json');
    const [indentSize, setIndentSize] = useState(2);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const beautify = () => {
        setError('');
        try {
            let result = '';
            switch (formatType) {
                case 'json':
                    result = JSON.stringify(JSON.parse(input), null, indentSize);
                    break;
                case 'js':
                    // Simple JS beautification
                    result = input
                        .replace(/([{;])\s*/g, '$1\n')
                        .replace(/}\s*/g, '\n}\n')
                        .replace(/,\s*/g, ',\n')
                        .split('\n')
                        .map((line) => line.trim())
                        .filter((line) => line)
                        .join('\n');
                    break;
                case 'html':
                case 'xml':
                    result = formatXML(input, indentSize);
                    break;
                case 'css':
                    result = input
                        .replace(/\s*{\s*/g, ' {\n')
                        .replace(/\s*}\s*/g, '\n}\n')
                        .replace(/;\s*/g, ';\n')
                        .split('\n')
                        .map((line, i, arr) => {
                            if (line.includes('{') || line.includes('}')) return line.trim();
                            return ' '.repeat(indentSize) + line.trim();
                        })
                        .filter((line) => line)
                        .join('\n');
                    break;
            }
            setOutput(result);
        } catch (e) {
            setError((e as Error).message);
            setOutput('');
        }
    };

    const minify = () => {
        setError('');
        try {
            let result = '';
            switch (formatType) {
                case 'json':
                    result = JSON.stringify(JSON.parse(input));
                    break;
                case 'js':
                case 'css':
                    result = input.replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1').trim();
                    break;
                case 'html':
                case 'xml':
                    result = input.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
                    break;
            }
            setOutput(result);
        } catch (e) {
            setError((e as Error).message);
            setOutput('');
        }
    };

    const formatXML = (xml: string, indent: number): string => {
        let formatted = '';
        let pad = 0;
        const nodes = xml.replace(/></g, '>\n<').split('\n');

        nodes.forEach((node) => {
            if (node.match(/^<\/\w/)) pad -= indent;
            formatted += ' '.repeat(pad) + node.trim() + '\n';
            if (node.match(/^<\w[^>]*[^/]>$/)) pad += indent;
        });

        return formatted.trim();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4">
            {/* Options */}
            <div className="flex gap-2">
                <select
                    value={formatType}
                    onChange={(e) => setFormatType(e.target.value as FormatType)}
                    className="flex-1 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500"
                >
                    <option value="json">JSON</option>
                    <option value="js">JavaScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="xml">XML</option>
                </select>
                <select
                    value={indentSize}
                    onChange={(e) => setIndentSize(parseInt(e.target.value))}
                    className="w-20 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500"
                >
                    <option value="2">2 spaces</option>
                    <option value="4">4 spaces</option>
                </select>
            </div>

            {/* Input */}
            <div>
                <label className="block text-xs text-gray-400 mb-1">Input</label>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Paste ${formatType.toUpperCase()} here...`}
                    className="w-full h-24 px-3 py-2 text-xs bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500 resize-none font-mono"
                />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={beautify}
                    disabled={!input}
                    className="py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
                >
                    <Maximize2 size={14} />
                    Beautify
                </button>
                <button
                    onClick={minify}
                    disabled={!input}
                    className="py-2 text-sm font-medium bg-dark-700 hover:bg-dark-600 disabled:bg-dark-800 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
                >
                    <Minimize2 size={14} />
                    Minify
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="p-2 bg-red-900/20 border border-red-800 rounded-md text-xs text-red-400">
                    {error}
                </div>
            )}

            {/* Output */}
            {output && (
                <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-400">Output</label>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                        >
                            {copied ? <Check size={10} className="text-cyber-400" /> : <Copy size={10} />}
                            Copy
                        </button>
                    </div>
                    <pre className="p-3 bg-dark-800 border border-dark-600 rounded-md text-xs font-mono text-cyber-300 overflow-x-auto max-h-40 whitespace-pre">
                        {output}
                    </pre>
                </div>
            )}
        </div>
    );
}
