import { useState } from 'react';
import {
    Binary,
    Hash,
    Key,
    Code,
    Search,
    Shield,
    Terminal,
    Link,
    Cpu,
    Clock,
    Fingerprint,
    Network,
    Braces,
    Cookie,
    FileCode,
    EyeOff,
    MessageSquare,
} from 'lucide-react';

// Error Boundary
import ErrorBoundary from '../components/ErrorBoundary';

// Core Tools
import Encoder from '../components/Encoder';
import Hasher from '../components/Hasher';
import JWTDecoder from '../components/JWTDecoder';
import Payloads from '../components/Payloads';
import Dorks from '../components/Dorks';

// Security Tools
import ReverseShell from '../components/ReverseShell';
import CorsChecker from '../components/CorsChecker';
import HeaderAnalyzer from '../components/HeaderAnalyzer';
import CookieEditor from '../components/CookieEditor';

// Recon Tools
import JSExtractor from '../components/JSExtractor';
import LinkExtractor from '../components/LinkExtractor';
import FormFinder from '../components/FormFinder';
import CommentFinder from '../components/CommentFinder';
import TechDetector from '../components/TechDetector';

// Utility Tools
import RegexTester from '../components/RegexTester';
import Timestamp from '../components/Timestamp';
import UUIDGenerator from '../components/UUIDGenerator';
import IPCalculator from '../components/IPCalculator';
import Beautifier from '../components/Beautifier';

type Category = 'core' | 'security' | 'recon' | 'utils';

interface Tool {
    id: string;
    label: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    category: Category;
}

const tools: Tool[] = [
    // Core
    { id: 'encoder', label: 'Encode/Decode', icon: <Binary size={14} />, component: <Encoder />, category: 'core' },
    { id: 'hasher', label: 'Hash', icon: <Hash size={14} />, component: <Hasher />, category: 'core' },
    { id: 'jwt', label: 'JWT', icon: <Key size={14} />, component: <JWTDecoder />, category: 'core' },
    { id: 'payloads', label: 'Payloads', icon: <Code size={14} />, component: <Payloads />, category: 'core' },
    { id: 'dorks', label: 'Dorks', icon: <Search size={14} />, component: <Dorks />, category: 'core' },

    // Security
    { id: 'revshell', label: 'RevShell', icon: <Terminal size={14} />, component: <ReverseShell />, category: 'security' },
    { id: 'cors', label: 'CORS', icon: <Shield size={14} />, component: <CorsChecker />, category: 'security' },
    { id: 'headers', label: 'Headers', icon: <FileCode size={14} />, component: <HeaderAnalyzer />, category: 'security' },
    { id: 'cookies', label: 'Cookies', icon: <Cookie size={14} />, component: <CookieEditor />, category: 'security' },

    // Recon
    { id: 'jsextract', label: 'JS Extract', icon: <FileCode size={14} />, component: <JSExtractor />, category: 'recon' },
    { id: 'links', label: 'Links', icon: <Link size={14} />, component: <LinkExtractor />, category: 'recon' },
    { id: 'forms', label: 'Forms', icon: <EyeOff size={14} />, component: <FormFinder />, category: 'recon' },
    { id: 'comments', label: 'Comments', icon: <MessageSquare size={14} />, component: <CommentFinder />, category: 'recon' },
    { id: 'tech', label: 'Tech', icon: <Cpu size={14} />, component: <TechDetector />, category: 'recon' },

    // Utils
    { id: 'regex', label: 'Regex', icon: <Search size={14} />, component: <RegexTester />, category: 'utils' },
    { id: 'timestamp', label: 'Time', icon: <Clock size={14} />, component: <Timestamp />, category: 'utils' },
    { id: 'uuid', label: 'UUID', icon: <Fingerprint size={14} />, component: <UUIDGenerator />, category: 'utils' },
    { id: 'ip', label: 'IP Calc', icon: <Network size={14} />, component: <IPCalculator />, category: 'utils' },
    { id: 'beautify', label: 'Beautify', icon: <Braces size={14} />, component: <Beautifier />, category: 'utils' },
];

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: 'core', label: 'Core', icon: <Binary size={14} /> },
    { id: 'security', label: 'Security', icon: <Shield size={14} /> },
    { id: 'recon', label: 'Recon', icon: <Search size={14} /> },
    { id: 'utils', label: 'Utils', icon: <Braces size={14} /> },
];

function App() {
    const [activeTool, setActiveTool] = useState('encoder');
    const [activeCategory, setActiveCategory] = useState<Category>('core');

    const currentTool = tools.find((t) => t.id === activeTool);
    const filteredTools = tools.filter((t) => t.category === activeCategory);

    return (
        <div className="w-[650px] h-[520px] bg-dark-900 text-gray-100 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-dark-950 to-dark-900 border-b border-dark-700">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyber-600/20 rounded-lg">
                        <Shield className="text-cyber-400" size={18} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-cyber-400">TheCyberX</h1>
                        <p className="text-[9px] text-gray-500">Pentesting Toolkit</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 text-[8px] bg-cyber-600/20 text-cyber-400 rounded">v1.0.0</span>
                </div>
            </header>

            {/* Category Tabs */}
            <nav className="flex bg-dark-950 border-b border-dark-700">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            setActiveTool(tools.find((t) => t.category === cat.id)?.id || 'encoder');
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${activeCategory === cat.id
                                ? 'text-cyber-400 bg-dark-800/80 border-b-2 border-cyber-500'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-dark-800/30'
                            }`}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
            </nav>

            {/* Tool Selection */}
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-dark-850 border-b border-dark-700">
                {filteredTools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all ${activeTool === tool.id
                                ? 'bg-cyber-600 text-white shadow-lg shadow-cyber-600/20'
                                : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-gray-200'
                            }`}
                    >
                        {tool.icon}
                        {tool.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <main className="flex-1 overflow-auto p-4 bg-dark-900">
                <ErrorBoundary key={activeTool}>
                    {currentTool?.component}
                </ErrorBoundary>
            </main>

            {/* Footer */}
            <footer className="px-4 py-1.5 bg-dark-950 border-t border-dark-700">
                <div className="flex items-center justify-between">
                    <p className="text-[9px] text-gray-600">
                        Made with ❤️ by <span className="text-cyber-500">TheCyberHub</span>
                    </p>
                    <a
                        href="https://github.com/thecyberhub/TheCyberX"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-gray-600 hover:text-gray-400 transition-colors"
                    >
                        GitHub
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default App;
