import React, { FC, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import AppContext from '../../contexts/AppContext';

interface BoardCellProps {
  i: number;
  j: number;
  content: string;
  onCellChange(i: number, j: number, content: string): void;
}

const Cell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 6px solid #444;
  border-radius: 5px;
  background: #cccccc;
`;

const Input = styled.input`
  border: 1px solid #444;
  border-top: none;
  border-left: none;
  border-right: none;
  background: transparent;
  text-transform: uppercase;
  font-size: 5em;
  font-family: monospace;
  width: 1ch;
  &:focus {
    background: #0071b2;
    color: #ffffff;
  }
  &::selection {
    background: #0071b2;
    color: #ffffff;
  }
`;

const BoardCell: FC<BoardCellProps> = (props: BoardCellProps) => {
  const [content, setContent] = useState<string>('');
  const { grid } = useContext(AppContext);

  useEffect(() => {
    if (!props.content) {
      setContent('');
    }
  }, [props.content]);

  useEffect(() => {
    if (grid[props.i][props.j]) {
      setContent(grid[props.i][props.j]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid]);

  const onCellChange = (content: EventTarget & HTMLInputElement) => {
    if (content.value.length <= 1) {
      setContent(content.value);
      props.onCellChange(props.i, props.j, content.value);
    }
  };

  return (
    <Cell>
      <Input type="text" value={content} onChange={(e) => onCellChange(e.target)} />
    </Cell>
  );
};

export default BoardCell;
