
// Components
import Square from 'components/ChessBoard/Square';

// Styling
import styled from 'styled-components';
import { devices } from 'config/devices';

// Determine either to create the background frame of the board dynamically or use an image
// TODO: Add frame to board
const BoardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  
  background-color: ${p => p.theme.color.white.solid};

  aspect-ratio: 1 / 1;

  @media ${devices.tablet} {
    margin: 0.5vh 0;
    max-width: 70vh;
  };

  @media ${devices.laptop} {
    max-width: 80vh;
  }
`;

const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

const placeholderSquares = columns.flatMap((col, i) => 
  rows.map((row, j) => {
    const _index = i * 8 + j;

    const regex = /b|d|f|h/;
    const isEvenRow = regex.test(col);

    const shade = (_index % 8 + Number(isEvenRow)) % 2 === 0 ? 'light' : 'dark';
    return <Square key={_index} color={shade} />
  })
);

// *: This component will control the orientation of the boards and the subsequent squares, as well as have positions on side
const Board = ({ squares, update, flipped }) => {

  // // !: Just a temporary solution, in the future the array will be preprocessed for the client
  const n = Math.sqrt(squares?.length ?? 0);
  const squaresT = (squares ?? placeholderSquares).map((_, i, a) => a[((i % n) * n + 7 - Math.floor(i / n))]);
  
  const finalSquares = flipped ? squaresT.reverse() : squaresT

  return (
    <BoardContainer>
        { squares ?
            finalSquares.map(({ position, square, piece }) => (
              <Square
                key={position}
                color={square.color}
                position={position}
                piece={piece}
                update={update}
                isHighlighted={square.focus.highlighted}
                action={square.focus.action}
              />
            ))
            :
            placeholderSquares
        }
    </BoardContainer>
  );
};


export default Board;
