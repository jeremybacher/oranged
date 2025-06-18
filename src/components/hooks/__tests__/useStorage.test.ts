import { renderHook, waitFor, act } from '@testing-library/react';
import { useJSONStorage } from '../useStorage';

interface TestTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

describe('useJSONStorage', () => {
  beforeEach(() => {
    // Clear any existing chrome global
    delete (global as any).chrome;
    
    // Clear console warnings for cleaner test output
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should handle missing chrome storage API gracefully', async () => {
    const { result } = renderHook(() => 
      useJSONStorage<TestTask[]>('tasks', [])
    );

    // Wait for the hook to resolve
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should use default value when chrome storage is not available
    expect(result.current.value).toEqual([]);
    expect(result.current.error).toBe(null);
    expect(console.warn).toHaveBeenCalledWith(
      'Chrome storage API not available, using default value'
    );
  });

  test('should handle setValue when chrome storage is not available', async () => {
    const { result } = renderHook(() => 
      useJSONStorage<TestTask[]>('tasks', [])
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should be able to set value even without chrome storage
    const newTasks: TestTask[] = [{ id: '1', text: 'Test task', completed: false, createdAt: new Date() }];
    
    await act(async () => {
      await result.current.setValue(newTasks);
    });
    
    expect(result.current.value).toEqual(newTasks);
    expect(console.warn).toHaveBeenCalledWith(
      'Chrome storage API not available, value will not persist'
    );
  });

  test('should work with mock chrome storage', async () => {
    // Mock chrome storage
    const mockChromeStorage = {
      sync: {
        get: jest.fn((keys, callback) => {
          callback({ tasks: '[]' });
        }),
        set: jest.fn((data, callback) => {
          callback();
        }),
      },
      storage: {
        sync: {
          get: jest.fn((keys, callback) => {
            callback({ tasks: '[]' });
          }),
          set: jest.fn((data, callback) => {
            callback();
          }),
        }
      },
      runtime: {
        lastError: null,
      },
    };

    (global as any).chrome = mockChromeStorage;

    const { result } = renderHook(() => 
      useJSONStorage<TestTask[]>('tasks', [])
    );

    // Wait for the hook to resolve
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.value).toEqual([]);
    expect(result.current.error).toBe(null);
    expect(mockChromeStorage.storage.sync.get).toHaveBeenCalledWith(['tasks'], expect.any(Function));
  });

  test('should handle chrome storage errors', async () => {
    // Mock chrome storage with error
    const mockChromeStorage = {
      storage: {
        sync: {
          get: jest.fn((keys, callback) => {
            callback({});
          }),
          set: jest.fn((data, callback) => {
            callback();
          }),
        }
      },
      runtime: {
        lastError: { message: 'Storage quota exceeded' },
      },
    };

    (global as any).chrome = mockChromeStorage;

    const { result } = renderHook(() => 
      useJSONStorage<TestTask[]>('tasks', [])
    );

    // Wait for the hook to resolve
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Storage quota exceeded');
    expect(result.current.value).toEqual([]); // Should still use default value
  });
});
