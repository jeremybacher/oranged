import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renders with default props', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    const customMessage = 'Please wait...';
    render(<LoadingSpinner message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  test('renders without message when message is empty', () => {
    render(<LoadingSpinner message="" />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('applies fullHeight styling when fullHeight prop is true', () => {
    const { container } = render(<LoadingSpinner fullHeight={true} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('h-[70vh]');
  });

  test('renders spinner and message together', () => {
    const message = 'Processing data...';
    render(<LoadingSpinner message={message} />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
