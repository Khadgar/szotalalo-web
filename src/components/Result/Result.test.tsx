import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AppContext from '../../contexts/AppContext';
import { Trie } from '../../utils/Trie';
import { IDimensions } from '../IDimensions';
import Result from './Result';

const MockAppContextProvider = ({ children, value }: any) => (
  <AppContext.Provider value={value}>{children}</AppContext.Provider>
);

describe('Result', () => {
  test('Renders <Result> component', () => {
    const mockContext = {
      grid: [[]],
      setGrid: jest.fn(),
      dict: {} as Trie,
      setDict: jest.fn(),
      dimensions: {} as IDimensions,
      setDimensions: jest.fn(),
      language: 'ENG' as 'ENG' | 'HUN',
      setLanguage: jest.fn(),
      results: ['apple'],
      setResults: jest.fn(),
    };

    render(
      <MockAppContextProvider value={mockContext}>
        <Result />
      </MockAppContextProvider>
    );
    expect(screen.getByText('Found 1 words')).toBeInTheDocument();
    expect(screen.getByText('apple (5)')).toBeInTheDocument();
  });
});
