import React, { FC } from 'react';
import { ICoordinates } from '../ICoordinates';

interface InteractiveCellProps {
  coordinates: ICoordinates;
  onMouseDown: (coordinates: ICoordinates) => void;
  onMouseUp: (coordinates: ICoordinates) => void;
  onMouseEnter: (coordinates: ICoordinates) => void;
  isSelected: boolean;
}

const InteractiveCell: FC<InteractiveCellProps> = ({
  coordinates,
  isSelected,
  onMouseUp,
  onMouseDown,
  onMouseEnter,
}: InteractiveCellProps) => {
  return (
    <div
      style={{
        border: '1px solid black',
        background: isSelected ? 'blue' : 'white',
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown(coordinates);
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        onMouseUp(coordinates);
      }}
      onMouseEnter={(e) => {
        e.preventDefault();
        onMouseEnter(coordinates);
      }}
    />
  );
};

export default InteractiveCell;
