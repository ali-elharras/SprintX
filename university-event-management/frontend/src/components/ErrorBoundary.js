import React from 'react';
import theme from '../theme';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div
          style={{
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: theme.spacing[6],
            background: theme.colors.background.default,
          }}
        >
          <div
            style={{
              background: theme.colors.background.paper,
              padding: theme.spacing[8],
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.md,
              textAlign: "center",
              maxWidth: "500px",
              border: `2px solid ${theme.colors.status.error}`,
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSize["3xl"],
                marginBottom: theme.spacing[4],
                color: theme.colors.status.error,
              }}
            >
              ⚠️
            </div>
            <h2
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[3],
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[6],
                lineHeight: theme.typography.lineHeight.relaxed,
              }}
            >
              We encountered an unexpected error. Please try refreshing the page or navigate back to continue.
            </p>
            
            <div
              style={{
                display: "flex",
                gap: theme.spacing[3],
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button variant="primary" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  marginTop: theme.spacing[6],
                  padding: theme.spacing[4],
                  background: theme.colors.neutral.gray50,
                  borderRadius: theme.borderRadius.base,
                  textAlign: "left",
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: theme.typography.fontWeight.semibold,
                    marginBottom: theme.spacing[2],
                  }}
                >
                  Error Details (Development)
                </summary>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    color: theme.colors.status.error,
                    fontSize: theme.typography.fontSize.xs,
                    overflow: "auto",
                    maxHeight: "200px",
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;