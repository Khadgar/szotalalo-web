import React, { FC, useContext, useEffect } from "react";
import styled from "styled-components";
import { findWords } from "../utils/solver";
import AppContext from "./AppContext";

const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
const Res = styled.div`
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #ccc;
`;

const Result: FC = () => {
  const { dict, grid, setDict, M, N } = useContext(AppContext);

  useEffect(() => {
    fetch("szokereso_dict_1.5.53.txt")
      .then((r) => r.text())
      .then((text) => {
        setDict(new Set(text.split("\r\n")));
      });
  }, [setDict]);

  const results = findWords(grid, dict, [], M, N);

  const renderResults = (results: string[]) => {
    return results.map((result: string, i: number) => (
      <Res key={i}>{result}</Res>
    ));
  };

  return <ResultContainer>{renderResults(results)}</ResultContainer>;
};

export default Result;
