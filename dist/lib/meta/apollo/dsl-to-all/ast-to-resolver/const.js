"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Precedence = exports.E_TFT = exports.E_FFT = exports.E_TFF = exports.E_TTT = exports.E_TTF = exports.E_FTT = exports.S_TTFF = exports.S_TFTF = exports.S_FFFF = exports.S_TFFT = exports.S_TFFF = exports.F_SEMICOLON_OPT = exports.F_DIRECTIVE_CTX = exports.F_FUNC_BODY = exports.F_ALLOW_UNPARATH_NEW = exports.F_ALLOW_CALL = exports.F_ALLOW_IN = void 0;
//Flags
exports.F_ALLOW_IN = 1, exports.F_ALLOW_CALL = 1 << 1, exports.F_ALLOW_UNPARATH_NEW = 1 << 2, exports.F_FUNC_BODY = 1 << 3, exports.F_DIRECTIVE_CTX = 1 << 4, exports.F_SEMICOLON_OPT = 1 << 5;
//Statement flag sets
//NOTE: Flag order:
// F_ALLOW_IN
// F_FUNC_BODY
// F_DIRECTIVE_CTX
// F_SEMICOLON_OPT
exports.S_TFFF = exports.F_ALLOW_IN, exports.S_TFFT = exports.F_ALLOW_IN | exports.F_SEMICOLON_OPT, exports.S_FFFF = 0x00, exports.S_TFTF = exports.F_ALLOW_IN | exports.F_DIRECTIVE_CTX, exports.S_TTFF = exports.F_ALLOW_IN | exports.F_FUNC_BODY;
//Expression flag sets
//NOTE: Flag order:
// F_ALLOW_IN
// F_ALLOW_CALL
// F_ALLOW_UNPARATH_NEW
exports.E_FTT = exports.F_ALLOW_CALL | exports.F_ALLOW_UNPARATH_NEW, exports.E_TTF = exports.F_ALLOW_IN | exports.F_ALLOW_CALL, exports.E_TTT = exports.F_ALLOW_IN | exports.F_ALLOW_CALL | exports.F_ALLOW_UNPARATH_NEW, exports.E_TFF = exports.F_ALLOW_IN, exports.E_FFT = exports.F_ALLOW_UNPARATH_NEW, exports.E_TFT = exports.F_ALLOW_IN | exports.F_ALLOW_UNPARATH_NEW;
exports.Precedence = {
    Sequence: 0,
    Yield: 1,
    Assignment: 1,
    Conditional: 2,
    ArrowFunction: 2,
    LogicalOR: 3,
    LogicalAND: 4,
    BitwiseOR: 5,
    BitwiseXOR: 6,
    BitwiseAND: 7,
    Equality: 8,
    Relational: 9,
    BitwiseSHIFT: 10,
    Additive: 11,
    Multiplicative: 12,
    Exponentiation: 13,
    Await: 14,
    Unary: 14,
    Postfix: 15,
    OptionalChaining: 16,
    Call: 17,
    New: 18,
    TaggedTemplate: 19,
    Member: 20,
    Primary: 21
};
