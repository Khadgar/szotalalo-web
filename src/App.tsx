import React, { useEffect, useState } from "react";
import Board from "./components/Board";
import Result from "./components/Result";
import AppContext, { Languages } from "./components/AppContext";

import "./styles.css";
import Configure from "./components/Configure";
import { IDimensions } from "./components/IDimensions";
import { Trie } from "./utils/Trie";

const App = () => {
  const [dimensions, setDimensions] = useState<IDimensions>({ M: 3, N: 3 });

  const [dict, setDict] = useState<Trie>(new Trie());

  const [grid, setGrid] = useState<string[][]>(Array(dimensions.M).fill(Array(dimensions.N).fill(null)));

  const [language, setLanguage] = useState<Languages>("HUN");

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
        language,
        setLanguage
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
