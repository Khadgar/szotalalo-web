import React, { FC, useContext, useEffect } from 'react';
import { Button, Flex, Group, Select, Text } from '@mantine/core';
import AppContext, { Languages } from '../../contexts/AppContext';
import { findWords } from '../../utils/solver';
import { Trie } from '../../utils/Trie';

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
    const url =
      process.env.NODE_ENV === 'production'
        ? `./${dictFile}`
        : `${process.env.PUBLIC_URL}/${dictFile}`;
    fetch(url)
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
        <Button
          key={btn}
          variant={btn === `${dimensions.m}x${dimensions.n}` ? 'filled' : 'outline'}
          size="xs"
          radius="xs"
          onClick={() => {
            const newDimensions = configureDimensions(btn);
            setDimensions(newDimensions);
            setGrid(Array(newDimensions.m).fill(Array(newDimensions.n).fill(null)));
            setResults([]);
          }}
        >
          {btn}
        </Button>
      );
    });
  };

  const generateLanguageSelector = () => {
    return (
      <Select
        label="Language"
        data={[
          { value: 'ENG', label: 'English' },
          { value: 'HUN', label: 'Hungarian' },
        ]}
        value={language}
        onChange={(value) => {
          setLanguage(value as Languages);
        }}
      />
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
    <Flex direction={{ base: 'column' }} gap={{ base: 'sm' }} justify={{ sm: 'center' }}>
      <Flex direction={{ base: 'column' }} gap={{ base: 'sm' }} justify={{ sm: 'center' }}>
        <Text size="md">Grid Size</Text>
        <Group>{generateGridSizeButtons(buttons)}</Group>
      </Flex>
      <Flex direction={{ base: 'column' }} gap={{ base: 'sm' }} justify={{ sm: 'center' }}>
        <Text size="md">Randomize Board</Text>
        <Group>
          <Button
            variant="gradient"
            size="xs"
            radius="xs"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            onClick={generateRandomGrid}
          >
            Rand
          </Button>
        </Group>
      </Flex>
      <Group>{generateLanguageSelector()}</Group>
    </Flex>
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
