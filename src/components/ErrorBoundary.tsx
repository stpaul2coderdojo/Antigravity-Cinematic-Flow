import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('antigravity_flow_project_v1');
    } catch (e) {
      console.warn('Failed to clear local storage:', e);
    }
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-[#F0F0F0] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0F0F12] border border-rose-500/30 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                System Diagnostics Recovery
              </h2>
              <p className="text-xs text-white/50">
                The application encountered an unexpected runtime interruption.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-black/60 border border-white/10 text-left font-mono text-[11px] text-rose-300/80 overflow-x-auto max-h-28">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(59,130,246,0.4)] border border-blue-400/40 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset & Restore Workspace</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono transition-colors border border-white/10 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
