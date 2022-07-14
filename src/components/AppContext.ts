import { createContext } from "react";

interface IAppContext {
  grid: string[][];
  setGrid: React.Dispatch<React.SetStateAction<string[][]>>;
  dict: Set<string>;
  setDict: React.Dispatch<React.SetStateAction<Set<string>>>;
  M: number;
  N: number;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const AppContext = createContext<IAppContext>(null!);
export default AppContext;
