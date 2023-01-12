
import { isNull } from 'lodash';

// Types, interfaces, constants, ...
import { BOARD_POSITIONS, type ShortPosition, type Side, SIDES, PieceKind } from '../../logic/terms';
import { BoardSquareCondensed } from '../../formation/structure/board';
import { type PieceListings, PieceListing } from '../../formation/structure/pieceCollection';
import { PresentedSquare, type BoardSquareListings } from '../../formation/structure/squareCollection';
import { type MoveLine } from '../../logic/algorithms/types';

// Components
import Square, { type SquareColor } from '../../components/Square';
import Piece, { Rook, Knight, Queen, Bishop, King, Pawn } from '../../components/piece';

// Utils
import convertPosition from '../../utils/position/convertPosition';
import flipFormation from '../../utils/board/flipFormation';
import sortPieces from '../../utils/board/sortPieces';

// TODO: Need to move these into a type
interface Attack {
  attackPiece: Piece,
  frontAttackLine: MoveLine
};


class BoardManager {
  public boardSquares: BoardSquareListings = {};
  private squareHighlighting: {[key in ShortPosition]? : PresentedSquare["focus"]} = {};

  // public whiteKing: King;
  // public blackKing: King;

  private readonly getCurrentTurnSide: () => Side;

  constructor(startingFormation: PieceListings, alt: boolean, currentTurnSideCallback: () => Side, private updateState: () => void) {
    this.getCurrentTurnSide = currentTurnSideCallback;

    this.initBoard(startingFormation, alt);
  };


  /*--------------------------------------------INITIALIZATION---------------------------------------------*/

  private initBoard(pieceConfiguration: PieceListings, flipped: boolean = false) {
    pieceConfiguration = flipped ? pieceConfiguration : flipFormation(pieceConfiguration);

    const startingPieces = this.initPieces(pieceConfiguration);
    this.initSquares(startingPieces);
    // this.updateState();
  };

  private initPieces(pieceConfigurations: PieceListings): {[_pos in ShortPosition]? : Piece} {
    const initialPieces: {[_pos in ShortPosition]? : Piece} = {};

    for (const pos in pieceConfigurations) {
      const pieceConfig: PieceListing = pieceConfigurations[pos];
      initialPieces[pos] = Piece.create(pieceConfig);
    };

    return initialPieces;
  };

  private initSquares(pieceMapping: {[_pos in ShortPosition]? : Piece}) {
    for (const tileIndex in BOARD_POSITIONS) {
      const position: ShortPosition  = BOARD_POSITIONS[tileIndex];
      const regex: RegExp = /b|d|f|h/;
      const isEvenRow: Boolean = regex.test(position);

      const piece: Piece | null = pieceMapping[position] || null;

      const squareColor: SquareColor = ((Number(tileIndex) % 8) + Number(isEvenRow)) % 2 === 0 ? 'light' : 'dark';
      const square: Square = new Square(position, squareColor, piece);
      this.boardSquares[position] = square;
    };
  };


  /*--------------------------------------------STATE MANAGEMENT---------------------------------------------*/

  // TODO: Fix the paramters so that it tracks the different highlighted action type
  public compileBoard = (): BoardSquareCondensed[] => {
    const processedBoard: BoardSquareCondensed[] = [];

    for (const position in this.boardSquares) {
      processedBoard.push({
        position: position as ShortPosition,
        square: {
          color: this.boardSquares[position].color,
          focus: (position in this.squareHighlighting) ? 
            this.squareHighlighting[position as ShortPosition] : 
            { highlighted: false, action: null },
        },
        piece: this.boardSquares[position].piece ? 
          {
            kind: this.boardSquares[position].piece.kind,
            side: this.boardSquares[position].piece.side,
          } : null
      });
    };

    return processedBoard;
  };


  /*--------------------------------------------HIGHLIGHTING---------------------------------------------*/
  
  public highlightMoves = (piece?: Piece) => {
    if (piece instanceof Piece) {
      if (piece.side === this.getCurrentTurnSide()) {
        //* Highlighting the available moves of the piece
        for (const pos of piece.availableMoves) {
          this.squareHighlighting[pos] = {
            highlighted: true,
            action: isNull(this.boardSquares[pos]?.piece) ? "move" : "capture",
          };
        };
        
        //* Highlighting the piece (using 'null' for now but may change)
        this.squareHighlighting[convertPosition(piece.position) as ShortPosition] = {
          highlighted: true,
          action: null,
        };

        this.updateState();
      };
    } else {
      this.squareHighlighting = {};
      this.updateState();
    };
  };






  // *: Loops over each square on the board to update each piece with their respective available moves
  public processAvailableMoves(checks, sideLastMoved?: Side) {
    const [basicPieces, kings] = sortPieces(this.boardSquares);

    this.updateSideBasicPieces(basicPieces.white);
    this.updateSideBasicPieces(basicPieces.black);

    // Kings are updated after basic pieces to make sure that a king cannot move into a line of check and if it is already in check
    this.updateKings(kings as { [side in Side] : King});

    //? Could add a pin updating function here that takes the kings and the other pieces and loops over all of the basic pieces to detect pins

    // checks.push(...(sideLastMoved === "white" ? whiteChecks : blackChecks));
    checks.push(...King[sideLastMoved].checks);
    
    this.updateState();
  };

  private loopLines = (
    moveLines: MoveLine[],
    emptySquareCallback: ((linePos: ShortPosition, controlledSquares?) => boolean),
    occupiedSquareCallback: (linePos: ShortPosition, playableLine?: MoveLine) => boolean
  ) => {
    const playableLines: MoveLine[] = [];

    for (const moveLine of moveLines) { 
      const playableLine: MoveLine = [];

      // * Further line search is stopped when a piece is detected, resulting in [empty..., capture?]
      for (const linePos of moveLine) {
        const isSquareOccupied = !(this.boardSquares[linePos].piece === null);

        if (isSquareOccupied) {
          const captureAvailable = occupiedSquareCallback(linePos, playableLine);
          if (captureAvailable)
            playableLine.push(linePos);

          break;
        } else {
          const moveAvailable = emptySquareCallback(linePos);
          if (moveAvailable)
            playableLine.push(linePos);
        };
      };
      playableLines.push(playableLine);
    };

    return playableLines.flat();
  };

  private updateLines = (
    piece: Piece
  ) => {
    const playableLines: MoveLine[] = [];

    // TODO: At the moment this does not work, need to allow for the function to be able to access 'alt' methods
    for (const moveLineSet of [piece.legalLines, piece.captureLines]) {
      for (const moveLine of moveLineSet) { 
        const playableLine: MoveLine = [];

        // * Further line search is stop ped when a piece is detected, resulting in [empty..., capture?]
        for (const linePos of moveLine) {
          const square = this.boardSquares[linePos];
          // TODO: Try making it the negation to allow for better if else flow down below
          const isSquareOccupied = !(square.piece === null);

          let moveAvailable: boolean;

          if (isSquareOccupied) {
            moveAvailable = piece.influenceEmptySquare(square);
            break;
          } else {
            moveAvailable = piece.influenceOccupiedSquare(square, playableLine);
          };

          if (moveAvailable)
            playableLine.push(linePos);
        };
        playableLines.push(playableLine);
      };

      return playableLines.flat();
    };
  };

  private updateSideBasicPieces = (pieces: Piece[]): [Attack[], Set<ShortPosition>] => {
    const checks: Attack[] = [];
    const controlledSquares: Set<ShortPosition> = new Set();
    const protectedPieces: Piece[] = [];

    for (const piece of pieces){
      piece.availableMoves = []; // Reset piece moveset

      if (!protectedPieces.includes(piece))
          piece.isProtected = false;
      
      const regularMoves = this.updateLines(piece);
      piece.availableMoves.push(...regularMoves);

      // if (!isEmpty(piece.captureAlgorithms)) {
      // !: Note that this if clause is not scalable as is
      // if (piece instanceof Pawn) {
      //   const captureMoves = this.updateLines(piece);
      //   piece.availableMoves.push(...captureMoves);
      // };
    };

    return [checks, controlledSquares];
  };

  private updateKings = (kings: { [side in Side] : King}) => {
    for (const i in SIDES) {
      const side = SIDES[i];
      const king = kings[side];

      const enemySide = SIDES[1 - Number(i)];
      const enemyKing = kings[enemySide];

      king.availableMoves = []; // Reset king movesets

      const newMoves = this.updateLines(king);
      king.availableMoves.push(...newMoves);
    };
  };







};

export default BoardManager;
