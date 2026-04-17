import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DraggableItem from '../DraggableItem';
import { TaskContext } from '../../context/TasksContext';
import type { Task } from '../../types/Task';

jest.mock('react-dnd', () => ({
  useDrag: () => [{}, jest.fn()],
  useDrop: () => [{}, jest.fn()],
}));

const baseTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'A task description',
  completed: false,
};

const renderItem = (
  taskOverrides: Partial<Task> = {},
  {
    tasks = [{ ...baseTask, ...taskOverrides }] as Task[],
    setTasks = jest.fn().mockResolvedValue(undefined),
    onEditTask = jest.fn(),
    selected = false,
    onToggleSelect = jest.fn(),
  } = {}
) => {
  const task = { ...baseTask, ...taskOverrides };
  return render(
    <TaskContext.Provider value={{ tasks, setTasks, loading: false, error: null }}>
      <ul>
        <DraggableItem
          {...task}
          index={0}
          onEditTask={onEditTask}
          selected={selected}
          onToggleSelect={onToggleSelect}
        />
      </ul>
    </TaskContext.Provider>
  );
};

describe('DraggableItem', () => {
  test('renders the task title', () => {
    renderItem();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('renders the task description', () => {
    renderItem();
    expect(screen.getByText('A task description')).toBeInTheDocument();
  });

  test('applies completed styling when task is done', () => {
    renderItem({ completed: true });
    expect(screen.getByText('Test Task')).toHaveClass('line-through');
  });

  test('clicking the edit button calls onEditTask with the task id', () => {
    const onEditTask = jest.fn();
    renderItem({}, { onEditTask });
    fireEvent.click(screen.getByRole('button', { name: /edit task: test task/i }));
    expect(onEditTask).toHaveBeenCalledWith('task-1');
  });

  test('clicking the complete button toggles the completed state', async () => {
    const setTasks = jest.fn().mockResolvedValue(undefined);
    renderItem({}, { setTasks });
    fireEvent.click(screen.getByRole('button', { name: /mark task .* as complete/i }));
    await waitFor(() => expect(setTasks).toHaveBeenCalled());
    const [[updatedTasks]] = setTasks.mock.calls;
    expect(updatedTasks[0].completed).toBe(true);
  });

  test('delete button opens the confirm dialog', () => {
    renderItem();
    fireEvent.click(screen.getByRole('button', { name: /delete task: test task/i }));
    expect(screen.getByText('Delete task?')).toBeInTheDocument();
  });

  test('confirming delete removes the task', async () => {
    const setTasks = jest.fn().mockResolvedValue(undefined);
    renderItem({}, { setTasks });
    fireEvent.click(screen.getByRole('button', { name: /delete task: test task/i }));
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => expect(setTasks).toHaveBeenCalledWith([]));
  });

  test('cancelling delete closes the dialog without calling setTasks', () => {
    const setTasks = jest.fn().mockResolvedValue(undefined);
    renderItem({}, { setTasks });
    fireEvent.click(screen.getByRole('button', { name: /delete task: test task/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(setTasks).not.toHaveBeenCalled();
    expect(screen.queryByText('Delete task?')).not.toBeInTheDocument();
  });
});
