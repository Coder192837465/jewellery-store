import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary section container flex-col items-center justify-center text-center" style={{ minHeight: '60vh' }}>
          <h1 className="font-serif text-3xl mb-4">Oops! Something went wrong.</h1>
          <p className="text-gray mb-8">
            We encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
          </p>
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left bg-gray-100 p-4 rounded" style={{ maxWidth: '100%', overflowX: 'auto' }}>
              <summary className="cursor-pointer font-bold text-red-600">Error Details (Dev Mode)</summary>
              <pre className="mt-2 text-sm text-red-500 whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
