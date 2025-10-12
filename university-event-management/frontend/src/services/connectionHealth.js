import React from 'react';
import api from './api';

class ConnectionHealthManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.lastHealthCheck = null;
    this.healthCheckInterval = null;
    this.listeners = new Set();
    
    // Listen to online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Start periodic health checks
    this.startHealthChecks();
  }

  handleOnline() {
    console.log('🌐 Connection restored');
    this.isOnline = true;
    this.notifyListeners({ type: 'online', isOnline: true });
    // Immediately check server health when coming back online
    this.checkServerHealth();
  }

  handleOffline() {
    console.log('🚫 Connection lost');
    this.isOnline = false;
    this.notifyListeners({ type: 'offline', isOnline: false });
  }

  async checkServerHealth() {
    try {
      const response = await api.get('/health', { timeout: 5000 });
      const healthData = response.data;
      
      this.lastHealthCheck = {
        timestamp: new Date(),
        status: 'healthy',
        data: healthData
      };
      
      this.notifyListeners({ 
        type: 'health-check', 
        isHealthy: true, 
        data: healthData 
      });
      
      return true;
    } catch (error) {
      console.warn('Server health check failed:', error.message);
      
      this.lastHealthCheck = {
        timestamp: new Date(),
        status: 'unhealthy',
        error: error.message
      };
      
      this.notifyListeners({ 
        type: 'health-check', 
        isHealthy: false, 
        error: error.message 
      });
      
      return false;
    }
  }

  startHealthChecks() {
    // Check server health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      if (this.isOnline) {
        this.checkServerHealth();
      }
    }, 30000);
    
    // Initial health check
    if (this.isOnline) {
      this.checkServerHealth();
    }
  }

  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in connection health listener:', error);
      }
    });
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      lastHealthCheck: this.lastHealthCheck,
      isHealthy: this.lastHealthCheck?.status === 'healthy'
    };
  }

  destroy() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    this.stopHealthChecks();
    this.listeners.clear();
  }
}

// Create singleton instance
export const connectionHealth = new ConnectionHealthManager();

// Hook for React components
export const useConnectionHealth = () => {
  const [status, setStatus] = React.useState(connectionHealth.getStatus());
  
  React.useEffect(() => {
    const unsubscribe = connectionHealth.addListener((event) => {
      setStatus(connectionHealth.getStatus());
    });
    
    return unsubscribe;
  }, []);
  
  return status;
};

export default connectionHealth;