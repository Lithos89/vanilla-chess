
// Types, interfaces, constants, ...
import { PieceKind, type Side, type BoardDirection } from '../../logic/terms';
import { type MoveLine, type MoveAlgorithm } from '../../logic/concepts';
// Class interfaces
import DynamicBehavior from './interfaces/dynamicBehavior';
import AlternativeCapturing from './interfaces/alternativeCapturing';

// Components
// import Piece, { King } from './index';
import Piece from './Piece';
import King from './King';
import Square from '../Square';

// Algorithms
import Search from '../../logic/algorithms/core';


class Pawn extends Piece implements DynamicBehavior, AlternativeCapturing {
  public kind = PieceKind.Pawn;
  // TODO: Fix direction so it works on the alt board orientation
  private readonly direction: BoardDirection = this.side === 'white' ? '+' : '-';

  public movementAlgorithms: null;
  public moved: boolean = false;

  public captureLines: MoveLine[];
  public captureAlgorithms = [Search.diagonals(1, this.direction)];
  

  public loadMoveAlgorithms(): MoveAlgorithm[] {
    const fileDistance = this.moved ? 1 : 2;

    return [Search.file(fileDistance, this.direction)];
  };


  /*-------------------------STANDARD INFLUENCE/MOVEMENT-------------------------*/

  public override influenceEmptySquare = () => true;

  public override influenceOccupiedSquare = () => false;


  /*------------------------ALTERNATIVE INFLUENCE/MOVEMENT------------------------*/

  public altInfluenceEmptySquare = (square: Square): boolean => {
    square.controlled[this.side] = true;
    return false;
  };

  public altInfluenceOccupiedSquare = (square: Square, playableLine: MoveLine) => {
    const destPiece = square.piece;
    
    if (destPiece.side !== this.side) {
      if (destPiece instanceof King) {
        destPiece.checks.push({ attackPiece: this, frontAttackLine: playableLine });
        return false;
      } else {
        return true;
      }
    } else {
      destPiece.isProtected = true;
      return false;
    };
  }
};

export default Pawn;
