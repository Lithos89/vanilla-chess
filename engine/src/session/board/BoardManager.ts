
import { isEmpty, isNull } from 'lodash';

// Types, interfaces, constants, ...
import { BOARD_POSITIONS, type ShortPosition, type Side, SIDES, PieceKind } from '../../logic/terms';
import { BoardSquareCondensed } from '../../formation/structure/board';
import { type PieceListings, PieceListing } from '../../formation/structure/pieceCollection';
import { PresentedSquare, type BoardSquareListings } from '../../formation/structure/squareCollection';
import { type MoveLine } from '../../logic/algorithms/types';

// Components
import Square, { type SquareColor } from '../../components/Square';
// import Piece, { Rook, Knight, Queen, Bishop, King, Pawn } from '../../components/piece';
import Piece from '../../components/piece/Piece';
import King from '../../components/piece/King';
import Rook from '../../components/piece/Rook';
import Knight from '../../components/piece/Knight';
import Bishop from '../../components/piece/Bishop';
import Queen from '../../components/piece/Queen';
import Pawn from '../../components/piece/Pawn';

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

  public kings: {[side in Side]: King};

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
      console.info(pieceConfig.kind)

      if (pieceConfig.kind === PieceKind.Pawn)
        initialPieces[pos] = new Pawn(pieceConfig.side);
      else if (pieceConfig.kind === PieceKind.Rook)
        initialPieces[pos] = new Rook(pieceConfig.side);
      else if(pieceConfig.kind === PieceKind.Knight)
        initialPieces[pos] = new Knight(pieceConfig.side);
      else if (pieceConfig.kind === PieceKind.Bishop)
        initialPieces[pos] = new Bishop(pieceConfig.side);
      else if (pieceConfig.kind === PieceKind.Queen)
        initialPieces[pos] = new Queen(pieceConfig.side);
      else if (pieceConfig.kind === PieceKind.King)
        initialPieces[pos] = new King(pieceConfig.side);
      else
        throw new Error(`Unable to create piece with kind: ${pieceConfig.kind}, side: ${pieceConfig.side}`);
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

    basicPieces.white.forEach(piece => piece.isProtected = false);
    basicPieces.black.forEach(piece => piece.isProtected = false);

    kings.black.checks = [];
    kings.white.checks = [];

    this.updateSideBasicPieces(basicPieces.white);
    this.updateSideBasicPieces(basicPieces.black);

    // Kings are updated after basic pieces to make sure that a king cannot move into a line of check and if it is already in check
    this.updateKings(kings as { [side in Side] : King});

    this.applyPins(basicPieces, kings);
    //? Could add a pin updating function here that takes the kings and the other pieces and loops over all of the basic pieces to detect pins

    // checks.push(...(sideLastMoved === "white" ? whiteChecks : blackChecks));
    if (sideLastMoved)
      checks.push(...kings[SIDES[1 - SIDES.indexOf(sideLastMoved)]].checks);

    console.info(this.boardSquares);
    
    this.updateState();
  };

  private updateLines = (
    piece: Piece,
    useCaptureLines: boolean = false
  ) => {
    const moveLines = useCaptureLines ? piece.captureLines : piece.legalLines;
    const influenceEmptySquare = useCaptureLines ? piece.altInfluenceEmptySquare : piece.influenceEmptySquare;
    const influenceOccupiedSquare = useCaptureLines ? piece.altInfluenceOccupiedSquare : piece.influenceOccupiedSquare;

    const playableLines: MoveLine[] = [];

    for (const moveLine of moveLines) { 
      const playableLine: MoveLine = [];

      // * Further line search is stop ped when a piece is detected, resulting in [empty..., capture?]
      for (const linePos of moveLine) {
        const square = this.boardSquares[linePos];
        const isSquareUnoccupied = isNull(square.piece);

        if (isSquareUnoccupied) {
          const moveAvailable = influenceEmptySquare(square);

          if (moveAvailable)
            playableLine.push(linePos);
        } else {
          const captureAvailable = influenceOccupiedSquare(square, playableLine);

          if (captureAvailable)
            playableLine.push(linePos);

          break;
        };
      };
      playableLines.push(playableLine);
    };

    return playableLines.flat();
  };

  private updateSideBasicPieces = (pieces: Piece[]): [Attack[], Set<ShortPosition>] => {
    const checks: Attack[] = [];
    const controlledSquares: Set<ShortPosition> = new Set();

    for (const piece of pieces){
      piece.availableMoves = []; // Reset piece moveset
      
      const regularMoves = this.updateLines(piece);
      piece.availableMoves.push(...regularMoves);

      if (!isEmpty(piece.captureAlgorithms)) {
        const captureMoves = this.updateLines(piece, true);
        piece.availableMoves.push(...captureMoves);
      };
    };

    return [checks, controlledSquares];
  };

  private updateKings = (kings: { [side in Side] : King}) => {
    for (const i in SIDES) {
      const side = SIDES[i];
      const king = kings[side];

      const enemySide = SIDES[1 - Number(i)];
      // TODO: See if I can find a better solution, this implementation is prone to bugs
      const enemyKing = kings[enemySide];

      king.enemyKing = enemyKing;

      king.availableMoves = []; // Reset king movesets

      const newMoves = this.updateLines(king);
      king.availableMoves.push(...newMoves);
    };
  };

  private applyPins(basicPieces: {[side in Side]: Piece[]}, kings: {[side in Side]: King}) {
    for (const i in SIDES) {
      const side = SIDES[i];
      const enemySide = SIDES[1 - Number(i)];
      const enemyKing = kings[enemySide];
      const enemyPos = convertPosition(enemyKing.position) as ShortPosition
      for (const piece of [...basicPieces[side]]) {
        for (const fullLine of piece.legalLines) {
          const posIndex = fullLine.indexOf(enemyPos);
          if (posIndex !== -1) {
            const attackLine = fullLine.filter((_, i) => i < posIndex);

            console.info(attackLine);

            let pinnedPiece: Piece | null = null;

            for (const _pos of attackLine) {
              const destPiece = this.boardSquares[_pos].piece;
              if (destPiece !== null && destPiece.side !== side) {
                if (pinnedPiece instanceof Piece) {
                  pinnedPiece = null;
                  break;
                } else {
                  pinnedPiece = destPiece;
                }
              }
            };

            if (pinnedPiece) {
              console.log(pinnedPiece);
              pinnedPiece.availableMoves = pinnedPiece.availableMoves.filter((move) => attackLine.includes(move) || move === convertPosition(piece.position));
            }
            // let i = 0;
            // const pinnedPiece: Piece | null = null;

            // const pos = line[i];
            // while(pos !== enemyPos) {
            //   const destPiece = this.boardSquares[pos].piece;

            //   if (destPiece?.side === enemySide) {
                
            //   }
            // }

            // for (const pos of line) {
            //   const destPiece = this.boardSquares[pos].piece;

            //   if (destPiece?.side === enemySide) {
                
            //   }
            // }
          }
        }
      }
    }
  }
};

export default BoardManager;
