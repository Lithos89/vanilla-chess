// Types, interfaces, constants, ...
import { type ShortPosition } from '../../logic/Terms';

// Components
import Square from 'components/Square';
import Piece from '../../components/pieces/index';

// Classes
import MoveController from './MoveController';

// utils
import { convertPosition } from '../../utils';

// *: The purpose of MoveController will be to keep track of available moves, forced plays, signal someone has won, and more...
class MoveManager {
  protected boardSquares: { [shortPosition: string] : Square }
  readonly controller: MoveController
  updateBoard;

  constructor(squareListing: { [shortPosition: string] : Square }, boardUpdateCallback) {
    this.updateBoard = boardUpdateCallback
    this.boardSquares = squareListing;
    this.controller = new MoveController(this.boardSquares, this.commitMove);
    Piece.movePiece = this.moveRequestCallback;
  }

  // Functions to include in this class

  /*
    - Victory check
    - "Check" check
    - Draw check
      - 3 Repeated Move check
      - Insufficient Material Check
    ?: - Time check (if I decide to take the app this far)
  */


  commitMove = (from: ShortPosition, to: ShortPosition) => {

    const originSquare = this.boardSquares[from] 
    const destSquare = this.boardSquares[to]

    const originPiece = originSquare?.piece
    // destpiece will be used when it comes to reflecting captures
    const destPiece = destSquare?.piece

    destSquare.piece = originPiece;
    originSquare.piece = null;

    // TODO: Make a method that will update the piece that the square holds
    // destSquare.updatePiece

    // TODO: Add some callback that will then update the client with the new board rather than returning like the primitive iteration
    this.updateBoard();
  }

  // !: Make sure to make these run at the same time because the piece could be added to the original, and not yet be deleted from the original,
  // !: leading to a duplication glitch
  requestMove = (from: ShortPosition, to: ShortPosition) => {
    const originPiece = this.boardSquares[from]?.piece
    // const destPiece = this.boardSquares[to]?.piece

    this.boardSquares[to].piece = originPiece;
    delete this.boardSquares[from].piece

    // TODO: Add filter functions here that will evaluate if it is a viable move
  }

  moveRequestCallback = (origin: Square, dest: Square) => {
    const originPosShort: ShortPosition = convertPosition(origin.position) as ShortPosition;
    const destPosShort: ShortPosition = convertPosition(dest.position) as ShortPosition;

    const originPiece = origin.piece
    // const destPiece = this.boardSquares[to]?.piece

    const goTo = this.boardSquares['d4']
    console.info(goTo)
    goTo.setPiece(originPiece);
    delete origin.piece;
    return this.boardSquares;
  };
};

export default MoveManager;
