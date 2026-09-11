import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Heart, RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-950 text-slate-100">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-rose-900/40 shadow-2xl shadow-rose-950/50 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-8 h-8 fill-rose-500/30" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-romantic text-white">Something gently paused</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your private space encountered a temporary visual issue. Your saved letters, memories, and couple data remain safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs font-mono text-rose-300/80 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="btn-error-reload"
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Sanctuary
              </button>
              <button
                id="btn-error-reset"
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <AlertCircle className="w-4 h-4" />
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
