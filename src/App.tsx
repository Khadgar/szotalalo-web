import React, { useState } from 'react';
// import Board from './components/Board/Board';
import styled from 'styled-components';
import Result from './components/Result/Result';
import AppContext, { Languages } from './contexts/AppContext';
import Configure from './components/Configure/Configure';
import { IDimensions } from './components/IDimensions';
import { Trie } from './utils/Trie';
import InteractiveBoard from './components/InteractiveBoard/InteractiveBoard';

const ConfigureWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 10vh;
`;

const BoardWrapper = styled.div`
  display: flex;
  height: 80vh;
  width: 100vw;
`;

const ResultWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 10vh;
`;

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

const App = () => {
  const [dimensions, setDimensions] = useState<IDimensions>({ m: 3, n: 3 });

  const [dict, setDict] = useState<Trie>(new Trie());

  const [grid, setGrid] = useState<string[][]>(
    Array(dimensions.m).fill(Array(dimensions.n).fill(null))
  );

  const [language, setLanguage] = useState<Languages>('HUN');

  const [results, setResults] = useState<string[]>([]);

  return (
    <AppContext.Provider
      value={{
        grid,
        setGrid,
        dict,
        setDict,
        dimensions,
        setDimensions,
        language,
        setLanguage,
        results,
        setResults,
      }}
    >
      <AppWrapper>
        <ConfigureWrapper>
          <Configure />
        </ConfigureWrapper>
        {/* <Board /> */}
        <BoardWrapper>
          <InteractiveBoard />
        </BoardWrapper>
        <ResultWrapper>
          <Result />
        </ResultWrapper>
      </AppWrapper>
    </AppContext.Provider>
  );
};

export default App;
