import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export class ThreeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[ThreeErrorBoundary]: Caught 3D renderer error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">3D Accelerated Viewport Notice</h4>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Hardware WebGL acceleration encountered a constraint in this browser environment. The analytical data engine continues operating deterministically.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: null })}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload 3D Canvas
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
