import { createContext } from "react";
import { IDimensions } from "./IDimensions";
interface IAppContext {
  grid: string[][];
  setGrid: React.Dispatch<React.SetStateAction<string[][]>>;
  dict: Set<string>;
  setDict: React.Dispatch<React.SetStateAction<Set<string>>>;
  dimensions: IDimensions;
  setDimensions: React.Dispatch<React.SetStateAction<IDimensions>>;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const AppContext = createContext<IAppContext>(null!);
export default AppContext;
