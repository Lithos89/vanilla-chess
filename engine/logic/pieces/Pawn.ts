import { PieceKind, type Side } from '../Terms.js';

import Piece from './Piece.js';

class Pawn extends Piece {
  side: Side;

  constructor(side: Side) {
    super(PieceKind.Pawn);
    this.side = side;
  };
};

export default Pawn;
