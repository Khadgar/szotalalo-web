import React, { FC, useContext, useEffect } from "react";
import styled from "styled-components";
import { findWords } from "../utils/solver";
import AppContext from "./AppContext";

const ResultContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
const Res = styled.div`
  height: 50px;
  display: flex;
  margin: 4px;
  flex-direction: column;
  justify-content: center;
`;

const Result: FC = () => {
  const { dimensions, dict, grid, setDict } = useContext(AppContext);

  useEffect(() => {
    fetch("szotalalo-web/szokereso_dict_1.5.54.txt")
      .then((r) => r.text())
      .then((text) => {
        setDict(new Set(text.split("\r\n")));
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
    const results = findWords(grid, dict, [], dimensions.M, dimensions.N).sort((a, b) => b.length - a.length);
    return <ResultContainer>{renderResults(results)}</ResultContainer>;
  }

  return <ResultContainer></ResultContainer>;
};

export default Result;
