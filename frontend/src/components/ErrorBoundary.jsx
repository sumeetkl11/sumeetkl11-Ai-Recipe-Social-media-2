import React from 'react';
import logger from '../utils/logger.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Report to backend via structured logger
    logger.captureException(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback(this.state.error, this.handleReset);
    }

    const isDev = import.meta.env.DEV;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex min-h-screen items-center justify-center px-4"
        style={{
          background: 'radial-gradient(circle at top left, rgba(255,60,172,0.12), transparent 28%), radial-gradient(circle at top right, rgba(43,134,197,0.1), transparent 24%), linear-gradient(180deg,#ffffff 0%,#fafafa 48%,#f4f7fb 100%)'
        }}
      >
        <div
          className="w-full max-w-md rounded-[28px] border p-8 text-center"
          style={{
            background: 'linear-gradient(rgba(255,255,255,0.72),rgba(255,255,255,0.72)) padding-box, linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,255,255,0.46)) border-box',
            borderColor: 'transparent',
            boxShadow: '0 20px 40px rgba(0,0,0,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Icon */}
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] text-white"
            style={{ background: 'linear-gradient(45deg,#FF3CAC 0%,#784BA0 50%,#2B86C5 100%)', boxShadow: '0 16px 28px rgba(120,75,160,0.28)' }}
            aria-hidden="true"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            An unexpected error occurred. The issue has been reported automatically.
          </p>

          {isDev && this.state.error && (
            <details className="mt-5 rounded-2xl bg-rose-50 p-4 text-left">
              <summary className="cursor-pointer text-xs font-semibold text-rose-700 uppercase tracking-wide">
                Dev — Error Details
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-rose-600 whitespace-pre-wrap break-all">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className="mt-7 flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex-1 rounded-full py-3 text-sm font-bold text-white"
              style={{ background: 'linear-gradient(45deg,#FF3CAC 0%,#784BA0 50%,#2B86C5 100%)', boxShadow: '0 16px 30px rgba(120,75,160,0.22)' }}
            >
              Try Again
            </button>
            <button
              onClick={() => { window.location.href = '/dashboard'; }}
              className="flex-1 rounded-full border py-3 text-sm font-bold text-slate-700"
              style={{ borderColor: 'rgba(255,255,255,0.84)', background: 'rgba(255,255,255,0.82)', boxShadow: '0 12px 24px rgba(15,23,42,0.06)' }}
            >
              Go Home
            </button>
          </div>

          <a
            href="mailto:support@tastebuds.app?subject=Bug Report"
            className="mt-4 inline-block text-xs text-slate-400 hover:text-slate-600 transition"
          >
            Report this issue
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
