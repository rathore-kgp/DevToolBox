import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Tool Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#f87171]/10 border border-[#f87171]/20 flex items-center justify-center text-2xl mb-4">
            ⚠️
          </div>
          <h3 className="text-[#f87171] font-semibold text-base mb-2">
            Something went wrong
          </h3>
          <p className="text-[#545a7a] text-sm max-w-xs leading-relaxed mb-4">
            {this.state.error?.message || 'An unexpected error occurred in this tool.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;