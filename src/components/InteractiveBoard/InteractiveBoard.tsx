import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import AppContext from '../../contexts/AppContext';
import { ICoordinates } from '../ICoordinates';
import {
  IGridCell,
  addSvgEventListeners,
  createArrowHead,
  createCells,
  createRows,
  createSvgCanvas,
} from '../../utils/SvgUtils';

const BoardWrapper = styled.div`
  display: flex;
  justify-content: center;
  touch-action: none;
  align-items: stretch;
  width: 100%;
  height: 100%;
`;

const InteractiveBoard: FC = () => {
  const { grid } = useContext(AppContext);
  const ref = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [gridData, setGridData] = React.useState<IGridCell[][]>(
    grid.map((row, i) => row.map((cell, j) => ({ cell, selected: false, i, j })))
  );
  const [selectionInProgress, setSelectionInProgress] = useState<boolean>(false);
  const [selectedCells, setSelectedCells] = useState<Array<ICoordinates>>([]);

  useEffect(() => {
    setGridData(grid.map((row, i) => row.map((cell, j) => ({ cell, selected: false, i, j }))));
  }, [grid]);

  useEffect(() => {
    const svg = createSvgCanvas(ref);
    createArrowHead(svg);
    const updateGrid = () => {
      const gap = 20; // Define the size of the gap
      const width = wrapperRef.current!.clientWidth - gridData[0].length * (gap / 2);
      const height = wrapperRef.current!.clientHeight - gridData[0].length * (gap / 2);
      const cellSize = Math.min(width / gridData[0].length, height / gridData.length); // size of each cell
      if (svg) {
        addSvgEventListeners(
          svg,
          setGridData,
          cellSize,
          gap,
          gridData,
          setSelectionInProgress,
          selectionInProgress,
          setSelectedCells,
          selectedCells
        );

        const rows = createRows(svg, gridData, cellSize, gap);

        createCells(
          rows,
          cellSize,
          gap,
          setGridData,
          gridData,
          setSelectionInProgress,
          selectionInProgress,
          setSelectedCells,
          selectedCells
        );
      }
    };

    updateGrid();

    window.addEventListener('resize', updateGrid);

    return () => {
      window.removeEventListener('resize', updateGrid);
    };
  }, [grid, gridData, selectedCells, selectionInProgress]);

  return (
    <BoardWrapper ref={wrapperRef}>
      <svg id="board" ref={ref}></svg>
    </BoardWrapper>
  );
};

export default InteractiveBoard;
