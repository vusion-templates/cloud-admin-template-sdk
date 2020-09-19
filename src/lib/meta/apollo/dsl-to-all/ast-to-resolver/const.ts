
  //Flags
  export const F_ALLOW_IN = 1,
      F_ALLOW_CALL = 1 << 1,
      F_ALLOW_UNPARATH_NEW = 1 << 2,
      F_FUNC_BODY = 1 << 3,
      F_DIRECTIVE_CTX = 1 << 4,
      F_SEMICOLON_OPT = 1 << 5;

  //Statement flag sets
  //NOTE: Flag order:
  // F_ALLOW_IN
  // F_FUNC_BODY
  // F_DIRECTIVE_CTX
  // F_SEMICOLON_OPT
  export const S_TFFF = F_ALLOW_IN,
      S_TFFT = F_ALLOW_IN | F_SEMICOLON_OPT,
      S_FFFF = 0x00,
      S_TFTF = F_ALLOW_IN | F_DIRECTIVE_CTX,
      S_TTFF = F_ALLOW_IN | F_FUNC_BODY;

//Expression flag sets
//NOTE: Flag order:
// F_ALLOW_IN
// F_ALLOW_CALL
// F_ALLOW_UNPARATH_NEW
export const E_FTT = F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW,
  E_TTF = F_ALLOW_IN | F_ALLOW_CALL,
  E_TTT = F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW,
  E_TFF = F_ALLOW_IN,
  E_FFT = F_ALLOW_UNPARATH_NEW,
  E_TFT = F_ALLOW_IN | F_ALLOW_UNPARATH_NEW;

export const Precedence = {
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
