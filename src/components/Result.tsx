import React, { FC, useContext } from "react";
import styled from "styled-components";
import AppContext from "../contexts/AppContext";

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
  const { results } = useContext(AppContext);

  const renderResults = (results: string[]) => {
    return results.map((result: string, i: number) => (
      <Res key={i}>
        {result} ({result.length})
      </Res>
    ));
  };
  if (results.length === 0) return <></>;
  return (
    <ResultsWrapper>
      Found {results.length} words
      <ResultContainer>{renderResults(results)}</ResultContainer>
    </ResultsWrapper>
  );
};

export default Result;
