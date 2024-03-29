"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var terms_1 = require("../../logic/terms");
// ? In the future, consider converting this file into JSON (see if there is some sort of type specification that I am allowed to set)
// ? and then create some sort of transpiler to map it to a type annotated object
// only do this if you end up making more than one static formation
var startingFormation = {
    'a1': { kind: terms_1.PieceKind.Rook, side: 'white' },
    'b1': { kind: terms_1.PieceKind.Knight, side: 'white' },
    'c1': { kind: terms_1.PieceKind.Bishop, side: 'white' },
    'd1': { kind: terms_1.PieceKind.Queen, side: 'white' },
    'e1': { kind: terms_1.PieceKind.King, side: 'white' },
    'f1': { kind: terms_1.PieceKind.Bishop, side: 'white' },
    'g1': { kind: terms_1.PieceKind.Knight, side: 'white' },
    'h1': { kind: terms_1.PieceKind.Rook, side: 'white' },
    'a2': { kind: terms_1.PieceKind.Pawn, side: 'white' },
    'b2': { kind: terms_1.PieceKind.Pawn, side: 'white' },
    'c2': { kind: terms_1.PieceKind.Pawn, side: 'white' },
    'd2': { kind: terms_1.PieceKind.Pawn, side: 'white' },
    'e2': { kind: terms_1.PieceKind.Pawn, side: 'white' },
    'f2': { kind: terms_1.PieceKind.Pawn, side: 'white' },
    'g2': { kind: terms_1.PieceKind.Pawn, side: 'white' },
    'h2': { kind: terms_1.PieceKind.Pawn, side: 'white' },
    'a7': { kind: terms_1.PieceKind.Pawn, side: 'black' },
    'b7': { kind: terms_1.PieceKind.Pawn, side: 'black' },
    'c7': { kind: terms_1.PieceKind.Pawn, side: 'black' },
    'd7': { kind: terms_1.PieceKind.Pawn, side: 'black' },
    'e7': { kind: terms_1.PieceKind.Pawn, side: 'black' },
    'f7': { kind: terms_1.PieceKind.Pawn, side: 'black' },
    'g7': { kind: terms_1.PieceKind.Pawn, side: 'black' },
    'h7': { kind: terms_1.PieceKind.Pawn, side: 'black' },
    'a8': { kind: terms_1.PieceKind.Rook, side: 'black' },
    'b8': { kind: terms_1.PieceKind.Knight, side: 'black' },
    'c8': { kind: terms_1.PieceKind.Bishop, side: 'black' },
    'd8': { kind: terms_1.PieceKind.Queen, side: 'black' },
    'e8': { kind: terms_1.PieceKind.King, side: 'black' },
    'f8': { kind: terms_1.PieceKind.Bishop, side: 'black' },
    'g8': { kind: terms_1.PieceKind.Knight, side: 'black' },
    'h8': { kind: terms_1.PieceKind.Rook, side: 'black' },
};
exports.default = startingFormation;
//# sourceMappingURL=start.js.map