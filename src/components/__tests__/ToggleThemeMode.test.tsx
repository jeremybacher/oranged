import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToggleThemeMode } from '../ToggleThemeMode';
import { TooltipProvider } from '../ui/tooltip';

const renderToggle = (mode: string, toggle = jest.fn()) =>
  render(
    <TooltipProvider>
      <ToggleThemeMode mode={mode} toggleThemeMode={toggle} />
    </TooltipProvider>
  );

describe('ToggleThemeMode', () => {
  test('shows "Switch to dark mode" label in light mode', () => {
    renderToggle('light');
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
  });

  test('shows "Switch to light mode" label in dark mode', () => {
    renderToggle('dark');
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
  });

  test('calls toggleThemeMode when the button is clicked', () => {
    const toggle = jest.fn();
    renderToggle('light', toggle);
    fireEvent.click(screen.getByRole('button'));
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});
