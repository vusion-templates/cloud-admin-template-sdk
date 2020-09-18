// Helpers.
import { ExtraOptions, GlobalEnv, ESASTNode, Indent } from ".";
import {
  endsWithLineTerminator,
  escapeString,
  stringRepeat,
  toSourceNodeWhenNeeded,
  noEmptySpace,
  parenthesize,
  join,
  addIndent,
  hasLineTerminator,
  calculateSpaces,
  escapeRegExpCharacter
} from './tools';
import { Precedence } from "./const";
import * as estraverse from 'estraverse';
import esutils from 'esutils';
//Flags
const F_ALLOW_IN = 1,
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
const S_TFFF = F_ALLOW_IN,
  S_TFFT = F_ALLOW_IN | F_SEMICOLON_OPT,
  S_FFFF = 0x00,
  S_TFTF = F_ALLOW_IN | F_DIRECTIVE_CTX,
  S_TTFF = F_ALLOW_IN | F_FUNC_BODY;

//Expression flag sets
//NOTE: Flag order:
// F_ALLOW_IN
// F_ALLOW_CALL
// F_ALLOW_UNPARATH_NEW
const E_FTT = F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW,
  E_TTF = F_ALLOW_IN | F_ALLOW_CALL,
  E_TTT = F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW,
  E_TFF = F_ALLOW_IN,
  E_FFT = F_ALLOW_UNPARATH_NEW,
  E_TFT = F_ALLOW_IN | F_ALLOW_UNPARATH_NEW;

const BinaryPrecedence: {
  [operator: string]: number;
} = {
  '||': Precedence.LogicalOR,
  '&&': Precedence.LogicalAND,
  '|': Precedence.BitwiseOR,
  '^': Precedence.BitwiseXOR,
  '&': Precedence.BitwiseAND,
  '==': Precedence.Equality,
  '!=': Precedence.Equality,
  '===': Precedence.Equality,
  '!==': Precedence.Equality,
  'is': Precedence.Equality,
  'isnt': Precedence.Equality,
  '<': Precedence.Relational,
  '>': Precedence.Relational,
  '<=': Precedence.Relational,
  '>=': Precedence.Relational,
  'in': Precedence.Relational,
  'instanceof': Precedence.Relational,
  '<<': Precedence.BitwiseSHIFT,
  '>>': Precedence.BitwiseSHIFT,
  '>>>': Precedence.BitwiseSHIFT,
  '+': Precedence.Additive,
  '-': Precedence.Additive,
  '*': Precedence.Multiplicative,
  '%': Precedence.Multiplicative,
  '/': Precedence.Multiplicative,
  '**': Precedence.Exponentiation
};
export interface Expr {
  operator: string;
  expressions: string;
  optional: boolean;
  arguments: string;
  callee: any;
  prefix: string;
  source: string;
}
export interface Comment {
  type: string;
  value: string;
}
//  FORMAT_DEFAULTS = getDefaultOptions().format;
export class Generator {
  node: ESASTNode;
  globalEnv: GlobalEnv;
  extra: ExtraOptions;
  Syntax: any;
  [key: string]: any;

  constructor(node: ESASTNode, globalEnv: GlobalEnv, extra: ExtraOptions) {
    this.node = node;
    this.globalEnv = globalEnv;
    this.extra = extra;
    this.Syntax = estraverse.Syntax;
    // 标记表达式类型
  }

  // Generation is done by generateExpression.
  isExpression = (node: ESASTNode) => {
    return Object.prototype.hasOwnProperty.call(this.Expression, node.type);
  }

  // Generation is done by generateStatement.
  isStatement = (node: ESASTNode) => {
    return Object.prototype.hasOwnProperty.call(this.Statement, node.type);
  }

  generateInternal = () => {
    if (this.isStatement(this.node)) {
      return this.generateStatement(this.node, S_TFFF);
    }

    if (this.isExpression(this.node)) {
      return this.generateExpression(this.node, Precedence.Sequence, E_TTT);
    }

    throw new Error('Unknown node type: ' + this.node.type);
  }

  generateIdentifier = (node: ESASTNode) => {
    return toSourceNodeWhenNeeded(node.name, node, this.globalEnv);
  }

  generateAsyncPrefix = (node: ESASTNode, spaceRequired: boolean) => {
    return node.async ? 'async' + (spaceRequired ? noEmptySpace(this.globalEnv.space) : this.globalEnv.space) : '';
  }

  generateStarSuffix = (node: ESASTNode) => {
    const isGenerator = node.generator && !this.extra.moz.starlessGenerator;
    return isGenerator ? '*' + this.globalEnv.space : '';
  }

  generateMethodPrefix = (prop: any) => {
    const func: ESASTNode = prop.value;
    let prefix = '';
    if (func.async) {
      prefix += this.generateAsyncPrefix(func, !prop.computed);
    }
    if (func.generator) {
      // avoid space before method name
      prefix += this.generateStarSuffix(func) ? '*' : '';
    }
    return prefix;
  }

  generatePattern = (node: any, precedence: number, flags: number) => {
    if (node.type === this.Syntax.Identifier) {
      return this.generateIdentifier(node);
    }
    return this.generateExpression(node, precedence, flags);
  };

  generateNumber = (value: any) => {
    let result, point, temp, exponent, pos;
  
    if (value !== value) {
        throw new Error('Numeric literal whose value is NaN');
    }
    if (value < 0 || (value === 0 && 1 / value < 0)) {
        throw new Error('Numeric literal whose value is negative');
    }
  
    if (value === 1 / 0) {
        return this.globalEnv.json ? 'null' : this.globalEnv.renumber ? '1e400' : '1e+400';
    }
  
    result = '' + value;
    if (!this.globalEnv.renumber || result.length < 3) {
        return result;
    }
  
    point = result.indexOf('.');
    if (!this.globalEnv.json && result.charCodeAt(0) === 0x30  /* 0 */ && point === 1) {
        point = 0;
        result = result.slice(1);
    }
    temp = result;
    result = result.replace('e+', 'e');
    exponent = 0;
    if ((pos = temp.indexOf('e')) > 0) {
        exponent = +temp.slice(pos + 1);
        temp = temp.slice(0, pos);
    }
    if (point >= 0) {
        exponent -= temp.length - point - 1;
        temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
    }
    pos = 0;
    while (temp.charCodeAt(temp.length + pos - 1) === 0x30  /* 0 */) {
        --pos;
    }
    if (pos !== 0) {
        exponent -= pos;
        temp = temp.slice(0, pos);
    }
    if (exponent !== 0) {
        temp += 'e' + exponent;
    }
    if ((temp.length < result.length ||
                (this.globalEnv.hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) &&
            +temp === value) {
        result = temp;
    }
  
    return result;
  }

  generateRegExp = (reg: RegExp) => {
    let match, result, flags, i, iz, ch, characterInBrack, previousIsBackslash;
    result = reg.toString();
  
    if (reg.source) {
        // extract flag from toString result
        match = result.match(/\/([^/]*)$/);
        if (!match) {
            return result;
        }
  
        flags = match[1];
        result = '';
  
        characterInBrack = false;
        previousIsBackslash = false;
        for (i = 0, iz = reg.source.length; i < iz; ++i) {
            ch = reg.source.charCodeAt(i);
  
            if (!previousIsBackslash) {
                if (characterInBrack) {
                    if (ch === 93) {  // ]
                        characterInBrack = false;
                    }
                } else {
                    if (ch === 47) {  // /
                        result += '\\';
                    } else if (ch === 91) {  // [
                        characterInBrack = true;
                    }
                }
                result += escapeRegExpCharacter(ch, previousIsBackslash);
                previousIsBackslash = ch === 92;  // \
            } else {
                // if new RegExp("\\\n') is provided, create /\n/
                result += escapeRegExpCharacter(ch, previousIsBackslash);
                // prevent like /\\[/]/
                previousIsBackslash = false;
            }
        }
  
        return '/' + result + '/' + flags;
    }
  
    return result;
  }

  generateFunctionParams = (node: ESASTNode) => {
    let i, iz, hasDefault;
    let result: any[] = [];

    hasDefault = false;

    if (node.type === this.Syntax.ArrowFunctionExpression &&
      !node.rest && (!node.defaults || node.defaults.length === 0) &&
      node.params.length === 1 && node.params[0].type === this.Syntax.Identifier) {
      // arg => { } case
      result = [this.generateAsyncPrefix(node, true), this.generateIdentifier(node.params[0])];
    } else {
      result = node.type === this.Syntax.ArrowFunctionExpression ? [this.generateAsyncPrefix(node, false)] : [];
      result.push('(');
      if (node.defaults) {
        hasDefault = true;
      }
      for (i = 0, iz = node.params.length; i < iz; ++i) {
        if (hasDefault && node.defaults[i]) {
          // Handle default values.
          result.push(
            this.generateAssignment(
            node.params[i], 
            node.defaults[i],
            '=', 
            Precedence.Assignment, 
            E_TTT
            )
          );
        } else {
          result.push(this.generatePattern(node.params[i], Precedence.Assignment, E_TTT));
        }
        if (i + 1 < iz) {
          result.push(',' + this.globalEnv.space);
        }
      }

      if (node.rest) {
        if (node.params.length) {
          result.push(',' + this.globalEnv.space);
        }
        result.push('...');
        result.push(this.generateIdentifier(node.rest));
      }

      result.push(')');
    }

    return result;
  };

  generateFunctionBody = (node: ESASTNode) => {
    let expr;

    const result = this.generateFunctionParams(node);

    if (node.type === this.Syntax.ArrowFunctionExpression) {
      result.push(this.globalEnv.space);
      result.push('=>');
    }

    if (node.expression) {
      result.push(this.globalEnv.space);
      expr = this.generateExpression(node.body, Precedence.Assignment, E_TTT);
      if (expr.toString().charAt(0) === '{') {
        expr = ['(', expr, ')'];
      }
      result.push(expr);
    } else {
      result.push(this.maybeBlock(node.body, S_TTFF));
    }

    return result;
  };

  generateIterationForStatement = (operator: any, stmt: any, flags: number) => {
    let result: any[] = ['for' + (stmt.await ? noEmptySpace(this.globalEnv.space) + 'await' : '') + this.globalEnv.space + '('];
    this.withIndent(() => {
      if (stmt.left.type === this.Syntax.VariableDeclaration) {
        this.withIndent(() => {
          result.push(stmt.left.kind + noEmptySpace(this.globalEnv.space));
          result.push(this.generateStatement(stmt.left.declarations[0], S_FFFF));
        });
      } else {
        result.push(this.generateExpression(stmt.left, Precedence.Call, E_TTT));
      }

      result = join(result, operator, this.globalEnv);
      result = [join(
        result,
        this.generateExpression(stmt.right, Precedence.Assignment, E_TTT),
        this.globalEnv
      ), ')'];
    });
    result.push(this.maybeBlock(stmt.body, flags));
    return result;
  };

  generatePropertyKey = (expr: ESASTNode, computed: boolean) => {
    const result = [];

    if (computed) {
      result.push('[');
    }

    result.push(this.generateExpression(expr, Precedence.Assignment, E_TTT));

    if (computed) {
      result.push(']');
    }

    return result;
  };

  generateAssignment = (left: any, right: any, operator: string, precedence: number, flags: number) => {
    if (Precedence.Assignment < precedence) {
      flags |= F_ALLOW_IN;
    }

    return parenthesize(
      [
        this.generateExpression(left, Precedence.Call, flags),
        this.globalEnv.space + operator + this.globalEnv.space,
        this.generateExpression(right, Precedence.Assignment, flags)
      ],
      Precedence.Assignment,
      precedence
    );
  };

  semicolon = (flags: number) => {
    if (!this.globalEnv.semicolons && flags & F_SEMICOLON_OPT) {
      return '';
    }
    return ';';
  };

  generateVerbatimString = (string: any) => {
    let i, iz;
    const result = string.split(/\r\n|\n/);
    for (i = 1, iz = result.length; i < iz; i++) {
      result[i] = this.globalEnv.newline + this.globalEnv.base + result[i];
    }
    return result;
  }

  generateVerbatim = (expr: ESASTNode, precedence: number) => {
    let result, prec;
    const verbatim: any = expr[this.extra.verbatim];

    if (typeof verbatim === 'string') {
      result = parenthesize(this.generateVerbatimString(verbatim), Precedence.Sequence, precedence);
    } else {
      // verbatim is object
      result = this.generateVerbatimString(verbatim.content);
      prec = (verbatim.precedence != null) ? verbatim.precedence : Precedence.Sequence;
      result = parenthesize(result, prec, precedence);
    }

    return toSourceNodeWhenNeeded(result, expr, this.globalEnv);
  }

  generateBlankLines = (start: number, end: number, result: string[]) => {
    let j, newlineCount = 0;

    for (j = start; j < end; j++) {
      if (this.globalEnv.sourceCode[j] === '\n') {
        newlineCount++;
      }
    }

    for (j = 1; j < newlineCount; j++) {
      result.push(this.globalEnv.newline);
    }
  }

  generateExpression = (expr: ESASTNode, precedence: number, flags: number) => {
    const type = expr.type || this.Syntax.Property;

    if (this.extra.verbatim && Object.prototype.hasOwnProperty.call(expr, this.extra.verbatim)) {
      return this.generateVerbatim(expr, precedence);
    }

    // 表达式类型的解析方式
    let result = this.Expression[type](expr, precedence, flags);
    if (this.extra.comment) {
      result = this.addComments(expr, result);
    }

    return toSourceNodeWhenNeeded(result, expr, this.globalEnv);
  };

  generateComment = (comment: Comment, specialBase?: string) => {
    if (comment.type === 'Line') {
        if (endsWithLineTerminator(comment.value)) {
            return '//' + comment.value;
        } else {
            // Always use LineTerminator
            let result = '//' + comment.value;
            if (!this.globalEnv.preserveBlankLines) {
                result += '\n';
            }
            return result;
        }
    }
    if (this.extra.format.indent.adjustMultilineComment && /[\n\r]/.test(comment.value)) {
        return this.adjustMultilineComment('/*' + comment.value + '*/', specialBase);
    }
    return '/*' + comment.value + '*/';
  }
  
  addComments = (stmt: ESASTNode, result: any[]) => {
    let i, len, comment, save, tailingToStatement, specialBase = null, fragment,
        extRange, range, prevRange, prefix, infix, suffix, count;
  
    if (stmt.leadingComments && stmt.leadingComments.length > 0) {
        save = result;
  
        if (this.globalEnv.preserveBlankLines) {
            comment = stmt.leadingComments[0];
            result = [];
  
            extRange = comment.extendedRange;
            range = comment.range;
  
            prefix = this.globalEnv.sourceCode.substring(extRange[0], range[0]);
            count = (prefix.match(/\n/g) || []).length;
            if (count > 0) {
                result.push(stringRepeat('\n', count));
                result.push(addIndent(this.generateComment(comment), this.globalEnv));
            } else {
                result.push(prefix);
                result.push(this.generateComment(comment));
            }
  
            prevRange = range;
  
            for (i = 1, len = stmt.leadingComments.length; i < len; i++) {
                comment = stmt.leadingComments[i];
                range = comment.range;
  
                infix = this.globalEnv.sourceCode.substring(prevRange[1], range[0]);
                count = (infix.match(/\n/g) || []).length;
                result.push(stringRepeat('\n', count));
                result.push(addIndent(this.generateComment(comment), this.globalEnv));
  
                prevRange = range;
            }
  
            suffix = this.globalEnv.sourceCode.substring(range[1], extRange[1]);
            count = (suffix.match(/\n/g) || []).length;
            result.push(stringRepeat('\n', count));
        } else {
            comment = stmt.leadingComments[0];
            result = [];
            if (this.globalEnv.safeConcatenation && stmt.type === this.Syntax.Program && stmt.body.length === 0) {
                result.push('\n');
            }
            result.push(this.generateComment(comment));
            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
                result.push('\n');
            }
  
            for (i = 1, len = stmt.leadingComments.length; i < len; ++i) {
                comment = stmt.leadingComments[i];
                fragment = [this.generateComment(comment)];
                if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
                    fragment.push('\n');
                }
                result.push(addIndent(fragment, this.globalEnv));
            }
        }
  
        result.push(addIndent(save, this.globalEnv));
    }
  
    if (stmt.trailingComments) {
  
        if (this.globalEnv.preserveBlankLines) {
            comment = stmt.trailingComments[0];
            extRange = comment.extendedRange;
            range = comment.range;
  
            prefix = this.globalEnv.sourceCode.substring(extRange[0], range[0]);
            count = (prefix.match(/\n/g) || []).length;
  
            if (count > 0) {
                result.push(stringRepeat('\n', count));
                result.push(addIndent(this.generateComment(comment), this.globalEnv));
            } else {
                result.push(prefix);
                result.push(this.generateComment(comment), this.globalEnv);
            }
        } else {
            tailingToStatement = !endsWithLineTerminator(toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString());
            specialBase = stringRepeat(' ', calculateSpaces(toSourceNodeWhenNeeded([this.globalEnv.base, result, this.globalEnv.indent], {}, this.globalEnv).toString()));
            for (i = 0, len = stmt.trailingComments.length; i < len; ++i) {
                comment = stmt.trailingComments[i];
                if (tailingToStatement) {
                    // We assume target like following script
                    //
                    // var t = 20;  /**
                    //               * This is comment of t
                    //               */
                    if (i === 0) {
                        // first case
                        result = [result, this.globalEnv.indent];
                    } else {
                        result = [result, specialBase];
                    }
                    result.push(this.generateComment(comment, specialBase));
                } else {
                    result = [result, addIndent(this.generateComment(comment), this.globalEnv)];
                }
                if (i !== len - 1 && !endsWithLineTerminator(toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
                    result = [result, '\n'];
                }
            }
        }
    }
  
    return result;
  }
  
  adjustMultilineComment = (value: string, specialBase?: any) => {
    let i, len, line, j, previousBase, sn;
  
    const array = value.split(/\r\n|[\r\n]/);
    let spaces = Number.MAX_VALUE;
  
    // first line doesn't have indentation
    for (i = 1, len = array.length; i < len; ++i) {
        line = array[i];
        j = 0;
        while (j < line.length && esutils.code.isWhiteSpace(line.charCodeAt(j))) {
            ++j;
        }
        if (spaces > j) {
            spaces = j;
        }
    }
  
    if (typeof specialBase !== 'undefined') {
        // pattern like
        // {
        //   var t = 20;  /*
        //                 * this is comment
        //                 */
        // }
        previousBase = this.globalEnv.base;
        if (array[1][spaces] === '*') {
            specialBase += ' ';
        }
        this.globalEnv.base = specialBase;
    } else {
        if (spaces & 1) {
            // /*
            //  *
            //  */
            // If spaces are odd number, above pattern is considered.
            // We waste 1 space.
            --spaces;
        }
        previousBase = this.globalEnv.base;
    }
  
    for (i = 1, len = array.length; i < len; ++i) {
        sn = toSourceNodeWhenNeeded(addIndent(array[i].slice(spaces), this.globalEnv), undefined, this.globalEnv);
        array[i] = this.globalEnv.sourceMap ? sn.join('') : sn;
    }
  
    this.globalEnv.base = previousBase;
  
    return array.join('\n');
  }

  generateStatement = (stmt: ESASTNode, flags: number) => {
    let result = this.Statement[stmt.type](stmt, flags);

    // Attach comments

    if (this.extra.comment) {
      result = this.addComments(stmt, result);
    }

    const fragment = toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString();
    if (stmt.type === this.Syntax.Program && !this.safeConcatenation && this.globalEnv.newline === '' && fragment.charAt(fragment.length - 1) === '\n') {
      result = this.globalEnv.sourceMap ? toSourceNodeWhenNeeded(result, undefined, this.globalEnv).replaceRight(/\s+$/, '') : fragment.replace(/\s+$/, '');
    }

    return toSourceNodeWhenNeeded(result, stmt, this.globalEnv);
  };

  maybeBlock = (stmt: ESASTNode, flags: number) => {
    let result;
    const noLeadingComment = !this.extra.comment || !stmt.leadingComments;

    if (stmt.type === this.Syntax.BlockStatement && noLeadingComment) {
      return [this.globalEnv.space, this.generateStatement(stmt, flags)];
    }

    if (stmt.type === this.Syntax.EmptyStatement && noLeadingComment) {
      return ';';
    }

    this.withIndent(() => {
      result = [
        this.globalEnv.newline,
        addIndent(this.generateStatement(stmt, flags), this.globalEnv)
      ];
    });

    return result;
  };

  maybeBlockSuffix = (stmt: ESASTNode, result: any) => {
    const ends = endsWithLineTerminator(toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString());
    if (stmt.type === this.Syntax.BlockStatement && (!this.extra.comment || !stmt.leadingComments) && !ends) {
      return [result, this.globalEnv.space];
    }
    if (ends) {
      return [result, this.globalEnv.base];
    }
    return [result, this.globalEnv.newline, this.globalEnv.base];
  };

  withIndent = (fn: any) => {
    const previousBase = this.globalEnv.base;
    this.globalEnv.base += this.globalEnv.indent;
    fn(this.globalEnv.base);
    this.globalEnv.base = previousBase;
  };

  Expression: {
    [key: string]: any;
  } = {
      SequenceExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        let i, iz;
        if (Precedence.Sequence < precedence) {
          flags |= F_ALLOW_IN;
        }
        const result = [];
        for (i = 0, iz = expr.expressions.length; i < iz; ++i) {
          result.push(this.generateExpression(expr.expressions[i], Precedence.Assignment, flags));
          if (i + 1 < iz) {
            result.push(',' + this.globalEnv.space);
          }
        }
        return parenthesize(result, Precedence.Sequence, precedence);
      },

      AssignmentExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        return this.generateAssignment(expr.left, expr.right, expr.operator, precedence, flags);
      },

      ArrowFunctionExpression: (expr: ESASTNode, precedence: number) => {
        return parenthesize(this.generateFunctionBody(expr), Precedence.ArrowFunction, precedence);
      },

      ConditionalExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        if (Precedence.Conditional < precedence) {
          flags |= F_ALLOW_IN;
        }
        return parenthesize([
          this.generateExpression(expr.test, Precedence.LogicalOR, flags),
          this.globalEnv.space + '?' + this.globalEnv.space,
          this.generateExpression(expr.consequent, Precedence.Assignment, flags),
          this.globalEnv.space + ':' + this.globalEnv.space,
          this.generateExpression(expr.alternate, Precedence.Assignment, flags)
        ],
          Precedence.Conditional,
          precedence
        );
      },

      LogicalExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        return this.Expression.BinaryExpression(expr, precedence, flags);
      },

      BinaryExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        let result, fragment;
        const currentPrecedence = BinaryPrecedence[expr.operator];
        const leftPrecedence = expr.operator === '**' ? Precedence.Postfix : currentPrecedence;
        const rightPrecedence = expr.operator === '**' ? currentPrecedence : currentPrecedence + 1;

        if (currentPrecedence < precedence) {
          flags |= F_ALLOW_IN;
        }

        fragment = this.generateExpression(expr.left, leftPrecedence, flags);

        const leftSource = fragment.toString();

        if (leftSource.charCodeAt(leftSource.length - 1) === 0x2F /* / */ && esutils.code.isIdentifierPartES5(expr.operator.charCodeAt(0))) {
          result = [fragment, noEmptySpace(this.globalEnv.space), expr.operator];
        } else {
          result = join(fragment, expr.operator, this.globalEnv);
        }

        fragment = this.generateExpression(expr.right, rightPrecedence, flags);

        if (expr.operator === '/' && fragment.toString().charAt(0) === '/' ||
          expr.operator.slice(-1) === '<' && fragment.toString().slice(0, 3) === '!--') {
          // If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
          result.push(noEmptySpace(this.globalEnv.space));
          result.push(fragment);
        } else {
          result = join(result, fragment, this.globalEnv);
        }

        if (expr.operator === 'in' && !(flags & F_ALLOW_IN)) {
          return ['(', result, ')'];
        }
        return parenthesize(result, currentPrecedence, precedence);
      },

      CallExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        let i, iz;

        // F_ALLOW_UNPARATH_NEW becomes false.
        const result = [this.generateExpression(expr.callee, Precedence.Call, E_TTF)];

        if (expr.optional) {
          result.push('?.');
        }

        result.push('(');
        for (i = 0, iz = expr['arguments'].length; i < iz; ++i) {
          result.push(this.generateExpression(expr['arguments'][i], Precedence.Assignment, E_TTT));
          if (i + 1 < iz) {
            result.push(',' + this.globalEnv.space);
          }
        }
        result.push(')');

        if (!(flags & F_ALLOW_CALL)) {
          return ['(', result, ')'];
        }

        return parenthesize(result, Precedence.Call, precedence);
      },

      ChainExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        if (Precedence.OptionalChaining < precedence) {
          flags |= F_ALLOW_CALL;
        }

        const result = this.generateExpression(expr.expression, Precedence.OptionalChaining, flags);

        return parenthesize(result, Precedence.OptionalChaining, precedence);
      },

      NewExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        let i, iz;
        const length = expr['arguments'].length;
        // F_ALLOW_CALL becomes false.
        // F_ALLOW_UNPARATH_NEW may become false.
        const itemFlags = (flags & F_ALLOW_UNPARATH_NEW && !this.globalEnv.parentheses && length === 0) ? E_TFT : E_TFF;

        const result = join(
          'new',
          this.generateExpression(expr.callee, Precedence.New, itemFlags),
          this.globalEnv
        );

        if (!(flags & F_ALLOW_UNPARATH_NEW) || this.globalEnv.parentheses || length > 0) {
          result.push('(');
          for (i = 0, iz = length; i < iz; ++i) {
            result.push(this.generateExpression(expr['arguments'][i], Precedence.Assignment, E_TTT));
            if (i + 1 < iz) {
              result.push(',' + this.globalEnv.space);
            }
          }
          result.push(')');
        }

        return parenthesize(result, Precedence.New, precedence);
      },

      MemberExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        let fragment;

        // F_ALLOW_UNPARATH_NEW becomes false.
        const result = [this.generateExpression(expr.object, Precedence.Call, (flags & F_ALLOW_CALL) ? E_TTF : E_TFF)];

        if (expr.computed) {
          if (expr.optional) {
            result.push('?.');
          }

          result.push('[');
          result.push(this.generateExpression(expr.property, Precedence.Sequence, flags & F_ALLOW_CALL ? E_TTT : E_TFT));
          result.push(']');
        } else {
          if (!expr.optional && expr.object.type === this.Syntax.Literal && typeof expr.object.value === 'number') {
            fragment = toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString();
            // When the following conditions are all true,
            //   1. No floating point
            //   2. Don't have exponents
            //   3. The last character is a decimal digit
            //   4. Not hexadecimal OR octal number literal
            // we should add a floating point.
            if (
              fragment.indexOf('.') < 0 &&
              !/[eExX]/.test(fragment) &&
              esutils.code.isDecimalDigit(fragment.charCodeAt(fragment.length - 1)) &&
              !(fragment.length >= 2 && fragment.charCodeAt(0) === 48)  // '0'
            ) {
              result.push(' ');
            }
          }
          result.push(expr.optional ? '?.' : '.');
          result.push(this.generateIdentifier(expr.property));
        }

        return parenthesize(result, Precedence.Member, precedence);
      },

      MetaProperty: (expr: ESASTNode, precedence: number, flags: number) => {
        const result = [];
        result.push(typeof expr.meta === "string" ? expr.meta : this.generateIdentifier(expr.meta));
        result.push('.');
        result.push(typeof expr.property === "string" ? expr.property : this.generateIdentifier(expr.property));
        return parenthesize(result, Precedence.Member, precedence);
      },

      UnaryExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        let result, rightCharCode, leftSource, leftCharCode;
        const fragment = this.generateExpression(expr.argument, Precedence.Unary, E_TTT);

        if (this.globalEnv.space === '') {
          result = join(expr.operator, fragment, this.globalEnv);
        } else {
          result = [expr.operator];
          if (expr.operator.length > 2) {
            // delete, void, typeof
            // get `typeof []`, not `typeof[]`
            result = join(result, fragment, this.globalEnv);
          } else {
            // Prevent inserting spaces between operator and argument if it is unnecessary
            // like, `!cond`
            leftSource = toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString();
            leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
            rightCharCode = fragment.toString().charCodeAt(0);

            if (((leftCharCode === 0x2B  /* + */ || leftCharCode === 0x2D  /* - */) && leftCharCode === rightCharCode) ||
              (esutils.code.isIdentifierPartES5(leftCharCode) && esutils.code.isIdentifierPartES5(rightCharCode))) {
              result.push(noEmptySpace(this.globalEnv.space));
              result.push(fragment);
            } else {
              result.push(fragment);
            }
          }
        }
        return parenthesize(result, Precedence.Unary, precedence);
      },

      YieldExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        let result;
        if (expr.delegate) {
          result = 'yield*';
        } else {
          result = 'yield';
        }
        if (expr.argument) {
          result = join(
            result,
            this.generateExpression(expr.argument, Precedence.Yield, E_TTT),
            this.globalEnv
          );
        }
        return parenthesize(result, Precedence.Yield, precedence);
      },

      AwaitExpression:  (expr: ESASTNode, precedence: number, flags: number)  => {
        const result = join(
          expr.all ? 'await*' : 'await',
          this.generateExpression(expr.argument, Precedence.Await, E_TTT),
          this.globalEnv
        );
        return parenthesize(result, Precedence.Await, precedence);
      },

      UpdateExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        if (expr.prefix) {
          return parenthesize([
            expr.operator,
            this.generateExpression(expr.argument, Precedence.Unary, E_TTT)
          ],
            Precedence.Unary,
            precedence
          );
        }
        return parenthesize([
          this.generateExpression(expr.argument, Precedence.Postfix, E_TTT),
          expr.operator
        ],
          Precedence.Postfix,
          precedence
        );
      },

      FunctionExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        const result: any[] = [
          this.generateAsyncPrefix(expr, true),
          'function'
        ];
        if (expr.id) {
          result.push(this.generateStarSuffix(expr) || noEmptySpace(this.globalEnv.space));
          result.push(this.generateIdentifier(expr.id));
        } else {
          result.push(this.generateStarSuffix(expr) || this.globalEnv.space);
        }
        result.push(this.generateFunctionBody(expr));
        return result;
      },

      ArrayPattern: (expr: ESASTNode, precedence: number, flags: number) => {
        return this.Expression.ArrayExpression(expr, precedence, flags, true);
      },

      ArrayExpression: (expr: ESASTNode, precedence: number, flags: number, isPattern: boolean) => {
        if (!expr.elements.length) {
          return '[]';
        }
        const multiline = isPattern ? false : expr.elements.length > 1;
        const result = ['[', multiline ? this.globalEnv.newline : ''];
        this.withIndent((indent: any) => {
          let i, iz;
          for (i = 0, iz = expr.elements.length; i < iz; ++i) {
            if (!expr.elements[i]) {
              if (multiline) {
                result.push(indent);
              }
              if (i + 1 === iz) {
                result.push(',');
              }
            } else {
              result.push(multiline ? indent : '');
              result.push(this.generateExpression(expr.elements[i], Precedence.Assignment, E_TTT));
            }
            if (i + 1 < iz) {
              result.push(',' + (multiline ? this.globalEnv.newline : this.globalEnv.space));
            }
          }
        });
        if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
          result.push(this.globalEnv.newline);
        }

        result.push(multiline ? this.globalEnv.base : '');
        result.push(']');
        return result;
      },

      RestElement: (expr: ESASTNode, precedence: number, flags: number) => {
        return '...' + this.generatePattern(expr.argument, precedence, flags);
      },

      ClassExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        let result, fragment;
        result = ['class'];
        if (expr.id) {
          result = join(result, this.generateExpression(expr.id, Precedence.Sequence, E_TTT), this.globalEnv);
        }
        if (expr.superClass) {
          fragment = join('extends', this.generateExpression(expr.superClass, Precedence.Unary, E_TTT), this.globalEnv);
          result = join(result, fragment, this.globalEnv);
        }
        result.push(this.globalEnv.space);
        result.push(this.generateStatement(expr.body, S_TFFT));
        return result;
      },

      MethodDefinition: (expr: ESASTNode, precedence: number, flags: number) => {
        let result: any[], fragment;
        if (expr['static']) {
          result = ['static' + this.globalEnv.space];
        } else {
          result = [];
        }
        if (expr.kind === 'get' || expr.kind === 'set') {
          fragment = [
            join(expr.kind, this.generatePropertyKey(expr.key, expr.computed), this.globalEnv),
            this.generateFunctionBody(expr.value)
          ];
        } else {
          fragment = [
            this.generateMethodPrefix(expr),
            this.generatePropertyKey(expr.key, expr.computed),
            this.generateFunctionBody(expr.value)
          ];
        }
        return join(result, fragment, this.globalEnv);
      },

      Property:  (expr: any, precedence: number, flags: number) => {
        if (expr.kind === 'get' || expr.kind === 'set') {
          return [
            expr.kind, noEmptySpace(this.globalEnv.space),
            this.generatePropertyKey(expr.key, expr.computed),
            this.generateFunctionBody(expr.value)
          ];
        }

        if (expr.shorthand) {
          if (expr.value.type === "AssignmentPattern") {
            return this.AssignmentPattern(expr.value, Precedence.Sequence, E_TTT);
          }
          return this.generatePropertyKey(expr.key, expr.computed);
        }

        if (expr.method) {
          return [
            this.generateMethodPrefix(expr),
            this.generatePropertyKey(expr.key, expr.computed),
            this.generateFunctionBody(expr.value)
          ];
        }

        return [
          this.generatePropertyKey(expr.key, expr.computed),
          ':' + this.globalEnv.space,
          this.generateExpression(expr.value, Precedence.Assignment, E_TTT)
        ];
      },

      ObjectExpression:  (expr: ESASTNode, precedence: number, flags: number) => {
        let result: any, fragment: any = null;

        if (!expr.properties.length) {
          return '{}';
        }
        const multiline = expr.properties.length > 1;

        this.withIndent(() => {
          fragment = this.generateExpression(expr.properties[0], Precedence.Sequence, E_TTT);
        });

        if (!multiline) {
          // issues 4
          // Do not transform from
          //   dejavu.Class.declare({
          //       method2: function () {}
          //   });
          // to
          //   dejavu.Class.declare({method2: function () {
          //       }});
          if (!hasLineTerminator(toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
            return ['{', this.globalEnv.space, fragment, this.globalEnv.space, '}'];
          }
        }

        this.withIndent((indent: Indent) => {
          let i, iz;
          result = ['{', this.globalEnv.newline, indent, fragment];

          if (multiline) {
            result.push(',' + this.globalEnv.newline);
            for (i = 1, iz = expr.properties.length; i < iz; ++i) {
              result.push(indent);
              result.push(this.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
              if (i + 1 < iz) {
                result.push(',' + this.globalEnv.newline);
              }
            }
          }
        });

        if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
          result.push(this.globalEnv.newline);
        }
        result.push(this.globalEnv.base);
        result.push('}');
        return result;
      },

      AssignmentPattern: (expr: ESASTNode, precedence: number, flags: number) => {
        return this.generateAssignment(expr.left, expr.right, '=', precedence, flags);
      },

      ObjectPattern:  (expr: ESASTNode, precedence: number, flags: number) => {
        let i, iz, property;
        if (!expr.properties.length) {
          return '{}';
        }

        let multiline = false;
        if (expr.properties.length === 1) {
          property = expr.properties[0];
          if (
            property.type === this.Syntax.Property
            && property.value.type !== this.Syntax.Identifier
          ) {
            multiline = true;
          }
        } else {
          for (i = 0, iz = expr.properties.length; i < iz; ++i) {
            property = expr.properties[i];
            if (
              property.type === this.Syntax.Property
              && !property.shorthand
            ) {
              multiline = true;
              break;
            }
          }
        }
        const result = ['{', multiline ? this.globalEnv.newline : ''];

        this.withIndent((indent: any) => {
          let i, iz;
          for (i = 0, iz = expr.properties.length; i < iz; ++i) {
            result.push(multiline ? indent : '');
            result.push(this.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
            if (i + 1 < iz) {
              result.push(',' + (multiline ? this.globalEnv.newline : this.globalEnv.space));
            }
          }
        });

        if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
          result.push(this.globalEnv.newline);
        }
        result.push(multiline ? this.globalEnv.base : '');
        result.push('}');
        return result;
      },

      ThisExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        return 'this';
      },

      Super:  (expr: ESASTNode, precedence: number, flags: number) => {
        return 'super';
      },

      Identifier: (expr: ESASTNode, precedence: number, flags: number) => {
        return this.generateIdentifier(expr);
      },

      ImportDefaultSpecifier: (expr: ESASTNode, precedence: number, flags: number) => {
        return this.generateIdentifier(expr.id || expr.local);
      },

      ImportNamespaceSpecifier: (expr: ESASTNode, precedence: number, flags: number) => {
        const result = ['*'];
        const id = expr.id || expr.local;
        if (id) {
          result.push(this.globalEnv.space + 'as' + noEmptySpace(this.globalEnv.space) + this.generateIdentifier(id));
        }
        return result;
      },

      ImportSpecifier: (expr: ESASTNode, precedence: number, flags: number) => {
        const imported = expr.imported;
        const result = [imported.name];
        const local = expr.local;
        if (local && local.name !== imported.name) {
          result.push(noEmptySpace(this.globalEnv.space) + 'as' + noEmptySpace(this.globalEnv.space) + this.generateIdentifier(local));
        }
        return result;
      },

      ExportSpecifier: (expr: ESASTNode, precedence: number, flags: number) => {
        const local = expr.local;
        const result = [local.name];
        const exported = expr.exported;
        if (exported && exported.name !== local.name) {
          result.push(noEmptySpace(this.globalEnv.space) + 'as' + noEmptySpace(this.globalEnv.space) + this.generateIdentifier(exported));
        }
        return result;
      },

      Literal: (expr: ESASTNode, precedence: number, flags: number) => {
        let raw;
        if (Object.prototype.hasOwnProperty.call(expr, 'raw') && this.globalEnv.parse && this.extra.raw) {
          try {
            raw = this.globalEnv.parse(expr.raw).body[0].expression;
            if (raw.type === this.Syntax.Literal) {
              if (raw.value === expr.value) {
                return expr.raw;
              }
            }
          } catch (e) {
            // not use raw property
          }
        }

        if (expr.regex) {
          return '/' + expr.regex.pattern + '/' + expr.regex.flags;
        }

        if (expr.value === null) {
          return 'null';
        }

        if (typeof expr.value === 'string') {
          return escapeString(expr.value, this.globalEnv);
        }

        if (typeof expr.value === 'number') {
          return this.generateNumber(expr.value);
        }

        if (typeof expr.value === 'boolean') {
          return expr.value ? 'true' : 'false';
        }

        return this.generateRegExp(expr.value);
      },

      GeneratorExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        return this.ComprehensionExpression(expr, precedence, flags);
      },

      ComprehensionExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        // GeneratorExpression should be parenthesized with (...), ComprehensionExpression with [...]
        // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=883468 position of expr.body can differ in Spidermonkey and ES6

        let result: any[], i, iz, fragment;
        result = (expr.type === this.Syntax.GeneratorExpression) ? ['('] : ['['];

        if (this.extra.moz.comprehensionExpressionStartsWithAssignment) {
          fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);
          result.push(fragment);
        }

        if (expr.blocks) {
          this.withIndent(() => {
            for (i = 0, iz = expr.blocks.length; i < iz; ++i) {
              fragment = this.generateExpression(expr.blocks[i], Precedence.Sequence, E_TTT);
              if (i > 0 || this.extra.moz.comprehensionExpressionStartsWithAssignment) {
                result = join(result, fragment, this.globalEnv);
              } else {
                result.push(fragment);
              }
            }
          });
        }

        if (expr.filter) {
          result = join(result, 'if' + this.globalEnv.space, this.globalEnv);
          fragment = this.generateExpression(expr.filter, Precedence.Sequence, E_TTT);
          result = join(result, ['(', fragment, ')'], this.globalEnv);
        }

        if (!this.extra.moz.comprehensionExpressionStartsWithAssignment) {
          fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);

          result = join(result, fragment, this.globalEnv);
        }

        result.push((expr.type === this.Syntax.GeneratorExpression) ? ')' : ']');
        return result;
      },

      ComprehensionBlock: (expr: ESASTNode, precedence: number, flags: number) => {
        let fragment;
        if (expr.left.type === this.Syntax.VariableDeclaration) {
          fragment = [
            expr.left.kind, noEmptySpace(this.globalEnv.space),
            this.generateStatement(expr.left.declarations[0], S_FFFF)
          ];
        } else {
          fragment = this.generateExpression(expr.left, Precedence.Call, E_TTT);
        }

        fragment = join(fragment, expr.of ? 'of' : 'in', this.globalEnv);
        fragment = join(fragment, this.generateExpression(expr.right, Precedence.Sequence, E_TTT), this.globalEnv);

        return ['for' + this.globalEnv.space + '(', fragment, ')'];
      },

      SpreadElement: (expr: ESASTNode, precedence: number, flags: number) => {
        return [
          '...',
          this.generateExpression(expr.argument, Precedence.Assignment, E_TTT)
        ];
      },

      TaggedTemplateExpression: (expr: ESASTNode, precedence: number, flags: number) => {
        let itemFlags = E_TTF;
        if (!(flags & F_ALLOW_CALL)) {
          itemFlags = E_TFF;
        }
        const result = [
          this.generateExpression(expr.tag, Precedence.Call, itemFlags),
          this.generateExpression(expr.quasi, Precedence.Primary, E_FFT)
        ];
        return parenthesize(result, Precedence.TaggedTemplate, precedence);
      },

      TemplateElement: (expr: ESASTNode, precedence: number, flags: number) => {
        // Don't use "cooked". Since tagged template can use raw template
        // representation. So if we do so, it breaks the script semantics.
        return expr.value.raw;
      },

      TemplateLiteral: (expr: ESASTNode, precedence: number, flags: number) => {
        let i, iz;
        const result = ['`'];
        for (i = 0, iz = expr.quasis.length; i < iz; ++i) {
          result.push(this.generateExpression(expr.quasis[i], Precedence.Primary, E_TTT));
          if (i + 1 < iz) {
            result.push('${' + this.globalEnv.space);
            result.push(this.generateExpression(expr.expressions[i], Precedence.Sequence, E_TTT));
            result.push(this.globalEnv.space + '}');
          }
        }
        result.push('`');
        return result;
      },

      ModuleSpecifier: (expr: ESASTNode, precedence: number, flags: number) => {
        return this.Literal(expr, precedence, flags);
      },

      ImportExpression: (expr: ESASTNode, precedence: number) => {
        return parenthesize([
          'import(',
          this.generateExpression(expr.source, Precedence.Assignment, E_TTT),
          ')'
        ], Precedence.Call, precedence);
      },
  }

  Statement: {
    [key: string]: any;
  } = {
    BlockStatement: (stmt: ESASTNode, flags: number) => {
      let range, content, result = ['{', this.globalEnv.newline];

      this.withIndent(() => {
        // handle functions without any code
        if (stmt.body.length === 0 && this.globalEnv.preserveBlankLines) {
          range = stmt.range;
          if (range[1] - range[0] > 2) {
            content = this.globalEnv.sourceCode.substring(range[0] + 1, range[1] - 1);
            if (content[0] === '\n') {
              result = ['{'];
            }
            result.push(content);
          }
        }

        let i, iz, fragment, bodyFlags;
        bodyFlags = S_TFFF;
        if (flags & F_FUNC_BODY) {
          bodyFlags |= F_DIRECTIVE_CTX;
        }

        for (i = 0, iz = stmt.body.length; i < iz; ++i) {
          if (this.globalEnv.preserveBlankLines) {
            // handle spaces before the first line
            if (i === 0) {
              if (stmt.body[0].leadingComments) {
                range = stmt.body[0].leadingComments[0].extendedRange;
                content = this.globalEnv.sourceCode.substring(range[0], range[1]);
                if (content[0] === '\n') {
                  result = ['{'];
                }
              }
              if (!stmt.body[0].leadingComments) {
                this.generateBlankLines(stmt.range[0], stmt.body[0].range[0], result);
              }
            }

            // handle spaces between lines
            if (i > 0) {
              if (!stmt.body[i - 1].trailingComments && !stmt.body[i].leadingComments) {
                this.generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
              }
            }
          }

          if (i === iz - 1) {
            bodyFlags |= F_SEMICOLON_OPT;
          }

          if (stmt.body[i].leadingComments && this.globalEnv.preserveBlankLines) {
            fragment = this.generateStatement(stmt.body[i], bodyFlags);
          } else {
            fragment = addIndent(this.generateStatement(stmt.body[i], bodyFlags), this.globalEnv);
          }

          result.push(fragment);
          if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
            if (this.globalEnv.preserveBlankLines && i < iz - 1) {
              // don't add a new line if there are leading coments
              // in the next statement
              if (!stmt.body[i + 1].leadingComments) {
                result.push(this.globalEnv.newline);
              }
            } else {
              result.push(this.globalEnv.newline);
            }
          }

          if (this.globalEnv.preserveBlankLines) {
            // handle spaces after the last line
            if (i === iz - 1) {
              if (!stmt.body[i].trailingComments) {
                this.generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
              }
            }
          }
        }
      });

      result.push(addIndent('}', this.globalEnv) as any); // 
      return result;
    },

    BreakStatement: (stmt: ESASTNode, flags: number) => {
      if (stmt.label) {
        return 'break ' + stmt.label.name + this.semicolon(flags);
      }
      return 'break' + this.semicolon(flags);
    },

    ContinueStatement: (stmt: ESASTNode, flags: number) => {
      if (stmt.label) {
        return 'continue ' + stmt.label.name + this.semicolon(flags);
      }
      return 'continue' + this.semicolon(flags);
    },

    ClassBody: (stmt: ESASTNode, flags: number) => {
      const result = ['{', this.globalEnv.newline];

      this.withIndent((indent: any) => {
        let i, iz;

        for (i = 0, iz = stmt.body.length; i < iz; ++i) {
          result.push(indent);
          result.push(this.generateExpression(stmt.body[i], Precedence.Sequence, E_TTT));
          if (i + 1 < iz) {
            result.push(this.globalEnv.newline);
          }
        }
      });

      if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
        result.push(this.globalEnv.newline);
      }
      result.push(this.globalEnv.base);
      result.push('}');
      return result;
    },

    ClassDeclaration: (stmt: ESASTNode, flags: number) => {
      let result, fragment;
      result = ['class'];
      if (stmt.id) {
        result = join(result, this.generateExpression(stmt.id, Precedence.Sequence, E_TTT), this.globalEnv);
      }
      if (stmt.superClass) {
        fragment = join('extends', this.generateExpression(stmt.superClass, Precedence.Unary, E_TTT), this.globalEnv);
        result = join(result, fragment, this.globalEnv);
      }
      result.push(this.globalEnv.space);
      result.push(this.generateStatement(stmt.body, S_TFFT));
      return result;
    },

    DirectiveStatement: (stmt: ESASTNode, flags: number) => {
      if (this.extra.raw && stmt.raw) {
        return stmt.raw + this.semicolon(flags);
      }
      return this.escapeDirective(stmt.directive) + this.semicolon(flags);
    },

    DoWhileStatement: (stmt: ESASTNode, flags: number) => {
      // Because `do 42 while (cond)` is this.Syntax Error. We need semicolon.
      let result = join('do', this.maybeBlock(stmt.body, S_TFFF), this.globalEnv);
      result = this.maybeBlockSuffix(stmt.body, result);
      return join(result, [
        'while' + this.globalEnv.space + '(',
        this.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
        ')' + this.semicolon(flags)
      ], this.globalEnv);
    },

    CatchClause: (stmt: ESASTNode, flags: number) => {
      let result = [];
      this.withIndent(() => {
        let guard;

        if (stmt.param) {
          result = [
            'catch' + this.globalEnv.space + '(',
            this.generateExpression(stmt.param, Precedence.Sequence, E_TTT),
            ')'
          ];

          if (stmt.guard) {
            guard = this.generateExpression(stmt.guard, Precedence.Sequence, E_TTT);
            result.splice(2, 0, ' if ', guard);
          }
        } else {
          result = ['catch'];
        }
      });
      result.push(this.maybeBlock(stmt.body, S_TFFF));
      return result;
    },

    DebuggerStatement: (stmt: ESASTNode, flags: number) => {
      return 'debugger' + this.semicolon(flags);
    },

    EmptyStatement: (stmt: ESASTNode, flags: number) => {
      return ';';
    },

    ExportDefaultDeclaration: (stmt: ESASTNode, flags: number) => {
      let result = ['export'];
      const bodyFlags = (flags & F_SEMICOLON_OPT) ? S_TFFT : S_TFFF;

      // export default HoistableDeclaration[Default]
      // export default AssignmentExpression[In] ;
      result = join(result, 'default', this.globalEnv);
      if (this.isStatement(stmt.declaration)) {
        result = join(result, this.generateStatement(stmt.declaration, bodyFlags), this.globalEnv);
      } else {
        result = join(result, this.generateExpression(stmt.declaration, Precedence.Assignment, E_TTT) + this.semicolon(flags), this.globalEnv);
      }
      return result;
    },

    ExportNamedDeclaration: (stmt: ESASTNode, flags: number) => {
      let result = ['export'];

      const bodyFlags = (flags & F_SEMICOLON_OPT) ? S_TFFT : S_TFFF;

      // export VariableStatement
      // export Declaration[Default]
      if (stmt.declaration) {
        return join(result, this.generateStatement(stmt.declaration, bodyFlags), this.globalEnv);
      }

      // export ExportClause[NoReference] FromClause ;
      // export ExportClause ;
      if (stmt.specifiers) {
        if (stmt.specifiers.length === 0) {
          result = join(result, '{' + this.globalEnv.space + '}', this.globalEnv);
        } else if (stmt.specifiers[0].type === this.Syntax.ExportBatchSpecifier) {
          result = join(result, this.generateExpression(stmt.specifiers[0], Precedence.Sequence, E_TTT), this.globalEnv);
        } else {
          result = join(result, '{', this.globalEnv);
          this.withIndent((indent: any) => {
            let i, iz;
            result.push(this.globalEnv.newline);
            for (i = 0, iz = stmt.specifiers.length; i < iz; ++i) {
              result.push(indent);
              result.push(this.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
              if (i + 1 < iz) {
                result.push(',' + this.globalEnv.newline);
              }
            }
          });
          if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
            result.push(this.globalEnv.newline);
          }
          result.push(this.globalEnv.base + '}');
        }

        if (stmt.source) {
          result = join(result, [
            'from' + this.globalEnv.space,
            // ModuleSpecifier
            this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
            this.semicolon(flags)
          ], this.globalEnv);
        } else {
          result.push(this.semicolon(flags));
        }
      }
      return result;
    },

    ExportAllDeclaration: (stmt: ESASTNode, flags: number) => {
      // export * FromClause ;
      return [
        'export' + this.globalEnv.space,
        '*' + this.globalEnv.space,
        'from' + this.globalEnv.space,
        // ModuleSpecifier
        this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
        this.semicolon(flags)
      ];
    },

    ExpressionStatement: (stmt: ESASTNode, flags: number) => {
      let result;

      function isClassPrefixed(fragment: string) {
        if (fragment.slice(0, 5) !== 'class') {
          return false;
        }
        const code = fragment.charCodeAt(5);
        return code === 0x7B  /* '{' */ || esutils.code.isWhiteSpace(code) || esutils.code.isLineTerminator(code);
      }

      function isFunctionPrefixed(fragment: string) {
        if (fragment.slice(0, 8) !== 'function') {
          return false;
        }
        const code = fragment.charCodeAt(8);
        return code === 0x28 /* '(' */ || esutils.code.isWhiteSpace(code) || code === 0x2A  /* '*' */ || esutils.code.isLineTerminator(code);
      }

      function isAsyncPrefixed(fragment: string) {
        let i, iz;
        if (fragment.slice(0, 5) !== 'async') {
          return false;
        }
        if (!esutils.code.isWhiteSpace(fragment.charCodeAt(5))) {
          return false;
        }
        for (i = 6, iz = fragment.length; i < iz; ++i) {
          if (!esutils.code.isWhiteSpace(fragment.charCodeAt(i))) {
            break;
          }
        }
        if (i === iz) {
          return false;
        }
        if (fragment.slice(i, i + 8) !== 'function') {
          return false;
        }
        const code = fragment.charCodeAt(i + 8);
        return code === 0x28 /* '(' */ || esutils.code.isWhiteSpace(code) || code === 0x2A  /* '*' */ || esutils.code.isLineTerminator(code);
      }

      result = [this.generateExpression(stmt.expression, Precedence.Sequence, E_TTT)];
      // 12.4 '{', 'function', 'class' is not allowed in this position.
      // wrap expression with parentheses
      const fragment = toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString();
      if (fragment.charCodeAt(0) === 0x7B  /* '{' */ ||  // ObjectExpression
        isClassPrefixed(fragment) ||
        isFunctionPrefixed(fragment) ||
        isAsyncPrefixed(fragment) ||
        (this.globalEnv.directive && (flags & F_DIRECTIVE_CTX) && stmt.expression.type === this.Syntax.Literal && typeof stmt.expression.value === 'string')) {
        result = ['(', result, ')' + this.semicolon(flags)];
      } else {
        result.push(this.semicolon(flags));
      }
      return result;
    },

    ImportDeclaration: (stmt: ESASTNode, flags: number) => {
      // ES6: 15.2.1 valid import declarations:
      //     - import ImportClause FromClause ;
      //     - import ModuleSpecifier ;
      let result;

      // If no ImportClause is present,
      // this should be `import ModuleSpecifier` so skip `from`
      // ModuleSpecifier is StringLiteral.
      if (stmt.specifiers.length === 0) {
        // import ModuleSpecifier ;
        return [
          'import',
          this.globalEnv.space,
          // ModuleSpecifier
          this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
          this.semicolon(flags)
        ];
      }

      // import ImportClause FromClause ;
      result = [
        'import'
      ];
      let cursor = 0;

      // ImportedBinding
      if (stmt.specifiers[cursor].type === this.Syntax.ImportDefaultSpecifier) {
        result = join(result, [
          this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)
        ], this.globalEnv);
        ++cursor;
      }

      if (stmt.specifiers[cursor]) {
        if (cursor !== 0) {
          result.push(',');
        }

        if (stmt.specifiers[cursor].type === this.Syntax.ImportNamespaceSpecifier) {
          // NameSpaceImport
          result = join(result, [
            this.globalEnv.space,
            this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)
          ], this.globalEnv);
        } else {
          // NamedImports
          result.push(this.globalEnv.space + '{');

          if ((stmt.specifiers.length - cursor) === 1) {
            // import { ... } from "...";
            result.push(this.globalEnv.space);
            result.push(this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT));
            result.push(this.globalEnv.space + '}' + this.globalEnv.space);
          } else {
            // import {
            //    ...,
            //    ...,
            // } from "...";
            this.withIndent((indent: Indent) => {
              let i, iz;
              result.push(this.globalEnv.newline);
              for (i = cursor, iz = stmt.specifiers.length; i < iz; ++i) {
                result.push(indent);
                result.push(this.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
                if (i + 1 < iz) {
                  result.push(',' + this.globalEnv.newline);
                }
              }
            });
            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
              result.push(this.globalEnv.newline);
            }
            result.push(this.globalEnv.base + '}' + this.globalEnv.space);
          }
        }
      }

      result = join(result, [
        'from' + this.globalEnv.space,
        // ModuleSpecifier
        this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
        this.semicolon(flags)
      ], this.globalEnv);
      return result;
    },

    VariableDeclarator: (stmt: ESASTNode, flags: number) => {
      const itemFlags = (flags & F_ALLOW_IN) ? E_TTT : E_FTT;
      if (stmt.init) {
        return [
          this.generateExpression(stmt.id, Precedence.Assignment, itemFlags),
          this.globalEnv.space,
          '=',
          this.globalEnv.space,
          this.generateExpression(stmt.init, Precedence.Assignment, itemFlags)
        ];
      }
      return this.generatePattern(stmt.id, Precedence.Assignment, itemFlags);
    },

    VariableDeclaration: (stmt: ESASTNode, flags: number) => {
      // VariableDeclarator is typed as Statement,
      // but joined with comma (not LineTerminator).
      // So if comment is attached to target node, we should specialize.
      let i, iz, node;

      const result = [stmt.kind];

      const bodyFlags = (flags & F_ALLOW_IN) ? S_TFFF : S_FFFF;
      const block = () => {
        node = stmt.declarations[0];
        if (this.extra.comment && node.leadingComments) {
          result.push('\n');
          result.push(addIndent(this.generateStatement(node, bodyFlags), this.globalEnv));
        } else {
          result.push(noEmptySpace(this.globalEnv.space));
          result.push(this.generateStatement(node, bodyFlags));
        }

        for (i = 1, iz = stmt.declarations.length; i < iz; ++i) {
          node = stmt.declarations[i];
          if (this.extra.comment && node.leadingComments) {
            result.push(',' + this.globalEnv.newline);
            result.push(addIndent(this.generateStatement(node, bodyFlags), this.globalEnv));
          } else {
            result.push(',' + this.globalEnv.space);
            result.push(this.generateStatement(node, bodyFlags));
          }
        }
      }

      if (stmt.declarations.length > 1) {
        this.withIndent(block);
      } else {
        block();
      }

      result.push(this.semicolon(flags));

      return result;
    },

    ThrowStatement: (stmt: ESASTNode, flags: number) => {
      return [join(
        'throw',
        this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT),
        this.globalEnv
      ), this.semicolon(flags)];
    },

    TryStatement: (stmt: ESASTNode, flags: number) => {
      let result, i, iz, guardedHandlers;

      result = ['try', this.maybeBlock(stmt.block, S_TFFF)];
      result = this.maybeBlockSuffix(stmt.block, result);

      if (stmt.handlers) {
        // old interface
        for (i = 0, iz = stmt.handlers.length; i < iz; ++i) {
          result = join(result, this.generateStatement(stmt.handlers[i], S_TFFF), this.globalEnv);
          if (stmt.finalizer || i + 1 !== iz) {
            result = this.maybeBlockSuffix(stmt.handlers[i].body, result);
          }
        }
      } else {
        guardedHandlers = stmt.guardedHandlers || [];

        for (i = 0, iz = guardedHandlers.length; i < iz; ++i) {
          result = join(result, this.generateStatement(guardedHandlers[i], S_TFFF), this.globalEnv);
          if (stmt.finalizer || i + 1 !== iz) {
            result = this.maybeBlockSuffix(guardedHandlers[i].body, result);
          }
        }

        // new interface
        if (stmt.handler) {
          if (Array.isArray(stmt.handler)) {
            for (i = 0, iz = stmt.handler.length; i < iz; ++i) {
              result = join(result, this.generateStatement(stmt.handler[i], S_TFFF), this.globalEnv);
              if (stmt.finalizer || i + 1 !== iz) {
                result = this.maybeBlockSuffix(stmt.handler[i].body, result);
              }
            }
          } else {
            result = join(result, this.generateStatement(stmt.handler, S_TFFF), this.globalEnv);
            if (stmt.finalizer) {
              result = this.maybeBlockSuffix(stmt.handler.body, result);
            }
          }
        }
      }
      if (stmt.finalizer) {
        result = join(result, ['finally', this.maybeBlock(stmt.finalizer, S_TFFF)], this.globalEnv);
      }
      return result;
    },

    SwitchStatement: (stmt: ESASTNode, flags: number) => {
      let result: any[] = [], fragment, i, iz;
    
      this.withIndent(() => {
        result = [
          'switch' + this.globalEnv.space + '(',
          this.generateExpression(stmt.discriminant, Precedence.Sequence, E_TTT),
          ')' + this.globalEnv.space + '{' + this.globalEnv.newline
        ];
      });

      if (stmt.cases) {
        let bodyFlags = S_TFFF;
        for (i = 0, iz = stmt.cases.length; i < iz; ++i) {
          if (i === iz - 1) {
            bodyFlags |= F_SEMICOLON_OPT;
          }
          fragment = addIndent(this.generateStatement(stmt.cases[i], bodyFlags), this.globalEnv);
          result.push(fragment);
          if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
            result.push(this.globalEnv.newline);
          }
        }
      }
      result.push(addIndent('}', this.globalEnv));
      return result;
    },

    SwitchCase: (stmt: ESASTNode, flags: number) => {
      let result: any[] = [], fragment, i, iz;
      this.withIndent(() => {
        if (stmt.test) {
          result = [
            join('case', this.generateExpression(stmt.test, Precedence.Sequence, E_TTT), this.globalEnv),
            ':'
          ];
        } else {
          result = ['default:'];
        }

        i = 0;
        iz = stmt.consequent.length;
        if (iz && stmt.consequent[0].type === this.Syntax.BlockStatement) {
          fragment = this.maybeBlock(stmt.consequent[0], S_TFFF);
          result.push(fragment);
          i = 1;
        }

        if (i !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
          result.push(this.globalEnv.newline);
        }

        let bodyFlags = S_TFFF;
        for (; i < iz; ++i) {
          if (i === iz - 1 && flags & F_SEMICOLON_OPT) {
            bodyFlags |= F_SEMICOLON_OPT;
          }
          fragment = addIndent(this.generateStatement(stmt.consequent[i], bodyFlags), this.globalEnv);
          result.push(fragment);
          if (i + 1 !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
            result.push(this.globalEnv.newline);
          }
        }
      });
      return result;
    },

    IfStatement: (stmt: ESASTNode, flags: number) => {
      let result: any[] = [];
      this.withIndent(() => {
        result = [
          'if' + this.globalEnv.space + '(',
          this.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
          ')'
        ];
      });
      const semicolonOptional = flags & F_SEMICOLON_OPT;
      let bodyFlags = S_TFFF;
      if (semicolonOptional) {
        bodyFlags |= F_SEMICOLON_OPT;
      }
      if (stmt.alternate) {
        result.push(this.maybeBlock(stmt.consequent, S_TFFF));
        result = this.maybeBlockSuffix(stmt.consequent, result);
        if (stmt.alternate.type === this.Syntax.IfStatement) {
          result = join(result, ['else ', this.generateStatement(stmt.alternate, bodyFlags)], this.globalEnv);
        } else {
          result = join(result, join('else', this.maybeBlock(stmt.alternate, bodyFlags), this.globalEnv), this.globalEnv);
        }
      } else {
        result.push(this.maybeBlock(stmt.consequent, bodyFlags));
      }
      return result;
    },

    ForStatement: (stmt: ESASTNode, flags: number) => {
      let result = [];
      this.withIndent(() => {
        result = ['for' + this.globalEnv.space + '('];
        if (stmt.init) {
          if (stmt.init.type === this.Syntax.VariableDeclaration) {
            result.push(this.generateStatement(stmt.init, S_FFFF));
          } else {
            // F_ALLOW_IN becomes false.
            result.push(this.generateExpression(stmt.init, Precedence.Sequence, E_FTT));
            result.push(';');
          }
        } else {
          result.push(';');
        }

        if (stmt.test) {
          result.push(this.globalEnv.space);
          result.push(this.generateExpression(stmt.test, Precedence.Sequence, E_TTT));
          result.push(';');
        } else {
          result.push(';');
        }

        if (stmt.update) {
          result.push(this.globalEnv.space);
          result.push(this.generateExpression(stmt.update, Precedence.Sequence, E_TTT));
          result.push(')');
        } else {
          result.push(')');
        }
      });

      result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
      return result;
    },

    ForInStatement: (stmt: ESASTNode, flags: number) => {
      return this.generateIterationForStatement('in', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
    },

    ForOfStatement: (stmt: ESASTNode, flags: number) => {
      return this.generateIterationForStatement('of', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
    },

    LabeledStatement: (stmt: ESASTNode, flags: number) => {
      return [stmt.label.name + ':', this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF)];
    },

    Program: (stmt: ESASTNode, flags: number) => {
      let i;
      const iz = stmt.body.length;
      const result = [this.globalEnv.safeConcatenation && iz > 0 ? '\n' : ''];
      let bodyFlags = S_TFTF;
      for (i = 0; i < iz; ++i) {
        if (!this.globalEnv.safeConcatenation && i === iz - 1) {
          bodyFlags |= F_SEMICOLON_OPT;
        }

        if (this.globalEnv.preserveBlankLines) {
          // handle spaces before the first line
          if (i === 0) {
            if (!stmt.body[0].leadingComments) {
              this.generateBlankLines(stmt.range[0], stmt.body[i].range[0], result);
            }
          }

          // handle spaces between lines
          if (i > 0) {
            if (!stmt.body[i - 1].trailingComments && !stmt.body[i].leadingComments) {
              this.generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
            }
          }
        }

        const fragment: any = addIndent(this.generateStatement(stmt.body[i], bodyFlags), this.globalEnv);
        result.push(fragment);
        if (i + 1 < iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
          if (this.globalEnv.preserveBlankLines) {
            if (!stmt.body[i + 1].leadingComments) {
              result.push(this.globalEnv.newline);
            }
          } else {
            result.push(this.globalEnv.newline);
          }
        }

        if (this.globalEnv.preserveBlankLines) {
          // handle spaces after the last line
          if (i === iz - 1) {
            if (!stmt.body[i].trailingComments) {
              this.generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
            }
          }
        }
      }
      return result;
    },

    FunctionDeclaration: (stmt: ESASTNode, flags: number) => {
      return [
        this.generateAsyncPrefix(stmt, true),
        'function',
        this.generateStarSuffix(stmt) || noEmptySpace(this.globalEnv.space),
        stmt.id ? this.generateIdentifier(stmt.id) : '',
        this.generateFunctionBody(stmt)
      ];
    },

    ReturnStatement: (stmt: ESASTNode, flags: number) => {
      if (stmt.argument) {
        return [join(
          'return',
          this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT),
          this.globalEnv
        ), this.semicolon(flags)];
      }
      return ['return' + this.semicolon(flags)];
    },

    WhileStatement: (stmt: ESASTNode, flags: number) => {
      let result: any[] = [];
      this.withIndent(() => {
        result = [
          'while' + this.globalEnv.space + '(',
          this.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
          ')'
        ];
      });
      result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
      return result;
    },

    WithStatement: (stmt: ESASTNode, flags: number) => {
      let result: any[] = [];
      this.withIndent(() => {
        result = [
          'with' + this.globalEnv.space + '(',
          this.generateExpression(stmt.object, Precedence.Sequence, E_TTT),
          ')'
        ];
      });
      result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
      return result;
    }
  }
}
