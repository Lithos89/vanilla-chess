import { type Side } from '../logic/Terms';

// Classes
import Match from './Match';
import Square from '../components/Square';
import { Game } from './game/Game';
import BoardController from './board/BoardController';
import startingFormation from 'formation/setups/start';

type temp = { [shortPosition: string] : Square }

// session will be used so that broadcasts are appropriately handled

// session will allow for the scaling up of the app in the case of multiple opponents
class Session {
  private matches: Match[] = []
  currentMatch: Match

  
  constructor() {
    this.startNewMatch()
  };

  // ?: Could also add an 'opponent' parameter in the future
  startNewMatch(side: Side = 'white') {
    const match = new Match(side);
    this.matches.push(match)
    this.updateCurrentMatch()
  }

  updateCurrentMatch(index: number = this.matches.length - 1) {
    this.currentMatch = this.matches[index];
  }

};

export function startSession(side: Side = 'white'): 
    { 
      matchController: {
        // reset: typeof Match.prototype['resetGame'],
      },
      showcase: () => void
    }
  {

  const session = new Session();
  const currentMatch = session.currentMatch;

  const generateNewBoard = (generator: Generator<Game, Game, Game>) => (stateUpdateFunc) => {
    const newGame = generator.next().value;
    const boardController = new BoardController(newGame, stateUpdateFunc)
    const moveController = boardController.moveManager.controller
    return moveController.requestMove
  }

  const matchController = {
    generateGame: generateNewBoard(currentMatch.gameGenerator)
  };

  const showcase = () => {
    // console.info(currentGame.id)
    // console.info(gameSquares);
  }
  
  return { matchController, showcase };
}
