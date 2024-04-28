import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AppContext, { IAppContext } from '../../contexts/AppContext';
import appDict from '../../../public/szokereso_dict_1.5.53.json';
import { findWords } from '../../utils/solver';
import { Trie } from '../../utils/Trie';
import { IDimensions } from '../IDimensions';
import Configure from './Configure';

// Create a mock context provider
const MockAppContextProvider = ({ children, value }: any) => (
  <AppContext.Provider value={value}>{children}</AppContext.Provider>
);

describe('<Configure> component tests', () => {
  let mockGrid = [[]];

  const mockDict = new Trie();

  let mockDimensions = {} as IDimensions;

  let mockResults = [] as string[];

  let mockContext = {} as IAppContext;

  beforeEach(() => {
    global.fetch = jest.fn();
    mockGrid = [
      ['a', 'l', 'm'],
      ['a', 'k', 'a'],
      ['c', 's', 'a'],
    ] as never[][];
    mockDict.from(appDict);
    mockDimensions = { m: 3, n: 3 };
    mockResults = findWords(mockGrid, mockDict, [], mockDimensions.m, mockDimensions.n).sort(
      (a, b) => b.length - a.length
    );
    mockContext = {
      grid: mockGrid,
      setGrid: jest.fn(),
      dict: mockDict,
      setDict: jest.fn(),
      dimensions: mockDimensions,
      setDimensions: jest.fn(),
      language: 'HUN' as 'ENG' | 'HUN',
      setLanguage: jest.fn(),
      results: mockResults,
      setResults: jest.fn(),
    };
  });

  // Call cleanup after each test
  afterEach(cleanup);

  test('Render <Configure> Component', () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(
      () =>
        Promise.resolve({
          json: () => Promise.resolve(appDict),
        }) as Promise<Response>
    );

    render(
      <MockAppContextProvider value={mockContext}>
        <Configure />
      </MockAppContextProvider>
    );

    expect(mockContext.setResults).toHaveBeenCalledTimes(1);
    expect(screen.getByText('3x3')).toBeInTheDocument();
    expect(screen.getByText('4x4')).toBeInTheDocument();
    expect(screen.getByText('5x5')).toBeInTheDocument();
    expect(screen.getByText('6x6')).toBeInTheDocument();
    expect(screen.getByText('7x7')).toBeInTheDocument();
    expect(screen.getByText('8x8')).toBeInTheDocument();
    expect(screen.getByText('Rand')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockContext.setGrid).toHaveBeenCalledTimes(0);
  });

  test('Trigger click on Rand button', () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(
      () =>
        Promise.resolve({
          json: () => Promise.resolve(appDict),
        }) as Promise<Response>
    );

    const ConfigureComponent = render(
      <MockAppContextProvider value={mockContext}>
        <Configure />
      </MockAppContextProvider>
    );

    fireEvent.click(ConfigureComponent.getByText('Rand'));
    expect(mockContext.setGrid).toHaveBeenCalledTimes(1);
  });

  test('Check if useEffect is called when the user click on Rand', () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(
      () =>
        Promise.resolve({
          json: () => Promise.resolve(appDict),
        }) as Promise<Response>
    );

    jest.spyOn(React, 'useEffect').mockImplementationOnce((f) => f());

    const ConfigureComponent = render(
      <MockAppContextProvider value={mockContext}>
        <Configure />
      </MockAppContextProvider>
    );

    fireEvent.click(ConfigureComponent.getByText('Rand'));
    expect(mockContext.setResults).toHaveBeenCalledTimes(1);
  });
});
