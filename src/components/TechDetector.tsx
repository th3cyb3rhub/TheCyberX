import { useState } from 'react';
import { Cpu, RefreshCw, ExternalLink } from 'lucide-react';

interface Technology {
    name: string;
    category: string;
    confidence: 'high' | 'medium' | 'low';
    version?: string;
}

const techPatterns: { name: string; category: string; patterns: { type: string; regex: RegExp; version?: RegExp }[] }[] = [
    {
        name: 'React',
        category: 'JavaScript Framework',
        patterns: [
            { type: 'script', regex: /react[.-]dom/i, version: /react[.-]dom[@/](\d+\.\d+)/i },
            { type: 'html', regex: /data-reactroot|data-reactid/i },
        ],
    },
    {
        name: 'Vue.js',
        category: 'JavaScript Framework',
        patterns: [
            { type: 'script', regex: /vue[.-]?(\d)?\.(?:min\.)?js/i },
            { type: 'html', regex: /data-v-[a-f0-9]/i },
        ],
    },
    {
        name: 'Angular',
        category: 'JavaScript Framework',
        patterns: [
            { type: 'html', regex: /ng-app|ng-controller|\[ng[A-Z]/i },
            { type: 'script', regex: /angular[.-]?(\d)?\.(?:min\.)?js/i },
        ],
    },
    {
        name: 'jQuery',
        category: 'JavaScript Library',
        patterns: [
            { type: 'script', regex: /jquery[.-]?(\d)?\.(?:min\.)?js/i, version: /jquery[.-](\d+\.\d+)/i },
        ],
    },
    {
        name: 'Bootstrap',
        category: 'CSS Framework',
        patterns: [
            { type: 'link', regex: /bootstrap[.-]?(\d)?\.(?:min\.)?css/i },
            { type: 'script', regex: /bootstrap[.-]?(\d)?\.(?:min\.)?js/i },
        ],
    },
    {
        name: 'Tailwind CSS',
        category: 'CSS Framework',
        patterns: [
            { type: 'html', regex: /class="[^"]*(?:flex|grid|px-|py-|mt-|mb-|text-|bg-)[^"]*"/i },
        ],
    },
    {
        name: 'Next.js',
        category: 'JavaScript Framework',
        patterns: [
            { type: 'script', regex: /_next\/static/i },
            { type: 'html', regex: /__NEXT_DATA__/i },
        ],
    },
    {
        name: 'WordPress',
        category: 'CMS',
        patterns: [
            { type: 'html', regex: /wp-content|wp-includes/i },
            { type: 'meta', regex: /generator.*wordpress/i },
        ],
    },
    {
        name: 'Nginx',
        category: 'Web Server',
        patterns: [
            { type: 'header', regex: /nginx/i },
        ],
    },
    {
        name: 'Apache',
        category: 'Web Server',
        patterns: [
            { type: 'header', regex: /apache/i },
        ],
    },
    {
        name: 'Cloudflare',
        category: 'CDN/Security',
        patterns: [
            { type: 'header', regex: /cloudflare/i },
            { type: 'script', regex: /challenges\.cloudflare\.com/i },
        ],
    },
    {
        name: 'Google Analytics',
        category: 'Analytics',
        patterns: [
            { type: 'script', regex: /google-analytics\.com|googletagmanager\.com|gtag/i },
        ],
    },
    {
        name: 'reCAPTCHA',
        category: 'Security',
        patterns: [
            { type: 'script', regex: /recaptcha/i },
        ],
    },
];

export default function TechDetector() {
    const [technologies, setTechnologies] = useState<Technology[]>([]);
    const [loading, setLoading] = useState(false);

    const detectTechnologies = async () => {
        setLoading(true);
        setTechnologies([]);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) return;

            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const html = document.documentElement.outerHTML;
                    const scripts = Array.from(document.querySelectorAll('script[src]')).map((s) => (s as HTMLScriptElement).src);
                    const links = Array.from(document.querySelectorAll('link[href]')).map((l) => (l as HTMLLinkElement).href);
                    const metas = Array.from(document.querySelectorAll('meta')).map((m) => m.outerHTML);

                    return { html, scripts, links, metas };
                },
            });

            const { html, scripts, links, metas } = result[0]?.result || {};
            const detected: Technology[] = [];

            techPatterns.forEach((tech) => {
                let found = false;
                let confidence: 'high' | 'medium' | 'low' = 'medium';

                tech.patterns.forEach((pattern) => {
                    if (found) return;

                    if (pattern.type === 'script') {
                        scripts?.forEach((src: string) => {
                            if (pattern.regex.test(src)) {
                                found = true;
                                confidence = 'high';
                            }
                        });
                    } else if (pattern.type === 'link') {
                        links?.forEach((href: string) => {
                            if (pattern.regex.test(href)) {
                                found = true;
                                confidence = 'high';
                            }
                        });
                    } else if (pattern.type === 'html') {
                        if (pattern.regex.test(html || '')) {
                            found = true;
                            confidence = 'medium';
                        }
                    } else if (pattern.type === 'meta') {
                        metas?.forEach((meta: string) => {
                            if (pattern.regex.test(meta)) {
                                found = true;
                                confidence = 'high';
                            }
                        });
                    }
                });

                if (found) {
                    detected.push({
                        name: tech.name,
                        category: tech.category,
                        confidence,
                    });
                }
            });

            setTechnologies(detected);
        } catch (error) {
            console.error('Failed to detect technologies:', error);
        }

        setLoading(false);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'JavaScript Framework': return 'bg-yellow-900/30 text-yellow-400';
            case 'JavaScript Library': return 'bg-orange-900/30 text-orange-400';
            case 'CSS Framework': return 'bg-blue-900/30 text-blue-400';
            case 'CMS': return 'bg-purple-900/30 text-purple-400';
            case 'Web Server': return 'bg-green-900/30 text-green-400';
            case 'CDN/Security': return 'bg-cyan-900/30 text-cyan-400';
            default: return 'bg-gray-900/30 text-gray-400';
        }
    };

    return (
        <div className="space-y-4">
            {/* Detect Button */}
            <button
                onClick={detectTechnologies}
                disabled={loading}
                className="w-full py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
            >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Cpu size={16} />}
                {loading ? 'Detecting...' : 'Detect Technologies'}
            </button>

            {/* Results */}
            {technologies.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-gray-400">{technologies.length} technologies detected</p>

                    <div className="grid grid-cols-2 gap-2">
                        {technologies.map((tech, idx) => (
                            <div
                                key={idx}
                                className="p-2 bg-dark-800 border border-dark-700 rounded-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-200">{tech.name}</p>
                                        <span className={`inline-block mt-1 text-[8px] px-1.5 py-0.5 rounded ${getCategoryColor(tech.category)}`}>
                                            {tech.category}
                                        </span>
                                    </div>
                                    <span className={`text-[8px] px-1 py-0.5 rounded ${tech.confidence === 'high' ? 'bg-green-900/30 text-green-400' :
                                            tech.confidence === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                                                'bg-gray-900/30 text-gray-400'
                                        }`}>
                                        {tech.confidence}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {technologies.length === 0 && !loading && (
                <div className="text-center py-8">
                    <Cpu size={32} className="mx-auto text-gray-600 mb-2" />
                    <p className="text-xs text-gray-500">Detect web technologies</p>
                    <p className="text-[10px] text-gray-600 mt-1">Frameworks, libraries, servers, CDNs</p>
                </div>
            )}
        </div>
    );
}
