
import { isNull } from 'lodash';

// Types, interfaces, constants, ...
import { type ShortPosition } from 'logic/Terms';

// Game Management
import Game from './Game';

class GameController extends Game {
  private selectedSquarePos: ShortPosition | null = null;

  // *: Move highlighting management for selecting/deselecting a square with a piece
  public selectSquare(position: ShortPosition) {
    console.info(position);
    const isNewSelection = isNull(this.selectedSquarePos);

    //* Selecting a square while no square is highlighted
    if (isNewSelection) {
      const didHighlight = this.attemptHighlight(position);
      
      if (didHighlight) 
        this.selectedSquarePos = position;


    //* Selecting the same square or a new square, triggering unhighlighting
    } else {
      const didUnhighlight = this.attemptHighlight();

      if (didUnhighlight)
        this.selectedSquarePos = null;
    };
  };

  // TODO: Add more to this function
  public move(from: ShortPosition, to: ShortPosition): boolean {
    if (from !== to) {
      return this.attemptMove(from, to);
    } else {
      return false;
    };
  };

  // TODO: Add more to this function
  public requestUndo() {
    this.undo();
  };
};

export default GameController;