import React from 'react';
import { render } from '@testing-library/react';
import { renderWithLinks } from '../renderWithLinks';

describe('renderWithLinks', () => {
  test('returns plain text unchanged', () => {
    const result = renderWithLinks('hello world');
    expect(result).toEqual(['hello world']);
  });

  test('turns an https URL into an anchor', () => {
    const { container } = render(
      <span>{renderWithLinks('visit https://example.com today')}</span>
    );
    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link!.getAttribute('href')).toBe('https://example.com');
    expect(link!.textContent).toBe('https://example.com');
  });

  test('adds https:// prefix to a bare domain', () => {
    const { container } = render(
      <span>{renderWithLinks('check example.com out')}</span>
    );
    const link = container.querySelector('a');
    expect(link!.getAttribute('href')).toBe('https://example.com');
    expect(link!.textContent).toBe('example.com');
  });

  test('links open in a new tab with noopener', () => {
    const { container } = render(
      <span>{renderWithLinks('https://example.com')}</span>
    );
    const link = container.querySelector('a')!;
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  test('handles multiple URLs in one string', () => {
    const { container } = render(
      <span>{renderWithLinks('see https://foo.com and https://bar.com')}</span>
    );
    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe('https://foo.com');
    expect(links[1].getAttribute('href')).toBe('https://bar.com');
  });

  test('does not linkify plain text without a dot', () => {
    const { container } = render(
      <span>{renderWithLinks('just plain text here')}</span>
    );
    expect(container.querySelector('a')).toBeNull();
  });
});
