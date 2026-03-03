/**
 * Error Boundary — Phase 5.4
 * Catches React rendering errors and provides a recovery UI.
 * In production, errors would be reported to Sentry.
 */
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In production, report to Sentry:
    // Sentry.captureException(error, { extra: errorInfo });
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-navy-light)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Something went wrong
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              An unexpected error occurred. Please try again or contact support if the issue persists.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 rounded-lg bg-[rgba(255,107,107,0.06)] border border-[rgba(255,107,107,0.15)] text-left">
                <p className="text-mono text-[11px] text-[var(--color-danger)] break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-ghost px-6 py-2.5 text-sm"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
