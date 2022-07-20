import React, { useEffect, useState } from "react";
import Board from "./components/Board";
import Result from "./components/Result";
import AppContext from "./components/AppContext";

import "./styles.css";
import Configure from "./components/Configure";
import { IDimensions } from "./components/IDimensions";

const App = () => {
  const [dimensions, setDimensions] = useState<IDimensions>({ M: 3, N: 3 });

  const [dict, setDict] = useState<Set<string>>(new Set());

  const [grid, setGrid] = useState<string[][]>(
    Array(dimensions.M).fill(Array(dimensions.N).fill(null))
  );

  useEffect(() => {
    setGrid(Array(dimensions.M).fill(Array(dimensions.N).fill(null)));
  }, [dimensions]);

  return (
    <AppContext.Provider
      value={{
        grid,
        setGrid,
        dict,
        setDict,
        dimensions,
        setDimensions,
      }}
    >
      <div className="App">
        <Configure />
        <Board M={dimensions.M} N={dimensions.N} />
        <Result />
      </div>
    </AppContext.Provider>
  );
};

export default App;
