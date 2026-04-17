import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TaskProvider, TaskContext } from '../TasksContext';

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
      <TaskProvider>
        <LoadingTestComponent />
      </TaskProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    }, { timeout: 1000 });

    expect(screen.getByTestId('tasks-length')).toHaveTextContent('0');
    expect(screen.getByTestId('error-state')).toHaveTextContent('null');
  });

  test('loading state handles the unavailable chrome storage gracefully', () => {
    render(
      <TaskProvider>
        <LoadingTestComponent />
      </TaskProvider>
    );

    expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    expect(screen.getByTestId('tasks-length')).toHaveTextContent('0');
    expect(screen.getByTestId('error-state')).toHaveTextContent('null');
  });
});
