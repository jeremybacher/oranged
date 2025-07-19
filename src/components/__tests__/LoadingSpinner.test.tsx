import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoadingSpinner from '../LoadingSpinner';

// Create a theme for testing
const theme = createTheme();

// Wrapper component with theme provider
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('LoadingSpinner', () => {
  test('renders with default props', () => {
    renderWithTheme(<LoadingSpinner />);
    
    // Check if the default loading message is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Check if the circular progress is rendered
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    const customMessage = 'Please wait...';
    renderWithTheme(<LoadingSpinner message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  test('renders without message when message is empty', () => {
    renderWithTheme(<LoadingSpinner message="" />);
    
    // Should not render any text when message is empty
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    
    // But progress bar should still be there
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
  });

  test('renders with custom size', () => {
    renderWithTheme(<LoadingSpinner size={60} />);
    
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
  });

  test('applies fullHeight styling when fullHeight prop is true', () => {
    const { container } = renderWithTheme(<LoadingSpinner fullHeight={true} />);
    
    // The Box component should have specific styling applied
    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement).toHaveStyle({
      display: 'flex',
      'flex-direction': 'column',
      'align-items': 'center',
      'justify-content': 'center'
    });
  });

  test('renders progress bar and message together', () => {
    const message = 'Processing data...';
    renderWithTheme(<LoadingSpinner message={message} size={50} />);
    
    // Both elements should be present
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
