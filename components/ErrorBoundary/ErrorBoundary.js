import React from 'react';
import styles from './ErrorBoundary.module.css';

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
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>¡Ups! Algo salió mal</h1>
          <p className={styles.errorMessage}>
            Lo sentimos, ha ocurrido un error inesperado.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className={styles.errorDetails}>
              <h2>Error Details:</h2>
              <p>{this.state.error && this.state.error.toString()}</p>
              <div>
                <h3>Component Stack:</h3>
                <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
              </div>
            </div>
          )}
          <button
            className={styles.reloadButton}
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 