import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { Container, Flex, Text } from '@mantine/core';
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
      const arrowOffset = grid.length === 3 || grid.length === 4 ? 40 : 20;
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
          selectedCells,
          arrowOffset
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
          selectedCells,
          arrowOffset
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
    <Flex
      direction={{ base: 'column' }}
      gap={{ base: 'sm' }}
      justify={{ sm: 'center' }}
      ref={wrapperRef}
    >
      <Container h={10}>
        <Text size="md">{selectedCells.map((coord) => grid[coord.i][coord.j]).join('')}</Text>
      </Container>
      <Container fluid h={500} mih={360} mah={500} style={{ padding: 0 }}>
        <svg id="board" ref={ref}></svg>
      </Container>
    </Flex>
  );
};

export default InteractiveBoard;
