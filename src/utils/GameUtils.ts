import { Languages } from "../contexts/AppContext";

const hunLetters = ["a", "á", "b", "c", "d", "e", "é", "f", "g", "h", "i", "í", "j", "k", "l", "m", "n", "o", "ó", "ö", "ő", "p", "q", "r", "s", "t", "u", "ú", "ü", "ű", "v", "w", "x", "y", "z"];
const engLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

const getAlphabet = (lang: Languages) => {
  switch (lang) {
    case "ENG":
      return engLetters;
    case "HUN":
      return hunLetters;
    default:
      return engLetters;
  }
};

const generateRandomGrid = (M: number, N: number, language: Languages) => {
  const letters = getAlphabet(language);

  let randomArray = Array(M).fill(Array(N).fill(null));
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      randomArray[i][j] = letters[(letters.length * Math.random()) | 0];
      randomArray = [...randomArray].map((row) => [...row]);
    }
  }
  return randomArray;
};
export { generateRandomGrid };
