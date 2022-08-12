/* eslint-disable no-debugger */
import { Trie } from "./Trie";

// dictionary is given to us.
const isWord = (str: string, dictionary: Trie) =>
  dictionary.search(str.toLocaleLowerCase());

const isValidPrefix = (prefix: string, dictionary: Trie) =>
  dictionary.isValidPrefix(prefix.toLocaleLowerCase());

const findWordsUtil = (
  boggle: string[][],
  visited: boolean[][],
  i: number,
  j: number,
  str: string,
  dictionary: Trie,
  result: string[],
  M: number,
  N: number
) => {
  visited[i][j] = true;
  str = str + boggle[i][j];
  
  if (isWord(str, dictionary)) result.push(str);

  // Traverse 8 adjacent cells of boggle[i,j]
  for (let row = i - 1; row <= i + 1 && row < M; row++)
    for (let col = j - 1; col <= j + 1 && col < N; col++)
      if (
        row >= 0 &&
        col >= 0 &&
        !visited[row][col] &&
        isValidPrefix(str, dictionary)
      ) {
        findWordsUtil(boggle, visited, row, col, str, dictionary, result, M, N);
      }

  // Erase current character from string and
  // mark visited of current cell as false
  str = "" + str[str.length - 1];
  visited[i][j] = false;
};

// Prints all words present in dictionary.
export const findWords = (
  boggle: string[][],
  dictionary: Trie,
  result: string[],
  M: number,
  N: number
) => {
  // Mark all characters as not visited
  const visited = Array.from(Array(M), () => new Array(N).fill(0));

  // Consider every character and look for all words
  // starting with this character
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      findWordsUtil(boggle, visited, i, j, "", dictionary, result, M, N);
    }
  }

  return Array.from(new Set(result));
};
