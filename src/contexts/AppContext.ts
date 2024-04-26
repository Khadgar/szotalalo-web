import { createContext } from "react";
import { Trie } from "../utils/Trie";
import { IDimensions } from "../components/IDimensions";

export type Languages = "ENG" | "HUN";
interface IAppContext {
  grid: string[][];
  setGrid: React.Dispatch<React.SetStateAction<string[][]>>;
  dict: Trie;
  setDict: React.Dispatch<React.SetStateAction<Trie>>;
  dimensions: IDimensions;
  setDimensions: React.Dispatch<React.SetStateAction<IDimensions>>;
  language: Languages;
  setLanguage: React.Dispatch<React.SetStateAction<Languages>>;
  results: string[];
  setResults: React.Dispatch<React.SetStateAction<string[]>>;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const AppContext = createContext<IAppContext>(null!);
export default AppContext;
