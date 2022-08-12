import React, { FC, useContext, useEffect } from "react";
import styled from "styled-components";
import { findWords } from "../utils/solver";
import AppContext from "./AppContext";

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

const Result: FC = () => {
  const { dimensions, dict, grid, setDict } = useContext(AppContext);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/szokereso_dict_1.5.53.txt`)
      .then((r) => r.text())
      .then((text) => {
        const dictArray = text.split("\r\n");
        dict.from(dictArray);
        setDict(dict);
      });
  }, [setDict]);

  const renderResults = (results: string[]) => {
    return results.map((result: string, i: number) => (
      <Res key={i}>
        {result} ({result.length})
      </Res>
    ));
  };

  if (grid.every((row) => row.every((col) => col !== null))) {
    const start = new Date().getTime();
    const results = findWords(grid, dict, [], dimensions.M, dimensions.N).sort(
      (a, b) => b.length - a.length
    );
    const end = new Date().getTime();
    return (
      <ResultsWrapper>
        Found {results.length} words in {`${end-start}ms`}
        <ResultContainer>{renderResults(results)}</ResultContainer>
      </ResultsWrapper>
    );
  }

  return <ResultContainer></ResultContainer>;
};

export default Result;
