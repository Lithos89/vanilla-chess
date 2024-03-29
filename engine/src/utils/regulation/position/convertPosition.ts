
// Types, interface, constants, ...
import { type ShortPosition, type Position } from '../../../logic/terms';

// *: Function to convert between the alternate forms of board positions ({row, col} or `${col}${row}`)
function convertPosition(position: ShortPosition): Position
function convertPosition(position: Position): ShortPosition
function convertPosition(position: ShortPosition | Position): ShortPosition | Position {
  if (typeof position === 'string') {
    return { row: position[1], col: position[0] } as Position;
  } else if (typeof position === 'object') {
    return `${position.col}${position.row}` as ShortPosition;
  } else {
    throw Error('Unable to convert position of ' + position);
  };
};

export default convertPosition;