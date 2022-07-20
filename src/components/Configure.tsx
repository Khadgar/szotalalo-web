import React, { FC, useContext } from "react";
import styled from "styled-components";
import AppContext from "./AppContext";

interface GridSizeButtonProps {
  selected: boolean;
}

const GridSizeButton = styled.div<GridSizeButtonProps>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 30px;
  margin: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: ${(p) => (p.selected ? "#0071b2" : "#ffffff")};
  color: ${(p) => (p.selected ? "#ffffff" : "#000000")};
  &:hover {
    cursor: pointer;
    background: #0071b2;
    color: #ffffff;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const Configure: FC = () => {
  const { dimensions, setDimensions, setGrid } = useContext(AppContext);
  const buttons = ["3x3", "4x4", "5x5", "6x6", "7x7", "8x8"];

  const generateButtons = (buttonsList: string[]) => {
    return buttonsList.map((btn) => {
      return (
        <GridSizeButton
          selected={btn === `${dimensions.M}x${dimensions.N}`}
          key={btn}
          onClick={() => {
            const newDimensions = configureDimensions(btn);
            setDimensions(newDimensions);
            setGrid(
              Array(newDimensions.M).fill(Array(newDimensions.N).fill(null))
            );
          }}
        >
          {btn}
        </GridSizeButton>
      );
    });
  };

  return <Container>{generateButtons(buttons)}</Container>;
};

const configureDimensions = (configuredDimension: string) => {
  switch (configuredDimension) {
    case "3x3":
      return { M: 3, N: 3 };
    case "4x4":
      return { M: 4, N: 4 };
    case "5x5":
      return { M: 5, N: 5 };
    case "6x6":
      return { M: 6, N: 6 };
    case "7x7":
      return { M: 7, N: 7 };
    case "8x8":
      return { M: 8, N: 8 };
    default:
      return { M: 3, N: 3 };
  }
};

export default Configure;
