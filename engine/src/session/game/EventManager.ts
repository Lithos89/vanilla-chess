
import { isNull, isEmpty } from "lodash";

// Types, interfaces, constants, ...
import { type Side, type ShortPosition } from "../../logic/terms";
import { Attack } from "../../logic/concepts";
import { type BoardSquareListings } from "../../formation/structure/squareCollection";

// Components
import Piece from '../../components/piece/Piece';
import King from '../../components/piece/King';
import Pawn from '../../components/piece/Pawn';

// Utils
import convertPosition from '../../utils/regulation/position/convertPosition';
import calcDistance from '../../utils/regulation/position/calcDistance';

class EventManager {
  static forceCheckResolve = (board: BoardSquareListings, { attackPiece, frontAttackLine }: Attack, side: Side) => {
    const preventitiveMoves: ShortPosition[] = []
    let king: King;

    //* Blocking or capturing
    for (const boardPos in board) {
      const square = board[boardPos];
      const piece: Piece | null = square.piece;

      if (isNull(piece) || piece.side === side) { continue };

      //* DEFENDING
      if (piece instanceof King) {
        king = piece;
        continue;
      };

      const playableMoves: ShortPosition[] = [];

      for (const move of piece.availableMoves) {
        // Block the attack line or capture the piece
        if (frontAttackLine.includes(move) || move === convertPosition(attackPiece.position)) {
          preventitiveMoves.push(move);
          playableMoves.push(move);
        };
      };
      piece.availableMoves = playableMoves;
    };

    const kingMoves: Set<ShortPosition> = new Set(king.availableMoves);
    
    //* Remove the positions that are still in the attacking piece's lines of attack
    if (!(attackPiece instanceof Pawn)) {
      attackPiece.legalLines.forEach((line) => {
        if (line.includes(convertPosition(king.position))) {
          line.forEach((pos) => {
            kingMoves.delete(pos as ShortPosition);
          });
        };
      });
    };

    //* Remove the ability for the king to castle out of the check
    for (const pos of king.legalLines.flat(2)) {
      if (calcDistance(king.position, convertPosition(pos)) > 1) {
        kingMoves.delete(pos);
      };
    };

    king.availableMoves = Array.from(kingMoves);

    return isEmpty(king.availableMoves) && isEmpty(preventitiveMoves);
  };

  static identifyDraw = (board: BoardSquareListings, side: Side) => {
    for (const boardPos in board) {
      const square = board[boardPos];
      const piece: Piece | null = square.piece;

      if (isNull(piece) || piece.side !== side) { continue };

      if (piece.availableMoves.length !== 0) {
        return false;
      }
    }

    return true;
  }
};

export default EventManager;
