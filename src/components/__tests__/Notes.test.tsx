import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Notes from '../Notes';
import { TooltipProvider } from '../ui/tooltip';

// Use Node's Buffer so encode/decode matches how the component serialises notes
jest.mock('base-64', () => ({
  encode: (s: string) => Buffer.from(s).toString('base64'),
  decode: (s: string) => Buffer.from(s, 'base64').toString('utf-8'),
}));

// requestAnimationFrame is used by the toolbar's cursor-restore logic
global.requestAnimationFrame = jest.fn((cb) => { cb(0); return 0; });

const mockGet = jest.fn();
const mockSet = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (global as Record<string, unknown>).chrome = {
    storage: { sync: { get: mockGet, set: mockSet } },
  };
});

afterEach(() => {
  delete (global as Record<string, unknown>).chrome;
});

const renderNotes = () =>
  render(
    <TooltipProvider>
      <Notes />
    </TooltipProvider>
  );

/** Encode a string the same way Notes.tsx stores it in chrome.storage */
const encodeNote = (text: string) =>
  Buffer.from(JSON.stringify(text)).toString('base64');

describe('Notes', () => {
  test('shows loading state before chrome storage resolves', () => {
    mockGet.mockImplementation(() => {}); // never calls callback
    renderNotes();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows placeholder when note is empty', async () => {
    mockGet.mockImplementation((_keys: unknown, cb: (r: Record<string, unknown>) => void) =>
      cb({})
    );
    renderNotes();
    await waitFor(() =>
      expect(screen.getByText('Start typing your notes here...')).toBeInTheDocument()
    );
  });

  test('renders saved note content in view mode', async () => {
    mockGet.mockImplementation((_keys: unknown, cb: (r: Record<string, unknown>) => void) =>
      cb({ note: encodeNote('My saved note') })
    );
    renderNotes();
    await waitFor(() =>
      expect(screen.getByText('My saved note')).toBeInTheDocument()
    );
  });

  test('clicking the view area enters edit mode', async () => {
    mockGet.mockImplementation((_keys: unknown, cb: (r: Record<string, unknown>) => void) =>
      cb({})
    );
    renderNotes();
    await waitFor(() => screen.getByRole('button', { name: 'Edit note' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit note' }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('blurring the textarea exits edit mode', async () => {
    mockGet.mockImplementation((_keys: unknown, cb: (r: Record<string, unknown>) => void) =>
      cb({})
    );
    renderNotes();
    await waitFor(() => screen.getByRole('button', { name: 'Edit note' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit note' }));
    fireEvent.blur(screen.getByRole('textbox'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  test('typing in edit mode debounces a save to chrome storage', async () => {
    mockGet.mockImplementation((_keys: unknown, cb: (r: Record<string, unknown>) => void) =>
      cb({})
    );
    mockSet.mockImplementation(() => {});

    renderNotes();
    // Wait for the component to finish loading before enabling fake timers,
    // otherwise waitFor's internal setTimeout polling never fires.
    await waitFor(() => screen.getByRole('button', { name: 'Edit note' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit note' }));

    jest.useFakeTimers();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello notes' } });
    jest.runAllTimers();
    jest.useRealTimers();

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ note: expect.any(String) })
    );
  });

  test('toolbar buttons are visible in edit mode', async () => {
    mockGet.mockImplementation((_keys: unknown, cb: (r: Record<string, unknown>) => void) =>
      cb({})
    );
    renderNotes();
    await waitFor(() => screen.getByRole('button', { name: 'Edit note' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit note' }));
    expect(screen.getByRole('button', { name: 'Bold (Ctrl+B)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Italic (Ctrl+I)' })).toBeInTheDocument();
  });
});
