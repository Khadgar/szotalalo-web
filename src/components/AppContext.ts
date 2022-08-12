import { createContext } from "react";
import { Trie } from "../utils/Trie";
import { IDimensions } from "./IDimensions";
interface IAppContext {
  grid: string[][];
  setGrid: React.Dispatch<React.SetStateAction<string[][]>>;
  dict: Trie;
  setDict: React.Dispatch<React.SetStateAction<Trie>>;
  dimensions: IDimensions;
  setDimensions: React.Dispatch<React.SetStateAction<IDimensions>>;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const AppContext = createContext<IAppContext>(null!);
export default AppContext;
