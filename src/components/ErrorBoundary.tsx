import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('TheCyberX Error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    <AlertTriangle className="text-red-400 mb-2" size={32} />
                    <h3 className="text-sm font-medium text-gray-300 mb-1">Something went wrong</h3>
                    <p className="text-xs text-gray-500 mb-3 max-w-xs">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                    >
                        <RefreshCw size={12} />
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
