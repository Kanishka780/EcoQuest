import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from './useThemeStore';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('useThemeStore', () => {
  beforeEach(() => {
    window.document.documentElement.classList.remove('light', 'dark');
    useThemeStore.setState({ theme: 'dark' });
    localStorage.clear();
  });

  it('defaults to dark theme', () => {
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('setTheme updates state and persists to localStorage', () => {
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
    expect(localStorage.getItem('eq_theme')).toBe('light');
  });

  it('applyTheme adds the "dark" class for dark theme', () => {
    useThemeStore.getState().setTheme('dark');
    expect(window.document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.document.documentElement.classList.contains('light')).toBe(false);
  });

  it('applyTheme adds the "light" class for light theme', () => {
    useThemeStore.getState().setTheme('light');
    expect(window.document.documentElement.classList.contains('light')).toBe(true);
    expect(window.document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('applyTheme resolves "system" to dark when OS prefers dark', () => {
    mockMatchMedia(true);
    useThemeStore.getState().setTheme('system');
    expect(window.document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applyTheme resolves "system" to light when OS prefers light', () => {
    mockMatchMedia(false);
    useThemeStore.getState().setTheme('system');
    expect(window.document.documentElement.classList.contains('light')).toBe(true);
  });

  it('removes the previously applied class before applying the new one', () => {
    useThemeStore.getState().setTheme('dark');
    useThemeStore.getState().setTheme('light');
    expect(window.document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.document.documentElement.classList.contains('light')).toBe(true);
  });
});
