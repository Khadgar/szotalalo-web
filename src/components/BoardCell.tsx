import styled from "styled-components";
import { FC, useState } from "react";

interface BoardCellProps {
  i: number;
  j: number;
  onCellChange(i: number, j: number, content: string): void;
}

const Cell = styled.div`
  border: 1px solid #ccc;
`;

const BoardCell: FC<BoardCellProps> = (props: BoardCellProps) => {
  const [content, setContent] = useState<string>("");

  const onCellChange = (content: EventTarget & HTMLInputElement) => {
    if (content.value.length <= 1) {
      setContent(content.value);
      props.onCellChange(props.i, props.j, content.value);
    }
  };

  return (
    <Cell>
      <input
        type="text"
        value={content}
        onChange={(e) => onCellChange(e.target)}
      />
    </Cell>
  );
};

export default BoardCell;
