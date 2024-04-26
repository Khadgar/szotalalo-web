import React, { FC, useContext, useEffect } from "react";
import styled from "styled-components";
import { findWords } from "../utils/solver";
import { Trie } from "../utils/Trie";
import AppContext, { Languages } from "../contexts/AppContext";

const ResultContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
`;

const ResultsWrapper = styled.div`
  display: flex;
  margin: 4px;
  flex-direction: column;
  justify-content: center;
`;

const Res = styled.div`
  height: 30px;
  display: flex;
  margin: 4px;
  flex-direction: column;
  justify-content: center;
`;
const getDictionaryFilename = (lang: Languages) => {
  switch (lang) {
    case "ENG":
      return "twl06_scrabble_us.txt";
    case "HUN":
      return "szokereso_dict_1.5.53.txt";
    default:
      return "szokereso_dict_1.5.53.txt";
  }
};
const Result: FC = () => {
  const { dimensions, dict, grid, language, setDict } = useContext(AppContext);

  useEffect(() => {
    const dictFile = getDictionaryFilename(language);

    fetch(`${process.env.PUBLIC_URL}/${dictFile}`)
      .then((r) => r.text())
      .then((text) => {
        const newDict = new Trie();
        const dictArray = text.split("\r\n");
        newDict.from(dictArray);
        setDict(newDict);
      });
  }, [setDict, language]);

  const renderResults = (results: string[]) => {
    return results.map((result: string, i: number) => (
      <Res key={i}>
        {result} ({result.length})
      </Res>
    ));
  };

  if (grid.every((row) => row.every((col) => col !== null))) {
    const start = new Date().getTime();
    const results = findWords(grid, dict, [], dimensions.M, dimensions.N).sort((a, b) => b.length - a.length);
    const end = new Date().getTime();
    return (
      <ResultsWrapper>
        Found {results.length} words in {`${end - start}ms`}
        <ResultContainer>{renderResults(results)}</ResultContainer>
      </ResultsWrapper>
    );
  }

  return <ResultContainer></ResultContainer>;
};

export default Result;
