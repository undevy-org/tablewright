import { describe, expect, it } from 'vitest';
import { displayTokenValue } from './design-tokens-display';

describe('displayTokenValue', () => {
  it('returns light value when theme is light', () => {
    expect(
      displayTokenValue(
        { value: '#6b7280', modes: { dark: '#cbd5e1' } },
        'light',
      ),
    ).toBe('#6b7280');
  });

  it('returns dark mode value when theme is dark', () => {
    expect(
      displayTokenValue(
        { value: '#6b7280', modes: { dark: '#cbd5e1' } },
        'dark',
      ),
    ).toBe('#cbd5e1');
  });

  it('falls back to light value in dark theme when no dark mode', () => {
    expect(displayTokenValue({ value: 8, unit: 'px' }, 'dark')).toBe('8px');
  });

  it('does not treat string color values as numbers with units', () => {
    expect(displayTokenValue({ value: '#ffffff', unit: 'px' }, 'light')).toBe('#ffffff');
  });
});
