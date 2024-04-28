import React, { FC, useContext, useEffect } from 'react';
import styled from 'styled-components';
import AppContext, { Languages } from '../../contexts/AppContext';
import { findWords } from '../../utils/solver';
import { Trie } from '../../utils/Trie';

interface GridSizeButtonProps {
  selected: boolean;
}

const GridSizeButton = styled.div<GridSizeButtonProps>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 30px;
  margin: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: ${(p) => (p.selected ? '#0071b2' : '#ffffff')};
  color: ${(p) => (p.selected ? '#ffffff' : '#000000')};
  &:hover {
    cursor: pointer;
    background: #0071b2;
    color: #ffffff;
  }
`;

const RandomButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 30px;
  margin: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  &:hover {
    cursor: pointer;
    background: #0071b2;
    color: #ffffff;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const getDictionaryFilename = (lang: Languages) => {
  switch (lang) {
    case 'ENG':
      return 'twl06_scrabble_us.json';
    case 'HUN':
      return 'szokereso_dict_1.5.53.json';
    default:
      return 'szokereso_dict_1.5.53.json';
  }
};

const hunLetters = [
  'a',
  'á',
  'b',
  'c',
  'd',
  'e',
  'é',
  'f',
  'g',
  'h',
  'i',
  'í',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'ó',
  'ö',
  'ő',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'ú',
  'ü',
  'ű',
  'v',
  'w',
  'x',
  'y',
  'z',
];
const engLetters = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];
const Configure: FC = () => {
  const {
    dimensions,
    setDict,
    dict,
    setDimensions,
    grid,
    setGrid,
    language,
    setLanguage,
    setResults,
  } = useContext(AppContext);
  const buttons = ['3x3', '4x4', '5x5', '6x6', '7x7', '8x8'];

  useEffect(() => {
    const dictFile = getDictionaryFilename(language);

    fetch(`${process.env.PUBLIC_URL}/${dictFile}`)
      .then((r) => r.json())
      .then((text) => {
        const newDict = new Trie();
        newDict.from(text);
        setDict(newDict);
      });
  }, [setDict, language]);

  useEffect(() => {
    if (grid.every((row) => row.every((col) => col !== null))) {
      const results = findWords(grid, dict, [], dimensions.m, dimensions.n).sort(
        (a, b) => b.length - a.length
      );
      setResults(results);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid]);

  const generateGridSizeButtons = (buttonsList: string[]) => {
    return buttonsList.map((btn) => {
      return (
        <GridSizeButton
          selected={btn === `${dimensions.m}x${dimensions.n}`}
          key={btn}
          onClick={() => {
            const newDimensions = configureDimensions(btn);
            setDimensions(newDimensions);
            setGrid(Array(newDimensions.m).fill(Array(newDimensions.n).fill(null)));
            setResults([]);
          }}
        >
          {btn}
        </GridSizeButton>
      );
    });
  };

  const generateLanguageSelector = () => {
    return (
      <label>
        Language:
        <select
          value={language}
          onChange={(event) => {
            setLanguage(event.target.value as Languages);
          }}
        >
          <option value="ENG">English</option>
          <option value="HUN">Hungarian</option>
        </select>
      </label>
    );
  };

  const getAlphabet = (lang: Languages) => {
    switch (lang) {
      case 'ENG':
        return engLetters;
      case 'HUN':
        return hunLetters;
      default:
        return engLetters;
    }
  };

  const generateRandomGrid = () => {
    const letters = getAlphabet(language);

    let randomArray = Array(dimensions.m).fill(Array(dimensions.n).fill(null));
    for (let i = 0; i < dimensions.m; i++) {
      for (let j = 0; j < dimensions.n; j++) {
        randomArray[i][j] = letters[(letters.length * Math.random()) | 0];
        randomArray = [...randomArray].map((row) => [...row]);
      }
    }
    setGrid(randomArray);
  };

  return (
    <Container>
      {generateGridSizeButtons(buttons)}
      <RandomButton onClick={generateRandomGrid}>Rand</RandomButton>
      {generateLanguageSelector()}
    </Container>
  );
};

const configureDimensions = (configuredDimension: string) => {
  switch (configuredDimension) {
    case '3x3':
      return { m: 3, n: 3 };
    case '4x4':
      return { m: 4, n: 4 };
    case '5x5':
      return { m: 5, n: 5 };
    case '6x6':
      return { m: 6, n: 6 };
    case '7x7':
      return { m: 7, n: 7 };
    case '8x8':
      return { m: 8, n: 8 };
    default:
      return { m: 3, n: 3 };
  }
};

export default Configure;
