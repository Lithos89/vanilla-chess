"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Types, interfaces, constants, ...
var terms_1 = require("../../logic/terms");
// Components
var Piece_1 = require("./Piece");
// Algorithms
var core_1 = require("../../logic/algorithms/core");
// Utils
var convertPosition_1 = require("../../utils/regulation/position/convertPosition");
var calcDistance_1 = require("../../utils/regulation/position/calcDistance");
var getBoardDirection_1 = require("../../utils/regulation/direction/getBoardDirection");
var getEnemySide_1 = require("../../utils/regulation/side/getEnemySide");
var King = /** @class */ (function (_super) {
    __extends(King, _super);
    function King() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = terms_1.PieceKind.King;
        _this.movementAlgorithms = null;
        _this.moved = false;
        _this.checks = [];
        _this.influenceEmptySquare = function (square) {
            var squarePos = (0, convertPosition_1.default)(square.position);
            var enemySide = (0, getEnemySide_1.default)(_this.side);
            var enemyKingControlledSquares = _this.enemyKing.legalLines.flat(2);
            //?: enemyKingControlledSquares used because kings are update one after the other, causing bugs if not used (could fix)
            var squareControlledByEnemy = square.controlled[enemySide] || enemyKingControlledSquares.includes(squarePos);
            if (!squareControlledByEnemy) {
                var castlingMove = (0, calcDistance_1.default)(_this.position, square.position) > 1;
                if (castlingMove) {
                    var castlingDirection = (0, getBoardDirection_1.default)(_this.position, square.position, 'horizontal');
                    return _this.isCastleAvailable(castlingDirection);
                }
                else {
                    square.controlled[_this.side] = true;
                    return true;
                }
                ;
            }
            else {
                return false;
            }
            ;
        };
        _this.influenceOccupiedSquare = function (square) {
            var destPiece = square.piece;
            var simpleCaptureAvailable = (destPiece === null || destPiece === void 0 ? void 0 : destPiece.side) === (0, getEnemySide_1.default)(_this.side);
            if (simpleCaptureAvailable) {
                if (!(destPiece === null || destPiece === void 0 ? void 0 : destPiece.isProtected)) {
                    return true;
                }
                ;
            }
            else {
                destPiece.isProtected = true;
            }
            ;
            return false;
        };
        return _this;
    }
    King.prototype.loadMoveAlgorithms = function () {
        var rankMoveDistance = this.moved ? 1 : 2;
        return [core_1.default.file(1), core_1.default.diagonals(1), core_1.default.rank(rankMoveDistance)];
    };
    ;
    /*----------------------------------CASTLING------------------------------*/
    King.prototype.setCastleAvailableCallback = function (callback) {
        this.isCastleAvailable = callback;
    };
    ;
    return King;
}(Piece_1.default));
;
exports.default = King;
//# sourceMappingURL=King.js.map