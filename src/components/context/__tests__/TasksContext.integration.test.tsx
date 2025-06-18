import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TaskProvider, TaskContext } from '../TasksContext';

// Create a theme for testing
const theme = createTheme();

// Test component that displays loading state
const LoadingTestComponent = () => {
  const { loading, tasks, error } = React.useContext(TaskContext);
  
  return (
    <div>
      <div data-testid="loading-state">{loading ? 'true' : 'false'}</div>
      <div data-testid="tasks-length">{tasks.length}</div>
      <div data-testid="error-state">{error || 'null'}</div>
    </div>
  );
};

describe('TasksContext Integration', () => {
  test('loading state should quickly become false when chrome storage is unavailable', async () => {
    render(
      <ThemeProvider theme={theme}>
        <TaskProvider>
          <LoadingTestComponent />
        </TaskProvider>
      </ThemeProvider>
    );

    // Since chrome storage is not available in tests, loading should quickly become false
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    }, { timeout: 1000 }); // 1 second should be plenty

    // Should have tasks array (empty by default)
    expect(screen.getByTestId('tasks-length')).toHaveTextContent('0');
    
    // Should not have error
    expect(screen.getByTestId('error-state')).toHaveTextContent('null');
  });

  test('loading state handles the unavailable chrome storage gracefully', () => {
    render(
      <ThemeProvider theme={theme}>
        <TaskProvider>
          <LoadingTestComponent />
        </TaskProvider>
      </ThemeProvider>
    );

    // Loading should be false because chrome storage is not available
    // and the hook should fall back to the default value immediately
    expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    expect(screen.getByTestId('tasks-length')).toHaveTextContent('0');
    expect(screen.getByTestId('error-state')).toHaveTextContent('null');
  });
});
