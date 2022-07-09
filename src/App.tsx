import React, { useState } from "react";
import Board from "./components/Board";
import Result from "./components/Result";
import AppContext from "./components/AppContext";

import "./styles.css";

const M = 3;
const N = 3;

const App = () => {
  const [grid, setGrid] = useState<string[][]>(
    Array(M).fill(Array(N).fill(null))
  );

  const [dict, setDict] = useState<Set<string>>(new Set());

  return (
    <AppContext.Provider value={{ grid, setGrid, M, N, dict, setDict }}>
      <div className="App">
        <Board M={M} N={N} />
        <Result />
      </div>
    </AppContext.Provider>
  );
};

export default App;
