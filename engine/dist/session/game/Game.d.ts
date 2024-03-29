import { type ShortPosition, type Side } from '../../logic/terms';
import Observable from '../../state/observable';
declare class Game implements Observable {
    protected readonly playerSide: Side | null;
    readonly id: string;
    private readonly startingFormation;
    protected currentTurnSide: Side;
    private turnCount;
    protected isOver: boolean;
    private result;
    private boardManager;
    private moveManager;
    private observer;
    private moveController;
    protected signalFinish: (result: Side | 'draw') => (() => void);
    protected startNextGameCallback: () => void;
    constructor(id: string, playerSide?: Side | null);
    signalState: (type?: string, data?: {}) => void;
    private takeTurn;
    private takeComputerTurn;
    protected attemptHighlight: (position?: ShortPosition) => boolean;
    protected attemptMove: (from: ShortPosition, to: ShortPosition) => boolean;
    protected genRandomMove: (side: Side) => any;
    protected undo: () => void;
    updateMoves: (sideLastMoved?: Side) => void;
}
export default Game;
