import { useState, useEffect, useRef, useCallback } from 'react';
import { createCancelTokenSource } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Custom hook for making API calls with loading states, error handling, and request cancellation
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Configuration options
 */
export const useApiCall = (apiFunction, dependencies = [], options = {}) => {
  const {
    immediate = true, // Whether to call the API immediately
    showErrorToast = true, // Whether to show error toasts
    retryAttempts = 3, // Number of retry attempts
    onSuccess, // Success callback
    onError, // Error callback
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const cancelTokenRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup function to cancel ongoing requests
  const cleanup = useCallback(() => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Component unmounted or request cancelled');
      cancelTokenRef.current = null;
    }
  }, []);

  // Execute the API call
  const execute = useCallback(async (...args) => {
    // Cancel any ongoing request
    cleanup();
    
    // Create new cancel token
    cancelTokenRef.current = createCancelTokenSource();
    
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args, cancelTokenRef.current);
      
      if (!isMountedRef.current) return;
      
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      if (!isMountedRef.current) return;
      
      // Don't handle cancelled requests as errors
      if (err.name === 'CanceledError' || err.message?.includes('cancelled')) {
        return;
      }
      
      setError(err);
      
      if (showErrorToast) {
        const errorMessage = err.message || 'An error occurred';
        toast.error(errorMessage);
      }
      
      if (onError) onError(err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, cleanup, onSuccess, onError, showErrorToast]);

  // Auto-execute on mount and dependency changes
  useEffect(() => {
    if (immediate && isMountedRef.current) {
      execute();
    }
  }, [immediate, execute, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  };
};

/**
 * Hook for making multiple API calls
 * @param {Object} apiCalls - Object with keys as names and values as API functions
 * @param {Array} dependencies - Dependencies for useEffect
 * @param {Object} options - Configuration options
 */
export const useMultipleApiCalls = (apiCalls, dependencies = [], options = {}) => {
  const { immediate = true, showErrorToast = true } = options;
  
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const cancelTokensRef = useRef({});
  const isMountedRef = useRef(true);

  // Initialize states
  useEffect(() => {
    const initialLoading = {};
    Object.keys(apiCalls).forEach(key => {
      initialLoading[key] = immediate;
    });
    setLoading(initialLoading);
  }, [apiCalls, immediate]);

  const cleanup = useCallback(() => {
    Object.values(cancelTokensRef.current).forEach(cancelToken => {
      if (cancelToken) {
        cancelToken.cancel('Component unmounted or request cancelled');
      }
    });
    cancelTokensRef.current = {};
  }, []);

  const executeAll = useCallback(async () => {
    cleanup();
    
    if (!isMountedRef.current) return;
    
    const promises = Object.entries(apiCalls).map(async ([key, apiFunction]) => {
      cancelTokensRef.current[key] = createCancelTokenSource();
      
      setLoading(prev => ({ ...prev, [key]: true }));
      setErrors(prev => ({ ...prev, [key]: null }));

      try {
        const result = await apiFunction(cancelTokensRef.current[key]);
        
        if (!isMountedRef.current) return;
        
        setData(prev => ({ ...prev, [key]: result }));
      } catch (err) {
        if (!isMountedRef.current) return;
        
        if (err.name === 'CanceledError' || err.message?.includes('cancelled')) {
          return;
        }
        
        setErrors(prev => ({ ...prev, [key]: err }));
        
        if (showErrorToast) {
          const errorMessage = err.message || `Error in ${key}`;
          toast.error(errorMessage);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(prev => ({ ...prev, [key]: false }));
        }
      }
    });

    await Promise.allSettled(promises);
  }, [apiCalls, cleanup, showErrorToast]);

  useEffect(() => {
    if (immediate && isMountedRef.current) {
      executeAll();
    }
  }, [immediate, executeAll, ...dependencies]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    data,
    loading,
    errors,
    executeAll,
    refetchAll: executeAll,
  };
};

export default useApiCall;