// A given function to check if a given string
// is present in dictionary. The implementation is
// naive for simplicity. As per the question
// dictionary is given to us.
const isWord = (str: string, dictionary: Set<string>) => dictionary.has(str);

// A recursive function to print all words present on boggle
const findWordsUtil = (
  boggle: string[][],
  visited: boolean[][],
  i: number,
  j: number,
  str: string,
  dictionary: Set<string>,
  result: string[],
  M: number,
  N: number
) => {
  // Mark current cell as visited and
  // append current character to str
  visited[i][j] = true;
  str = str + boggle[i][j];

  // If str is present in dictionary,
  // then print it
  if (isWord(str, dictionary)) result.push(str);

  // Traverse 8 adjacent cells of boggle[i,j]
  for (var row = i - 1; row <= i + 1 && row < M; row++)
    for (var col = j - 1; col <= j + 1 && col < N; col++)
      if (row >= 0 && col >= 0 && !visited[row][col])
        findWordsUtil(boggle, visited, row, col, str, dictionary, result, M, N);

  // Erase current character from string and
  // mark visited of current cell as false
  str = "" + str[str.length - 1];
  visited[i][j] = false;
};

// Prints all words present in dictionary.
export const findWords = (
  boggle: string[][],
  dictionary: Set<string>,
  result: string[],
  M: number,
  N: number
) => {
  // Mark all characters as not visited
  var visited = Array.from(Array(M), () => new Array(N).fill(0));

  // Initialize current string
  var str = "";

  // Consider every character and look for all words
  // starting with this character
  for (var i = 0; i < M; i++)
    for (var j = 0; j < N; j++)
      findWordsUtil(boggle, visited, i, j, str, dictionary, result, M, N);

  return Array.from(new Set(result));
};
