"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Types, interfaces, constants, ...
var Terms_1 = require("../../logic/Terms");
// Components
var Square_1 = require("../../components/Square");
var pieces_1 = require("../../components/pieces");
// Controllers, Managers, Observers
var MoveManager_1 = require("../move/MoveManager");
var BoardController = /** @class */ (function () {
    function BoardController(game, stateUpdateFunc) {
        var _this = this;
        this.boardSquares = {};
        this.setSubscription = function (updateFunc) { return function (params) {
            updateFunc(_this.compileBoard(params));
        }; };
        // TODO: Fix the paramters so that it tracks the different highlighted action type
        this.compileBoard = function (highlightedSquarePositions) {
            if (highlightedSquarePositions === void 0) { highlightedSquarePositions = []; }
            var processedBoard = [];
            for (var position in _this.boardSquares) {
                // console.log(typeof position);
                // console.log(typeof highlightedSquarePositions);
                processedBoard.push({
                    position: position,
                    square: {
                        color: _this.boardSquares[position].color,
                        focus: {
                            highlighted: highlightedSquarePositions.includes(position),
                            action: highlightedSquarePositions.includes(position) ? 'move' : null,
                        },
                    },
                    piece: _this.boardSquares[position].piece ? {
                        kind: _this.boardSquares[position].piece.kind,
                        side: _this.boardSquares[position].piece.side,
                    } : null
                });
            }
            ;
            return processedBoard;
        };
        // board highlighting will be acomplished here as well through state updates that will affect boardSquares
        this.highlightAvailableSquares = function (piece) {
            console.log(piece);
            // console.log(piece.availableMoves)
            if (piece instanceof pieces_1.default) {
                _this.updateBoard(piece.availableMoves);
            }
            else {
                _this.updateBoard([]);
            }
            ;
        };
        this.updateBoard = this.setSubscription(stateUpdateFunc);
        this.initializeBoard(game.startingFormation);
        this.moveManager = new MoveManager_1.default(this.boardSquares, this.updateBoard, this.highlightAvailableSquares);
        this.updateBoard([]);
    }
    ;
    BoardController.prototype.createPiece = function (_a) {
        var kind = _a.kind, side = _a.side;
        switch (kind) {
            case Terms_1.PieceKind.Pawn:
                return new pieces_1.Pawn(side);
            case Terms_1.PieceKind.Rook:
                return new pieces_1.Rook(side);
            case Terms_1.PieceKind.Knight:
                return new pieces_1.Knight(side);
            case Terms_1.PieceKind.Bishop:
                return new pieces_1.Bishop(side);
            case Terms_1.PieceKind.Queen:
                return new pieces_1.Queen(side);
            case Terms_1.PieceKind.King:
                return new pieces_1.King(side);
            // TODO: Assign this with the never typescript property
            default:
                return null;
        }
        ;
    };
    ;
    // TODO: replace orientationflipped with the side that the player is on defaulting to white
    BoardController.prototype.initializeBoard = function (boardConfiguration, side) {
        if (side === void 0) { side = 'white'; }
        // ?: If I include a board flipping function, do it here and pass the new positions to initializeSquares?
        this.initializeSquares(boardConfiguration);
    };
    ;
    BoardController.prototype.initializeSquares = function (pieceMapping) {
        for (var tileIndex in Terms_1.boardPositions) {
            var position = Terms_1.boardPositions[tileIndex];
            var regex = /b|d|f|h/;
            var isEvenRow = regex.test(position);
            var initialPiece = (typeof pieceMapping[position] === 'object') ? this.createPiece(pieceMapping[position]) : null;
            var squareColor = ((Number(tileIndex) % 8) + Number(isEvenRow)) % 2 === 0 ? 'light' : 'dark';
            var square = new Square_1.default(position, squareColor, initialPiece);
            this.boardSquares[position] = square;
        }
        ;
    };
    ;
    return BoardController;
}());
exports.default = BoardController;
;
//# sourceMappingURL=BoardController.js.map