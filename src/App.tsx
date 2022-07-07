import Board from "./components/Board";
import Result from "./components/Result";
import AppContext from "./components/AppContext";
import { useState } from "react";

import "./styles.css";

const App = () => {
  const [grid, setGrid] = useState<string[][]>(
    Array(3).fill(Array(3).fill(null))
  );

  const [dict, setDict] = useState<Set<string>>(new Set());

  return (
    <AppContext.Provider value={{ grid, setGrid, M: 3, N: 3, dict, setDict }}>
      <div className="App">
        <Board M={3} N={3} />
        <Result />
      </div>
    </AppContext.Provider>
  );
};

export default App;
