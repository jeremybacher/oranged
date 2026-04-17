import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DialogTask from '../DialogTask';
import { TaskContext } from '../../context/TasksContext';
import { SnackContext } from '../../context/SnackContext';
import type { Task } from '../../types/Task';
import type { DialogTaskData } from '../../types/DialogTaskData';

jest.mock('uuid', () => ({ v4: () => 'new-task-id' }));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));

const setMessageMock = jest.fn();
const setTasksMock = jest.fn().mockResolvedValue(undefined);

const existingTask: Task = {
  id: 'task-1',
  title: 'Existing Task',
  description: 'Existing description',
  completed: false,
};

const renderDialog = (
  dialogData: DialogTaskData,
  {
    tasks = [] as Task[],
    setTasks = setTasksMock,
    setDialogTaskData = jest.fn(),
  } = {}
) =>
  render(
    <SnackContext.Provider value={{ message: '', setMessage: setMessageMock }}>
      <TaskContext.Provider value={{ tasks, setTasks, loading: false, error: null }}>
        <DialogTask dialogTaskData={dialogData} setDialogTaskData={setDialogTaskData} />
      </TaskContext.Provider>
    </SnackContext.Provider>
  );

beforeEach(() => jest.clearAllMocks());

describe('DialogTask', () => {
  test('shows "New Task" title for a create dialog', () => {
    renderDialog({ openDialog: true });
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create task' })).toBeInTheDocument();
  });

  test('shows "Edit Task" title when editing an existing task', () => {
    renderDialog({ openDialog: true, editableTaskId: 'task-1' }, { tasks: [existingTask] });
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  test('pre-fills the form fields when editing', () => {
    renderDialog({ openDialog: true, editableTaskId: 'task-1' }, { tasks: [existingTask] });
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
  });

  test('shows a validation error when the title is empty', async () => {
    renderDialog({ openDialog: true });
    fireEvent.click(screen.getByRole('button', { name: 'Create task' }));
    await waitFor(() =>
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    );
  });

  test('closes the dialog when Cancel is clicked', () => {
    const setDialogTaskData = jest.fn();
    renderDialog({ openDialog: true }, { setDialogTaskData });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(setDialogTaskData).toHaveBeenCalledWith({ openDialog: false });
  });

  test('creates a new task on valid submit', async () => {
    const setTasks = jest.fn().mockResolvedValue(undefined);
    const setDialogTaskData = jest.fn();
    renderDialog({ openDialog: true }, { setTasks, setDialogTaskData });

    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    fireEvent.change(titleInput, { target: { value: 'Brand new task' } });
    fireEvent.submit(titleInput.closest('form')!);

    await waitFor(() => expect(setTasks).toHaveBeenCalled());
    const [[savedTasks]] = setTasks.mock.calls;
    expect(savedTasks[0]).toMatchObject({
      id: 'new-task-id',
      title: 'Brand new task',
      completed: false,
    });
  });

  test('edits an existing task on valid submit', async () => {
    const setTasks = jest.fn().mockResolvedValue(undefined);
    renderDialog(
      { openDialog: true, editableTaskId: 'task-1' },
      { tasks: [existingTask], setTasks }
    );

    const titleInput = screen.getByDisplayValue('Existing Task');
    fireEvent.change(titleInput, { target: { value: 'Updated title' } });
    fireEvent.submit(titleInput.closest('form')!);

    await waitFor(() => expect(setTasks).toHaveBeenCalled());
    const [[savedTasks]] = setTasks.mock.calls;
    expect(savedTasks[0]).toMatchObject({ id: 'task-1', title: 'Updated title' });
  });

  test('shows a snack message when the 10-task limit is reached', async () => {
    const tenTasks = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      completed: false,
    })) as Task[];

    renderDialog({ openDialog: true }, { tasks: tenTasks });
    fireEvent.submit(
      screen.getByPlaceholderText('What needs to be done?').closest('form')!
    );

    await waitFor(() =>
      expect(setMessageMock).toHaveBeenCalledWith(
        'You have reached the limit of 10 tasks. Delete one to create a new one.'
      )
    );
  });
});
