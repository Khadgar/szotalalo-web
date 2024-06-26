import React, { FC, useContext } from 'react';
import styled from 'styled-components';
import AppContext from '../../contexts/AppContext';
import BoardCell from '../BoardCell/BoardCell';

interface BoardWrapperProps {
  m: number;
  n: number;
}

const BoardWrapper = styled.div<BoardWrapperProps>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.n}, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: 10px;
`;

const Board: FC = () => {
  const { dimensions, grid, setGrid } = useContext(AppContext);

  const initGrid = (grid: string[][]) => {
    const onCellChange = (i: number, j: number, content: string) => {
      const copy = [...grid].map((row) => [...row]);
      copy[i][j] = content;
      setGrid(copy);
    };

    return grid.map((row: string[], i: number) => {
      return row.map((col: string, j: number) => {
        return (
          <BoardCell i={i} j={j} content={col} onCellChange={onCellChange} key={`${i}_${j}`} />
        );
      });
    });
  };

  return (
    <BoardWrapper m={dimensions.m} n={dimensions.n}>
      {initGrid(grid)}
    </BoardWrapper>
  );
};

export default Board;
