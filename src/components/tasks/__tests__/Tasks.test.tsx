import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Tasks from '../index';
import { TaskContext } from '../../context/TasksContext';
import { SnackContext } from '../../context/SnackContext';
import type { Task } from '../../types/Task';

jest.mock('react-dnd', () => ({
  useDrag: () => [{}, jest.fn()],
  useDrop: () => [{}, jest.fn()],
  DndProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: {},
}));

jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));

const sampleTasks: Task[] = [
  { id: 't1', title: 'First task', completed: false },
  { id: 't2', title: 'Second task', completed: true },
];

const renderTasks = ({
  tasks = [] as Task[],
  setTasks = jest.fn().mockResolvedValue(undefined),
  loading = false,
  error = null as string | null,
} = {}) =>
  render(
    <SnackContext.Provider value={{ message: '', setMessage: jest.fn() }}>
      <TaskContext.Provider value={{ tasks, setTasks, loading, error }}>
        <Tasks />
      </TaskContext.Provider>
    </SnackContext.Provider>
  );

describe('Tasks', () => {
  test('shows loading spinner when loading', () => {
    renderTasks({ loading: true });
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('shows error message when there is an error', () => {
    renderTasks({ error: 'Storage failed' });
    expect(screen.getByText('Error loading tasks')).toBeInTheDocument();
    expect(screen.getByText('Storage failed')).toBeInTheDocument();
  });

  test('shows empty state when there are no tasks', () => {
    renderTasks();
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  test('renders task titles when tasks exist', () => {
    renderTasks({ tasks: sampleTasks });
    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();
  });

  test('add button opens the new task dialog', () => {
    renderTasks({ tasks: sampleTasks });
    fireEvent.click(screen.getByRole('button', { name: 'Add new task' }));
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });

  test('sort button cycles through sort order labels', () => {
    renderTasks({ tasks: sampleTasks });
    const sortBtn = screen.getByRole('button', { name: 'Cycle sort order' });

    expect(screen.getByText(/manual order/i)).toBeInTheDocument();
    fireEvent.click(sortBtn);
    expect(screen.getByText(/active first/i)).toBeInTheDocument();
    fireEvent.click(sortBtn);
    expect(screen.getByText(/done first/i)).toBeInTheDocument();
    fireEvent.click(sortBtn);
    expect(screen.getByText(/manual order/i)).toBeInTheDocument();
  });

  test('selecting a task shows the selection toolbar', () => {
    renderTasks({ tasks: sampleTasks });
    const checkbox = screen.getByRole('checkbox', { name: /select task "first task"/i });
    fireEvent.click(checkbox);
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  test('delete selected button opens confirm dialog', () => {
    renderTasks({ tasks: sampleTasks });
    fireEvent.click(screen.getByRole('checkbox', { name: /select task "first task"/i }));
    // Toolbar button has accessible name "Delete" (exact); individual-item buttons
    // have aria-label "Delete task: …" — so this uniquely targets the toolbar button.
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByText(/delete 1 task\?/i)).toBeInTheDocument();
  });

  test('confirming bulk delete calls setTasks without the selected task', async () => {
    const setTasks = jest.fn().mockResolvedValue(undefined);
    renderTasks({ tasks: sampleTasks, setTasks });

    fireEvent.click(screen.getByRole('checkbox', { name: /select task "first task"/i }));
    // Open the confirm dialog via the toolbar Delete button
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    // After the dialog opens there are two "Delete" buttons (toolbar + dialog footer).
    // Scope to the dialog to avoid ambiguity.
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(setTasks).toHaveBeenCalled());
    const [[remaining]] = setTasks.mock.calls;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('t2');
  });
});
