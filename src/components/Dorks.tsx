import { useState } from 'react';
import { Copy, Check, Search, ExternalLink } from 'lucide-react';

interface DorkTemplate {
    id: string;
    name: string;
    template: string;
    description: string;
}

const dorkTemplates: DorkTemplate[] = [
    { id: 'site', name: 'Site specific', template: 'site:{domain}', description: 'Search within a specific domain' },
    { id: 'inurl', name: 'URL contains', template: 'inurl:{keyword}', description: 'Find URLs containing keyword' },
    { id: 'intitle', name: 'Title contains', template: 'intitle:{keyword}', description: 'Find pages with keyword in title' },
    { id: 'intext', name: 'Text contains', template: 'intext:{keyword}', description: 'Find pages with keyword in body' },
    { id: 'filetype', name: 'File type', template: 'filetype:{ext}', description: 'Find specific file types' },
    { id: 'ext', name: 'Extension', template: 'ext:{ext}', description: 'Find files with extension' },
    { id: 'cache', name: 'Cached version', template: 'cache:{url}', description: 'View cached version of page' },
    { id: 'related', name: 'Related sites', template: 'related:{domain}', description: 'Find related websites' },
    { id: 'info', name: 'Site info', template: 'info:{domain}', description: 'Get information about a site' },
    { id: 'link', name: 'Links to', template: 'link:{url}', description: 'Find pages linking to URL' },
];

const prebuiltDorks = [
    { name: 'Admin panels', dork: 'inurl:admin intitle:login' },
    { name: 'Login pages', dork: 'inurl:login | inurl:signin | inurl:auth' },
    { name: 'Config files', dork: 'ext:xml | ext:conf | ext:cnf | ext:reg | ext:inf | ext:rdp | ext:cfg | ext:txt | ext:ora | ext:ini' },
    { name: 'Database files', dork: 'ext:sql | ext:dbf | ext:mdb | ext:db' },
    { name: 'Log files', dork: 'ext:log | ext:logs' },
    { name: 'Backup files', dork: 'ext:bkf | ext:bkp | ext:bak | ext:old | ext:backup' },
    { name: 'PHP errors', dork: '"PHP Parse error" | "PHP Warning" | "PHP Error"' },
    { name: 'SQL errors', dork: '"SQL syntax" | "mysql_fetch" | "ORA-00921"' },
    { name: 'Exposed git', dork: 'inurl:".git" intitle:"Index of"' },
    { name: 'Open directories', dork: 'intitle:"Index of /" + "parent directory"' },
    { name: 'WordPress', dork: 'inurl:wp-content | inurl:wp-includes' },
    { name: 'phpMyAdmin', dork: 'inurl:phpmyadmin/index.php' },
    { name: 'Exposed .env', dork: 'intitle:"index of" ".env"' },
    { name: 'AWS keys', dork: 'filetype:pem intext:PRIVATE' },
    { name: 'Passwords', dork: 'ext:txt intext:password | intext:username' },
];

export default function Dorks() {
    const [domain, setDomain] = useState('');
    const [keyword, setKeyword] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<DorkTemplate | null>(null);
    const [generatedDork, setGeneratedDork] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    const generateDork = () => {
        if (!selectedTemplate) return;

        let dork = selectedTemplate.template;
        dork = dork.replace('{domain}', domain || 'example.com');
        dork = dork.replace('{keyword}', keyword || 'admin');
        dork = dork.replace('{ext}', keyword || 'pdf');
        dork = dork.replace('{url}', domain || 'example.com');

        setGeneratedDork(dork);
    };

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const openInGoogle = (dork: string) => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(dork)}`, '_blank');
    };

    return (
        <div className="space-y-4">
            {/* Generator */}
            <div className="p-3 bg-dark-800 rounded-md border border-dark-700 space-y-3">
                <h3 className="text-sm font-medium text-cyber-400">Dork Generator</h3>

                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="Domain (e.g., example.com)"
                        className="px-2 py-1.5 text-xs bg-dark-900 border border-dark-600 rounded focus:outline-none focus:border-cyber-500"
                    />
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Keyword"
                        className="px-2 py-1.5 text-xs bg-dark-900 border border-dark-600 rounded focus:outline-none focus:border-cyber-500"
                    />
                </div>

                <div className="flex flex-wrap gap-1">
                    {dorkTemplates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template)}
                            className={`px-2 py-1 text-[10px] rounded transition-colors ${selectedTemplate?.id === template.id
                                    ? 'bg-cyber-600 text-white'
                                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                                }`}
                            title={template.description}
                        >
                            {template.name}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={generateDork}
                        disabled={!selectedTemplate}
                        className="flex-1 py-1.5 text-xs font-medium bg-cyber-600 hover:bg-cyber-700 disabled:bg-dark-700 rounded transition-colors"
                    >
                        Generate
                    </button>
                    {generatedDork && (
                        <>
                            <button
                                onClick={() => handleCopy(generatedDork, 'generated')}
                                className="p-1.5 bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                                title="Copy"
                            >
                                {copied === 'generated' ? <Check size={14} className="text-cyber-400" /> : <Copy size={14} />}
                            </button>
                            <button
                                onClick={() => openInGoogle(generatedDork)}
                                className="p-1.5 bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                                title="Search in Google"
                            >
                                <ExternalLink size={14} />
                            </button>
                        </>
                    )}
                </div>

                {generatedDork && (
                    <div className="p-2 bg-dark-900 rounded text-xs font-mono text-cyber-300 break-all">
                        {generatedDork}
                    </div>
                )}
            </div>

            {/* Prebuilt Dorks */}
            <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Quick Dorks</h3>
                <div className="space-y-1 max-h-[180px] overflow-y-auto">
                    {prebuiltDorks.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between px-2 py-1.5 bg-dark-800 hover:bg-dark-700 rounded transition-colors group"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400">{item.name}</p>
                                <p className="text-[10px] font-mono text-gray-500 truncate">{item.dork}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleCopy(item.dork, `prebuilt-${idx}`)}
                                    className="p-1 bg-dark-600 hover:bg-dark-500 rounded"
                                    title="Copy"
                                >
                                    {copied === `prebuilt-${idx}` ? <Check size={10} className="text-cyber-400" /> : <Copy size={10} />}
                                </button>
                                <button
                                    onClick={() => openInGoogle(item.dork)}
                                    className="p-1 bg-dark-600 hover:bg-dark-500 rounded"
                                    title="Search"
                                >
                                    <Search size={10} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
