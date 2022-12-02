import { PieceKind, type Side } from '../../logic/Terms';

import Square from 'components/Square';
import Piece from './Piece';

class Pawn extends Piece {
  side: Side;

  constructor(side: Side) {
    super(PieceKind.Pawn);
    this.side = side;
  };

  move(currentSquare: Square, destSquare: Square) {
    Piece.movePiece(currentSquare, destSquare)
  }
};

export default Pawn;
