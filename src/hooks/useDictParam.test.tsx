import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useDictParam } from './useDictParam';
import '../i18n';

const wrapper =
  (initial: string) =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>
  );

describe('useDictParam', () => {
  it('parses ?dict=hu', () => {
    const { result } = renderHook(() => useDictParam(), { wrapper: wrapper('/?dict=hu') });
    expect(result.current[0]).toBe('hu');
  });

  it('parses ?dict=en', () => {
    const { result } = renderHook(() => useDictParam(), { wrapper: wrapper('/?dict=en') });
    expect(result.current[0]).toBe('en');
  });

  it('falls back when missing', () => {
    const { result } = renderHook(() => useDictParam(), { wrapper: wrapper('/') });
    expect(['hu', 'en']).toContain(result.current[0]);
  });

  it('ignores invalid values', () => {
    const { result } = renderHook(() => useDictParam(), { wrapper: wrapper('/?dict=xx') });
    expect(['hu', 'en']).toContain(result.current[0]);
  });
});
