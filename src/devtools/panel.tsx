import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';

function DevToolsPanel() {
    return (
        <div className="min-h-screen bg-dark-900 text-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
                <h1 className="text-xl font-semibold text-cyber-400">TheCyberX DevTools</h1>
            </div>

            <div className="p-4 bg-dark-800 rounded-lg border border-dark-700">
                <h2 className="text-sm font-medium text-gray-300 mb-2">Response Viewer</h2>
                <p className="text-xs text-gray-500">
                    DevTools panel integration coming soon. This panel will allow you to:
                </p>
                <ul className="mt-2 text-xs text-gray-400 list-disc list-inside space-y-1">
                    <li>View and analyze HTTP responses</li>
                    <li>Inspect headers and cookies</li>
                    <li>Search for sensitive data in responses</li>
                    <li>Quick-decode detected encoded strings</li>
                </ul>
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <DevToolsPanel />
    </React.StrictMode>
);
