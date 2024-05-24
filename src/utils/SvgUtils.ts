/* eslint-disable @typescript-eslint/no-unused-vars */
import { MutableRefObject } from 'react';
import * as d3 from 'd3';
import { ICoordinates } from '../components/ICoordinates';

export interface IGridCell {
  cell: string;
  selected: boolean;
  i: number;
  j: number;
}

const areNeighboring = (coord1: ICoordinates, coord2: ICoordinates): boolean => {
  if (coord1 && coord2) {
    const dx = Math.abs(coord1.i - coord2.i);
    const dy = Math.abs(coord1.j - coord2.j);
    return dx <= 1 && dy <= 1;
  }
  return false;
};

const selectRect = (
  svgObj: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  pointers: [number, number][]
) => {
  const svgRect = svgObj.node()!.getBoundingClientRect();
  const element = document.elementFromPoint(
    pointers[0][0] + svgRect.left,
    pointers[0][1] + svgRect.top
  );
  if (element) return d3.select(element).datum() as IGridCell;
};

const drawArrow = (
  svgObj: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  from: ICoordinates,
  to: ICoordinates,
  cellSize: number,
  gap: number,
  offset: number = 20
) => {
  const fromX = from.j * (cellSize + gap / 2) + cellSize / 2 + 1;
  const fromY = from.i * (cellSize + gap / 2) + cellSize / 2 + 1;
  const toX = to.j * (cellSize + gap / 2) + cellSize / 2 + 1;
  const toY = to.i * (cellSize + gap / 2) + cellSize / 2 + 1;

  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ratio = (len - offset) / len;

  const newEndX = fromX + ratio * dx;
  const newEndY = fromY + ratio * dy;

  // Draw a line between the two cells
  const lineGenerator = d3.line();

  const pathData = lineGenerator([
    [fromX + (offset * dx) / len, fromY + (offset * dy) / len],
    [newEndX, newEndY],
  ]);

  svgObj
    .append('path')
    .attr('d', pathData)
    .attr('stroke', 'black')
    .attr('marker-end', 'url(#arrow)')
    .classed('arrow', true)
    .style('pointer-events', 'none');
};

const removeArrow = (
  svgObj: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  removeAll: boolean
) => {
  if (removeAll) {
    svgObj.selectAll('.arrow').remove();
  } else {
    svgObj
      .selectAll('.arrow')
      .filter((d, i, nodes) => i === nodes.length - 1)
      .remove();
  }
};

export function createSvgCanvas(ref: MutableRefObject<SVGSVGElement | null>) {
  return ref.current ? d3.select(ref.current) : null;
}

export function createArrowHead(
  svgObj: d3.Selection<SVGSVGElement, unknown, null, undefined> | null
) {
  if (svgObj) {
    const markerBoxWidth = 10;
    const markerBoxHeight = 10;
    const refX = markerBoxWidth / 2;
    const refY = markerBoxHeight / 2;
    const lineGenerator = d3.line();
    const pathData = lineGenerator([
      [0, 0],
      [0, 10],
      [10, 5],
    ]);
    // Check if the marker with id 'arrow' already exists
    const marker = svgObj.select('#arrow');

    // Add the arrowhead marker definition to the svg element
    if (marker.empty()) {
      svgObj
        .append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('markerWidth', markerBoxWidth)
        .attr('markerHeight', markerBoxHeight)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', pathData)
        .attr('stroke', 'black');
    }
  }
}

export function addSvgEventListeners(
  svgObj: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  setGridDataHandler: React.Dispatch<React.SetStateAction<IGridCell[][]>>,
  cellSize: number,
  gap: number,
  gridData: IGridCell[][],
  setSelectionInProgressHandler: React.Dispatch<React.SetStateAction<boolean>>,
  selectionInProgress: boolean,
  setSelectedCellsHandler: React.Dispatch<React.SetStateAction<ICoordinates[]>>,
  selectedCells: ICoordinates[],
  arrowOffset: number = 20
) {
  return svgObj
    .attr('width', (cellSize + gap / 2) * gridData[0].length)
    .attr('height', (cellSize + gap / 2) * gridData[0].length)
    .style('touch-action', 'none')
    .on('mouseleave', function () {
      if (selectionInProgress) {
        const newArray = gridData.map((row) => row.map((cell) => ({ ...cell, selected: false })));
        setSelectionInProgressHandler(false);
        setGridDataHandler([...newArray]);
        removeArrow(d3.select(this), true);
      }
    })
    .on('mouseup', function () {
      const newArray = gridData.map((row) => row.map((cell) => ({ ...cell, selected: false })));
      setGridDataHandler([...newArray]);
      setSelectionInProgressHandler(false);
      removeArrow(d3.select(this), true);
    })
    .on(
      'touchstart',
      function (event) {
        const pointers = d3.pointers(event);
        const data = selectRect(d3.select(this), pointers);
        const newArray = gridData.map((row) => row.map((cell) => ({ ...cell })));
        if (data) {
          newArray[data.i][data.j].selected = true;
          setSelectionInProgressHandler(true);
          setSelectedCellsHandler([...selectedCells, { i: data.i, j: data.j }]);
          setGridDataHandler([...newArray]);
        }
      },
      { passive: true }
    )
    .on(
      'touchmove',
      function (event) {
        const pointers = d3.pointers(event);
        const data = selectRect(d3.select(this), pointers);

        if (data) {
          if (selectionInProgress) {
            const newArray = gridData.map((row) => row.map((cell) => ({ ...cell })));
            if (
              !gridData[data.i][data.j].selected &&
              selectedCells.length > 0 &&
              areNeighboring(selectedCells[selectedCells.length - 1], { i: data.i, j: data.j })
            ) {
              drawArrow(
                d3.select(this),
                selectedCells[selectedCells.length - 1],
                { i: data.i, j: data.j },
                cellSize,
                gap,
                arrowOffset
              );
              newArray[data.i][data.j].selected = true;
              setSelectedCellsHandler([...selectedCells, { i: data.i, j: data.j }]);
              setGridDataHandler([...newArray]);
            } else if (
              gridData[data.i][data.j].selected &&
              selectedCells.length > 0 &&
              areNeighboring(selectedCells[selectedCells.length - 1], { i: data.i, j: data.j }) &&
              (data.j !== selectedCells[selectedCells.length - 1].j ||
                data.i !== selectedCells[selectedCells.length - 1].i)
            ) {
              const from = selectedCells[selectedCells.length - 1];
              newArray[from.i][from.j].selected = false;
              setGridDataHandler([...newArray]);
              setSelectedCellsHandler(selectedCells.slice(0, -1));
              removeArrow(d3.select(this), false);
            }
          }
        }
      },
      { passive: true }
    )
    .on('touchend', function () {
      const newArray = gridData.map((row) => row.map((cell) => ({ ...cell, selected: false })));
      setGridDataHandler([...newArray]);
      setSelectionInProgressHandler(false);
      setSelectedCellsHandler([]);
      // Remove all arrows
      d3.selectAll('.arrow').remove();
    });
}

export function createRows(
  svgObj: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  gridData: IGridCell[][],
  cellSize: number,
  gap: number
) {
  return svgObj
    .selectAll('g')
    .data(gridData)
    .join('g')
    .attr('transform', (d, i) => `translate(${0},${i * (cellSize + gap / 2) + 1})`);
}

export function createCells(
  rows: d3.Selection<d3.BaseType | SVGGElement, IGridCell[], SVGSVGElement, unknown>,
  cellSize: number,
  gap: number,
  setGridDataHandler: React.Dispatch<React.SetStateAction<IGridCell[][]>>,
  gridData: IGridCell[][],
  setSelectionInProgressHandler: React.Dispatch<React.SetStateAction<boolean>>,
  selectionInProgress: boolean,
  setSelectedCellsHandler: React.Dispatch<React.SetStateAction<ICoordinates[]>>,
  selectedCells: ICoordinates[],
  arrowOffset: number = 20
) {
  const cells = rows
    .selectAll('rect')
    .data((d) => d)
    .join('rect')
    .attr('x', (d, i) => i * (cellSize + gap / 2) + 1)
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('fill', function (data) {
      return data.selected ? '#00a2e8' : '#00efd1';
    })
    .attr('stroke', '#083863')
    .attr('rx', '4')
    .on('mousedown', function (event, data) {
      const newArray = gridData.map((row) => row.map((cell) => ({ ...cell })));
      newArray[data.i][data.j].selected = true;
      setSelectionInProgressHandler(true);
      setSelectedCellsHandler([...selectedCells, { i: data.i, j: data.j }]);
      setGridDataHandler([...newArray]);
    })
    .on('mouseenter', function (event, data) {
      if (selectionInProgress) {
        const newArray = gridData.map((row) => row.map((cell) => ({ ...cell })));

        if (
          !gridData[data.i][data.j].selected &&
          selectedCells.length > 0 &&
          areNeighboring(selectedCells[selectedCells.length - 1], { i: data.i, j: data.j })
        ) {
          drawArrow(
            d3.select('svg') as unknown as d3.Selection<SVGSVGElement, unknown, null, undefined>,
            selectedCells[selectedCells.length - 1],
            { i: data.i, j: data.j },
            cellSize,
            gap,
            arrowOffset
          );

          newArray[data.i][data.j].selected = true;
          setGridDataHandler([...newArray]);
          setSelectedCellsHandler([...selectedCells, { i: data.i, j: data.j }]);
        } else if (
          gridData[data.i][data.j].selected &&
          selectedCells.length > 0 &&
          areNeighboring(selectedCells[selectedCells.length - 1], { i: data.i, j: data.j })
        ) {
          const from = selectedCells[selectedCells.length - 1];
          newArray[from.i][from.j].selected = false;
          setGridDataHandler([...newArray]);
          setSelectedCellsHandler(selectedCells.slice(0, -1));
          removeArrow(
            d3.select('svg') as unknown as d3.Selection<SVGSVGElement, unknown, null, undefined>,
            false
          );
        }
      }
    })
    .on('mouseup', function () {
      const newArray = gridData.map((row) => row.map((cell) => ({ ...cell, selected: false })));
      setGridDataHandler([...newArray]);
      setSelectionInProgressHandler(false);
      setSelectedCellsHandler([]);
      // Remove all arrows
      removeArrow(
        d3.select('svg') as unknown as d3.Selection<SVGSVGElement, unknown, null, undefined>,
        true
      );
    });

  rows
    .selectAll('text')
    .data((d) => d)
    .join('text')
    .attr('x', (d, i) => i * (cellSize + gap / 2) + cellSize / 2)
    .attr('y', cellSize / 2)
    .text((d) => d.cell)
    .attr('text-anchor', 'middle')
    .style('text-transform', 'uppercase')
    .attr('dominant-baseline', 'middle')
    .style('font-size', `${cellSize / 2}px`)
    .style('user-select', 'none')
    .style('pointer-events', 'none')
    .style('font-family', 'monospace');

  return cells;
}
