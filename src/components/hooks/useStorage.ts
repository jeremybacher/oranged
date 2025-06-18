import { useState, useEffect, useCallback, useRef } from 'react';

type ChromeStorageKey = 'tasks' | 'note' | 'themeMode' | 'activeTab';

interface UseStorageResult<T> {
  value: T | null;
  setValue: (value: T) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useStorage<T>(
  key: ChromeStorageKey,
  defaultValue: T
): UseStorageResult<T> {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store default value to avoid dependency issues
  const defaultValueRef = useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  useEffect(() => {
    const loadValue = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if chrome storage is available
        if (typeof chrome === 'undefined' || !chrome.storage) {
          console.warn('Chrome storage API not available, using default value');
          setValue(defaultValueRef.current);
          setLoading(false);
          return;
        }
        
        const result = await new Promise<Record<string, any>>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Chrome storage timeout'));
          }, 5000); // 5 second timeout
          
          chrome.storage.sync.get([key], (result) => {
            clearTimeout(timeoutId);
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(result);
            }
          });
        });

        const storedValue = result[key];
        if (storedValue !== undefined) {
          setValue(storedValue);
        } else {
          setValue(defaultValueRef.current);
        }
      } catch (err) {
        console.error(`Failed to load ${key} from storage:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setValue(defaultValueRef.current);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]); // Remove defaultValue from dependency array

  const updateValue = useCallback(async (newValue: T) => {
    try {
      setError(null);
      
      // Check if chrome storage is available
      if (typeof chrome === 'undefined' || !chrome.storage) {
        console.warn('Chrome storage API not available, value will not persist');
        setValue(newValue);
        return;
      }
      
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Chrome storage timeout'));
        }, 5000); // 5 second timeout
        
        chrome.storage.sync.set({ [key]: newValue }, () => {
          clearTimeout(timeoutId);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });

      setValue(newValue);
    } catch (err) {
      console.error(`Failed to save ${key} to storage:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [key]);

  return {
    value,
    setValue: updateValue,
    loading,
    error
  };
}

// Specialized hook for JSON storage
export function useJSONStorage<T>(
  key: ChromeStorageKey,
  defaultValue: T
): UseStorageResult<T> {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store default value to avoid dependency issues
  const defaultValueRef = useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  useEffect(() => {
    const loadValue = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if chrome storage is available
        if (typeof chrome === 'undefined' || !chrome.storage) {
          console.warn('Chrome storage API not available, using default value');
          setValue(defaultValueRef.current);
          setLoading(false);
          return;
        }
        
        const result = await new Promise<Record<string, any>>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Chrome storage timeout'));
          }, 5000); // 5 second timeout
          
          chrome.storage.sync.get([key], (result) => {
            clearTimeout(timeoutId);
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(result);
            }
          });
        });

        const storedValue = result[key];
        if (storedValue !== undefined) {
          const parsedValue = typeof storedValue === 'string' 
            ? JSON.parse(storedValue) 
            : storedValue;
          setValue(parsedValue);
        } else {
          setValue(defaultValueRef.current);
        }
      } catch (err) {
        console.error(`Failed to load ${key} from storage:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setValue(defaultValueRef.current);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]); // Remove defaultValue from dependency array

  const updateValue = useCallback(async (newValue: T) => {
    try {
      setError(null);
      
      // Check if chrome storage is available
      if (typeof chrome === 'undefined' || !chrome.storage) {
        console.warn('Chrome storage API not available, value will not persist');
        setValue(newValue);
        return;
      }
      
      const serializedValue = JSON.stringify(newValue);
      
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Chrome storage timeout'));
        }, 5000); // 5 second timeout
        
        chrome.storage.sync.set({ [key]: serializedValue }, () => {
          clearTimeout(timeoutId);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });

      setValue(newValue);
    } catch (err) {
      console.error(`Failed to save ${key} to storage:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [key]);

  return {
    value,
    setValue: updateValue,
    loading,
    error
  };
}
