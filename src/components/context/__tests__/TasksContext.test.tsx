import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskContext, TaskProvider } from '../TasksContext';

// Mock the useStorage hook
jest.mock('../../hooks/useStorage', () => ({
  useJSONStorage: jest.fn(),
}));

import { useJSONStorage } from '../../hooks/useStorage';
const mockUseJSONStorage = useJSONStorage as jest.MockedFunction<typeof useJSONStorage>;

describe('TasksContext', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementation
    mockUseJSONStorage.mockReturnValue({
      value: [],
      setValue: jest.fn(),
      loading: true, // This is the issue - it stays true!
      error: null,
    });
  });

  test('should provide loading state that becomes false', async () => {
    // First, test the loading state
    const TestComponent = () => {
      const { loading, tasks } = React.useContext(TaskContext);
      return (
        <div>
          <div data-testid="loading">{loading ? 'Loading...' : 'Loaded'}</div>
          <div data-testid="tasks-count">{tasks.length}</div>
        </div>
      );
    };

    const { rerender } = render(
      <TaskProvider>
        <TestComponent />
      </TaskProvider>
    );

    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');
    
    // Now mock the loading to be false
    mockUseJSONStorage.mockReturnValue({
      value: [
        { id: '1', text: 'Test task', completed: false, createdAt: new Date() },
      ],
      setValue: jest.fn(),
      loading: false, // Now it's false
      error: null,
    });

    // Re-render to trigger the new mock
    rerender(
      <TaskProvider>
        <TestComponent />
      </TaskProvider>
    );

    // Should now show loaded state
    expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
  });

  test('should handle empty tasks array correctly', () => {
    mockUseJSONStorage.mockReturnValue({
      value: null, // This could be null initially
      setValue: jest.fn(),
      loading: false,
      error: null,
    });

    const TestComponent = () => {
      const { tasks, loading } = React.useContext(TaskContext);
      return (
        <div>
          <div data-testid="loading">{loading ? 'Loading...' : 'Loaded'}</div>
          <div data-testid="tasks-count">{tasks.length}</div>
        </div>
      );
    };

    render(
      <TaskProvider>
        <TestComponent />
      </TaskProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
  });

  test('should update document title based on uncompleted tasks', () => {
    const originalTitle = document.title;
    
    mockUseJSONStorage.mockReturnValue({
      value: [
        { id: '1', text: 'Task 1', completed: false, createdAt: new Date() },
        { id: '2', text: 'Task 2', completed: true, createdAt: new Date() },
        { id: '3', text: 'Task 3', completed: false, createdAt: new Date() },
      ],
      setValue: jest.fn(),
      loading: false,
      error: null,
    });

    const TestComponent = () => {
      React.useContext(TaskContext);
      return <div>Test</div>;
    };

    render(
      <TaskProvider>
        <TestComponent />
      </TaskProvider>
    );

    // Should show count of uncompleted tasks (2)
    expect(document.title).toBe("(2) New Tab - Let's be organized!");
    
    // Restore original title
    document.title = originalTitle;
  });
});
