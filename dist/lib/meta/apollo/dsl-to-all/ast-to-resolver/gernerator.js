"use strict";
// Helpers.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generator = void 0;
const tools_1 = require("./tools");
const const_1 = require("./const");
const estraverse = __importStar(require("estraverse"));
const esutils_1 = __importDefault(require("esutils"));
//Flags
const F_ALLOW_IN = 1, F_ALLOW_CALL = 1 << 1, F_ALLOW_UNPARATH_NEW = 1 << 2, F_FUNC_BODY = 1 << 3, F_DIRECTIVE_CTX = 1 << 4, F_SEMICOLON_OPT = 1 << 5;
//Statement flag sets
//NOTE: Flag order:
// F_ALLOW_IN
// F_FUNC_BODY
// F_DIRECTIVE_CTX
// F_SEMICOLON_OPT
const S_TFFF = F_ALLOW_IN, S_TFFT = F_ALLOW_IN | F_SEMICOLON_OPT, S_FFFF = 0x00, S_TFTF = F_ALLOW_IN | F_DIRECTIVE_CTX, S_TTFF = F_ALLOW_IN | F_FUNC_BODY;
//Expression flag sets
//NOTE: Flag order:
// F_ALLOW_IN
// F_ALLOW_CALL
// F_ALLOW_UNPARATH_NEW
const E_FTT = F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW, E_TTF = F_ALLOW_IN | F_ALLOW_CALL, E_TTT = F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW, E_TFF = F_ALLOW_IN, E_FFT = F_ALLOW_UNPARATH_NEW, E_TFT = F_ALLOW_IN | F_ALLOW_UNPARATH_NEW;
const BinaryPrecedence = {
    '||': const_1.Precedence.LogicalOR,
    '&&': const_1.Precedence.LogicalAND,
    '|': const_1.Precedence.BitwiseOR,
    '^': const_1.Precedence.BitwiseXOR,
    '&': const_1.Precedence.BitwiseAND,
    '==': const_1.Precedence.Equality,
    '!=': const_1.Precedence.Equality,
    '===': const_1.Precedence.Equality,
    '!==': const_1.Precedence.Equality,
    'is': const_1.Precedence.Equality,
    'isnt': const_1.Precedence.Equality,
    '<': const_1.Precedence.Relational,
    '>': const_1.Precedence.Relational,
    '<=': const_1.Precedence.Relational,
    '>=': const_1.Precedence.Relational,
    'in': const_1.Precedence.Relational,
    'instanceof': const_1.Precedence.Relational,
    '<<': const_1.Precedence.BitwiseSHIFT,
    '>>': const_1.Precedence.BitwiseSHIFT,
    '>>>': const_1.Precedence.BitwiseSHIFT,
    '+': const_1.Precedence.Additive,
    '-': const_1.Precedence.Additive,
    '*': const_1.Precedence.Multiplicative,
    '%': const_1.Precedence.Multiplicative,
    '/': const_1.Precedence.Multiplicative,
    '**': const_1.Precedence.Exponentiation
};
const FORMAT_MINIFY = {
    indent: {
        style: '',
        base: 0
    },
    renumber: true,
    hexadecimal: true,
    quotes: 'auto',
    escapeless: true,
    compact: true,
    parentheses: false,
    semicolons: false
};
//  FORMAT_DEFAULTS = getDefaultOptions().format;
class Generator {
    constructor(node, globalEnv, extra) {
        // Generation is done by generateExpression.
        this.isExpression = (node) => {
            return Object.prototype.hasOwnProperty.call(this.Expression, node.type);
        };
        // Generation is done by generateStatement.
        this.isStatement = (node) => {
            return Object.prototype.hasOwnProperty.call(this.Statement, node.type);
        };
        this.generateInternal = () => {
            if (this.isStatement(this.node)) {
                return this.generateStatement(this.node, S_TFFF);
            }
            if (this.isExpression(this.node)) {
                return this.generateExpression(this.node, const_1.Precedence.Sequence, E_TTT);
            }
            throw new Error('Unknown node type: ' + this.node.type);
        };
        this.generateIdentifier = (node) => {
            return tools_1.toSourceNodeWhenNeeded(node.name, node, this.globalEnv);
        };
        this.generateAsyncPrefix = (node, spaceRequired) => {
            return node.async ? 'async' + (spaceRequired ? tools_1.noEmptySpace(this.globalEnv.space) : this.globalEnv.space) : '';
        };
        this.generateStarSuffix = (node) => {
            const isGenerator = node.generator && !this.extra.moz.starlessGenerator;
            return isGenerator ? '*' + this.globalEnv.space : '';
        };
        this.generateMethodPrefix = (prop) => {
            const func = prop.value;
            let prefix = '';
            if (func.async) {
                prefix += this.generateAsyncPrefix(func, !prop.computed);
            }
            if (func.generator) {
                // avoid space before method name
                prefix += this.generateStarSuffix(func) ? '*' : '';
            }
            return prefix;
        };
        this.generatePattern = (node, precedence, flags) => {
            if (node.type === this.Syntax.Identifier) {
                return this.generateIdentifier(node);
            }
            return this.generateExpression(node, precedence, flags);
        };
        this.generateNumber = (value) => {
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
            if (!this.globalEnv.json && result.charCodeAt(0) === 0x30 /* 0 */ && point === 1) {
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
            while (temp.charCodeAt(temp.length + pos - 1) === 0x30 /* 0 */) {
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
        };
        this.generateRegExp = (reg) => {
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
                            if (ch === 93) { // ]
                                characterInBrack = false;
                            }
                        }
                        else {
                            if (ch === 47) { // /
                                result += '\\';
                            }
                            else if (ch === 91) { // [
                                characterInBrack = true;
                            }
                        }
                        result += tools_1.escapeRegExpCharacter(ch, previousIsBackslash);
                        previousIsBackslash = ch === 92; // \
                    }
                    else {
                        // if new RegExp("\\\n') is provided, create /\n/
                        result += tools_1.escapeRegExpCharacter(ch, previousIsBackslash);
                        // prevent like /\\[/]/
                        previousIsBackslash = false;
                    }
                }
                return '/' + result + '/' + flags;
            }
            return result;
        };
        this.generateFunctionParams = (node) => {
            let i, iz, hasDefault;
            let result = [];
            hasDefault = false;
            if (node.type === this.Syntax.ArrowFunctionExpression &&
                !node.rest && (!node.defaults || node.defaults.length === 0) &&
                node.params.length === 1 && node.params[0].type === this.Syntax.Identifier) {
                // arg => { } case
                result = [this.generateAsyncPrefix(node, true), this.generateIdentifier(node.params[0])];
            }
            else {
                result = node.type === this.Syntax.ArrowFunctionExpression ? [this.generateAsyncPrefix(node, false)] : [];
                result.push('(');
                if (node.defaults) {
                    hasDefault = true;
                }
                for (i = 0, iz = node.params.length; i < iz; ++i) {
                    if (hasDefault && node.defaults[i]) {
                        // Handle default values.
                        result.push(this.generateAssignment(node.params[i], node.defaults[i], '=', const_1.Precedence.Assignment, E_TTT));
                    }
                    else {
                        result.push(this.generatePattern(node.params[i], const_1.Precedence.Assignment, E_TTT));
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
        this.generateFunctionBody = (node) => {
            let expr;
            const result = this.generateFunctionParams(node);
            if (node.type === this.Syntax.ArrowFunctionExpression) {
                result.push(this.globalEnv.space);
                result.push('=>');
            }
            if (node.expression) {
                result.push(this.globalEnv.space);
                expr = this.generateExpression(node.body, const_1.Precedence.Assignment, E_TTT);
                if (expr.toString().charAt(0) === '{') {
                    expr = ['(', expr, ')'];
                }
                result.push(expr);
            }
            else {
                result.push(this.maybeBlock(node.body, S_TTFF));
            }
            return result;
        };
        this.generateIterationForStatement = (operator, stmt, flags) => {
            let result = ['for' + (stmt.await ? tools_1.noEmptySpace(this.globalEnv.space) + 'await' : '') + this.globalEnv.space + '('];
            this.withIndent(() => {
                if (stmt.left.type === this.Syntax.VariableDeclaration) {
                    this.withIndent(() => {
                        result.push(stmt.left.kind + tools_1.noEmptySpace(this.globalEnv.space));
                        result.push(this.generateStatement(stmt.left.declarations[0], S_FFFF));
                    });
                }
                else {
                    result.push(this.generateExpression(stmt.left, const_1.Precedence.Call, E_TTT));
                }
                result = tools_1.join(result, operator, this.globalEnv);
                result = [tools_1.join(result, this.generateExpression(stmt.right, const_1.Precedence.Assignment, E_TTT), this.globalEnv), ')'];
            });
            result.push(this.maybeBlock(stmt.body, flags));
            return result;
        };
        this.generatePropertyKey = (expr, computed) => {
            const result = [];
            if (computed) {
                result.push('[');
            }
            result.push(this.generateExpression(expr, const_1.Precedence.Assignment, E_TTT));
            if (computed) {
                result.push(']');
            }
            return result;
        };
        this.generateAssignment = (left, right, operator, precedence, flags) => {
            if (const_1.Precedence.Assignment < precedence) {
                flags |= F_ALLOW_IN;
            }
            return tools_1.parenthesize([
                this.generateExpression(left, const_1.Precedence.Call, flags),
                this.globalEnv.space + operator + this.globalEnv.space,
                this.generateExpression(right, const_1.Precedence.Assignment, flags)
            ], const_1.Precedence.Assignment, precedence);
        };
        this.semicolon = (flags) => {
            if (!this.globalEnv.semicolons && flags & F_SEMICOLON_OPT) {
                return '';
            }
            return ';';
        };
        this.generateVerbatimString = (string) => {
            let i, iz;
            const result = string.split(/\r\n|\n/);
            for (i = 1, iz = result.length; i < iz; i++) {
                result[i] = this.globalEnv.newline + this.globalEnv.base + result[i];
            }
            return result;
        };
        this.generateVerbatim = (expr, precedence) => {
            let result, prec;
            const verbatim = expr[this.extra.verbatim];
            if (typeof verbatim === 'string') {
                result = tools_1.parenthesize(this.generateVerbatimString(verbatim), const_1.Precedence.Sequence, precedence);
            }
            else {
                // verbatim is object
                result = this.generateVerbatimString(verbatim.content);
                prec = (verbatim.precedence != null) ? verbatim.precedence : const_1.Precedence.Sequence;
                result = tools_1.parenthesize(result, prec, precedence);
            }
            return tools_1.toSourceNodeWhenNeeded(result, expr, this.globalEnv);
        };
        this.generateBlankLines = (start, end, result) => {
            let j, newlineCount = 0;
            for (j = start; j < end; j++) {
                if (this.globalEnv.sourceCode[j] === '\n') {
                    newlineCount++;
                }
            }
            for (j = 1; j < newlineCount; j++) {
                result.push(this.globalEnv.newline);
            }
        };
        this.generateExpression = (expr, precedence, flags) => {
            const type = expr.type || this.Syntax.Property;
            if (this.extra.verbatim && Object.prototype.hasOwnProperty.call(expr, this.extra.verbatim)) {
                return this.generateVerbatim(expr, precedence);
            }
            // 表达式类型的解析方式
            let result = this.Expression[type](expr, precedence, flags);
            if (this.extra.comment) {
                result = this.addComments(expr, result);
            }
            return tools_1.toSourceNodeWhenNeeded(result, expr, this.globalEnv);
        };
        this.generateComment = (comment, specialBase) => {
            if (comment.type === 'Line') {
                if (tools_1.endsWithLineTerminator(comment.value)) {
                    return '//' + comment.value;
                }
                else {
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
        };
        this.addComments = (stmt, result) => {
            let i, len, comment, save, tailingToStatement, specialBase = null, fragment, extRange, range, prevRange, prefix, infix, suffix, count;
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
                        result.push(tools_1.stringRepeat('\n', count));
                        result.push(tools_1.addIndent(this.generateComment(comment), this.globalEnv));
                    }
                    else {
                        result.push(prefix);
                        result.push(this.generateComment(comment));
                    }
                    prevRange = range;
                    for (i = 1, len = stmt.leadingComments.length; i < len; i++) {
                        comment = stmt.leadingComments[i];
                        range = comment.range;
                        infix = this.globalEnv.sourceCode.substring(prevRange[1], range[0]);
                        count = (infix.match(/\n/g) || []).length;
                        result.push(tools_1.stringRepeat('\n', count));
                        result.push(tools_1.addIndent(this.generateComment(comment), this.globalEnv));
                        prevRange = range;
                    }
                    suffix = this.globalEnv.sourceCode.substring(range[1], extRange[1]);
                    count = (suffix.match(/\n/g) || []).length;
                    result.push(tools_1.stringRepeat('\n', count));
                }
                else {
                    comment = stmt.leadingComments[0];
                    result = [];
                    if (this.globalEnv.safeConcatenation && stmt.type === this.Syntax.Program && stmt.body.length === 0) {
                        result.push('\n');
                    }
                    result.push(this.generateComment(comment));
                    if (!tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
                        result.push('\n');
                    }
                    for (i = 1, len = stmt.leadingComments.length; i < len; ++i) {
                        comment = stmt.leadingComments[i];
                        fragment = [this.generateComment(comment)];
                        if (!tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
                            fragment.push('\n');
                        }
                        result.push(tools_1.addIndent(fragment, this.globalEnv));
                    }
                }
                result.push(tools_1.addIndent(save, this.globalEnv));
            }
            if (stmt.trailingComments) {
                if (this.globalEnv.preserveBlankLines) {
                    comment = stmt.trailingComments[0];
                    extRange = comment.extendedRange;
                    range = comment.range;
                    prefix = this.globalEnv.sourceCode.substring(extRange[0], range[0]);
                    count = (prefix.match(/\n/g) || []).length;
                    if (count > 0) {
                        result.push(tools_1.stringRepeat('\n', count));
                        result.push(tools_1.addIndent(this.generateComment(comment), this.globalEnv));
                    }
                    else {
                        result.push(prefix);
                        result.push(this.generateComment(comment), this.globalEnv);
                    }
                }
                else {
                    tailingToStatement = !tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString());
                    specialBase = tools_1.stringRepeat(' ', tools_1.calculateSpaces(tools_1.toSourceNodeWhenNeeded([this.globalEnv.base, result, this.globalEnv.indent], {}, this.globalEnv).toString()));
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
                            }
                            else {
                                result = [result, specialBase];
                            }
                            result.push(this.generateComment(comment, specialBase));
                        }
                        else {
                            result = [result, tools_1.addIndent(this.generateComment(comment), this.globalEnv)];
                        }
                        if (i !== len - 1 && !tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
                            result = [result, '\n'];
                        }
                    }
                }
            }
            return result;
        };
        this.adjustMultilineComment = (value, specialBase) => {
            let i, len, line, j, previousBase, sn;
            const array = value.split(/\r\n|[\r\n]/);
            let spaces = Number.MAX_VALUE;
            // first line doesn't have indentation
            for (i = 1, len = array.length; i < len; ++i) {
                line = array[i];
                j = 0;
                while (j < line.length && esutils_1.default.code.isWhiteSpace(line.charCodeAt(j))) {
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
            }
            else {
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
                sn = tools_1.toSourceNodeWhenNeeded(tools_1.addIndent(array[i].slice(spaces), this.globalEnv), undefined, this.globalEnv);
                array[i] = this.globalEnv.sourceMap ? sn.join('') : sn;
            }
            this.globalEnv.base = previousBase;
            return array.join('\n');
        };
        this.generateStatement = (stmt, flags) => {
            let result = this.Statement[stmt.type](stmt, flags);
            // Attach comments
            if (this.extra.comment) {
                result = this.addComments(stmt, result);
            }
            const fragment = tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString();
            if (stmt.type === this.Syntax.Program && !this.safeConcatenation && this.globalEnv.newline === '' && fragment.charAt(fragment.length - 1) === '\n') {
                result = this.globalEnv.sourceMap ? tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).replaceRight(/\s+$/, '') : fragment.replace(/\s+$/, '');
            }
            return tools_1.toSourceNodeWhenNeeded(result, stmt, this.globalEnv);
        };
        this.maybeBlock = (stmt, flags) => {
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
                    tools_1.addIndent(this.generateStatement(stmt, flags), this.globalEnv)
                ];
            });
            return result;
        };
        this.maybeBlockSuffix = (stmt, result) => {
            const ends = tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString());
            if (stmt.type === this.Syntax.BlockStatement && (!this.extra.comment || !stmt.leadingComments) && !ends) {
                return [result, this.globalEnv.space];
            }
            if (ends) {
                return [result, this.globalEnv.base];
            }
            return [result, this.globalEnv.newline, this.globalEnv.base];
        };
        this.withIndent = (fn) => {
            const previousBase = this.globalEnv.base;
            this.globalEnv.base += this.globalEnv.indent;
            fn(this.globalEnv.base);
            this.globalEnv.base = previousBase;
        };
        this.Expression = {
            SequenceExpression: (expr, precedence, flags) => {
                let i, iz;
                if (const_1.Precedence.Sequence < precedence) {
                    flags |= F_ALLOW_IN;
                }
                const result = [];
                for (i = 0, iz = expr.expressions.length; i < iz; ++i) {
                    result.push(this.generateExpression(expr.expressions[i], const_1.Precedence.Assignment, flags));
                    if (i + 1 < iz) {
                        result.push(',' + this.globalEnv.space);
                    }
                }
                return tools_1.parenthesize(result, const_1.Precedence.Sequence, precedence);
            },
            AssignmentExpression: (expr, precedence, flags) => {
                return this.generateAssignment(expr.left, expr.right, expr.operator, precedence, flags);
            },
            ArrowFunctionExpression: (expr, precedence) => {
                return tools_1.parenthesize(this.generateFunctionBody(expr), const_1.Precedence.ArrowFunction, precedence);
            },
            ConditionalExpression: (expr, precedence, flags) => {
                if (const_1.Precedence.Conditional < precedence) {
                    flags |= F_ALLOW_IN;
                }
                return tools_1.parenthesize([
                    this.generateExpression(expr.test, const_1.Precedence.LogicalOR, flags),
                    this.globalEnv.space + '?' + this.globalEnv.space,
                    this.generateExpression(expr.consequent, const_1.Precedence.Assignment, flags),
                    this.globalEnv.space + ':' + this.globalEnv.space,
                    this.generateExpression(expr.alternate, const_1.Precedence.Assignment, flags)
                ], const_1.Precedence.Conditional, precedence);
            },
            LogicalExpression: (expr, precedence, flags) => {
                return this.Expression.BinaryExpression(expr, precedence, flags);
            },
            BinaryExpression: (expr, precedence, flags) => {
                let result, fragment;
                const currentPrecedence = BinaryPrecedence[expr.operator];
                const leftPrecedence = expr.operator === '**' ? const_1.Precedence.Postfix : currentPrecedence;
                const rightPrecedence = expr.operator === '**' ? currentPrecedence : currentPrecedence + 1;
                if (currentPrecedence < precedence) {
                    flags |= F_ALLOW_IN;
                }
                fragment = this.generateExpression(expr.left, leftPrecedence, flags);
                const leftSource = fragment.toString();
                if (leftSource.charCodeAt(leftSource.length - 1) === 0x2F /* / */ && esutils_1.default.code.isIdentifierPartES5(expr.operator.charCodeAt(0))) {
                    result = [fragment, tools_1.noEmptySpace(this.globalEnv.space), expr.operator];
                }
                else {
                    result = tools_1.join(fragment, expr.operator, this.globalEnv);
                }
                fragment = this.generateExpression(expr.right, rightPrecedence, flags);
                if (expr.operator === '/' && fragment.toString().charAt(0) === '/' ||
                    expr.operator.slice(-1) === '<' && fragment.toString().slice(0, 3) === '!--') {
                    // If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
                    result.push(tools_1.noEmptySpace(this.globalEnv.space));
                    result.push(fragment);
                }
                else {
                    result = tools_1.join(result, fragment, this.globalEnv);
                }
                if (expr.operator === 'in' && !(flags & F_ALLOW_IN)) {
                    return ['(', result, ')'];
                }
                return tools_1.parenthesize(result, currentPrecedence, precedence);
            },
            CallExpression: (expr, precedence, flags) => {
                let i, iz;
                // F_ALLOW_UNPARATH_NEW becomes false.
                const result = [this.generateExpression(expr.callee, const_1.Precedence.Call, E_TTF)];
                if (expr.optional) {
                    result.push('?.');
                }
                result.push('(');
                for (i = 0, iz = expr['arguments'].length; i < iz; ++i) {
                    result.push(this.generateExpression(expr['arguments'][i], const_1.Precedence.Assignment, E_TTT));
                    if (i + 1 < iz) {
                        result.push(',' + this.globalEnv.space);
                    }
                }
                result.push(')');
                if (!(flags & F_ALLOW_CALL)) {
                    return ['(', result, ')'];
                }
                return tools_1.parenthesize(result, const_1.Precedence.Call, precedence);
            },
            ChainExpression: (expr, precedence, flags) => {
                if (const_1.Precedence.OptionalChaining < precedence) {
                    flags |= F_ALLOW_CALL;
                }
                const result = this.generateExpression(expr.expression, const_1.Precedence.OptionalChaining, flags);
                return tools_1.parenthesize(result, const_1.Precedence.OptionalChaining, precedence);
            },
            NewExpression: (expr, precedence, flags) => {
                let i, iz;
                const length = expr['arguments'].length;
                // F_ALLOW_CALL becomes false.
                // F_ALLOW_UNPARATH_NEW may become false.
                const itemFlags = (flags & F_ALLOW_UNPARATH_NEW && !this.globalEnv.parentheses && length === 0) ? E_TFT : E_TFF;
                const result = tools_1.join('new', this.generateExpression(expr.callee, const_1.Precedence.New, itemFlags), this.globalEnv);
                if (!(flags & F_ALLOW_UNPARATH_NEW) || this.globalEnv.parentheses || length > 0) {
                    result.push('(');
                    for (i = 0, iz = length; i < iz; ++i) {
                        result.push(this.generateExpression(expr['arguments'][i], const_1.Precedence.Assignment, E_TTT));
                        if (i + 1 < iz) {
                            result.push(',' + this.globalEnv.space);
                        }
                    }
                    result.push(')');
                }
                return tools_1.parenthesize(result, const_1.Precedence.New, precedence);
            },
            MemberExpression: (expr, precedence, flags) => {
                let fragment;
                // F_ALLOW_UNPARATH_NEW becomes false.
                const result = [this.generateExpression(expr.object, const_1.Precedence.Call, (flags & F_ALLOW_CALL) ? E_TTF : E_TFF)];
                if (expr.computed) {
                    if (expr.optional) {
                        result.push('?.');
                    }
                    result.push('[');
                    result.push(this.generateExpression(expr.property, const_1.Precedence.Sequence, flags & F_ALLOW_CALL ? E_TTT : E_TFT));
                    result.push(']');
                }
                else {
                    if (!expr.optional && expr.object.type === this.Syntax.Literal && typeof expr.object.value === 'number') {
                        fragment = tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString();
                        // When the following conditions are all true,
                        //   1. No floating point
                        //   2. Don't have exponents
                        //   3. The last character is a decimal digit
                        //   4. Not hexadecimal OR octal number literal
                        // we should add a floating point.
                        if (fragment.indexOf('.') < 0 &&
                            !/[eExX]/.test(fragment) &&
                            esutils_1.default.code.isDecimalDigit(fragment.charCodeAt(fragment.length - 1)) &&
                            !(fragment.length >= 2 && fragment.charCodeAt(0) === 48) // '0'
                        ) {
                            result.push(' ');
                        }
                    }
                    result.push(expr.optional ? '?.' : '.');
                    result.push(this.generateIdentifier(expr.property));
                }
                return tools_1.parenthesize(result, const_1.Precedence.Member, precedence);
            },
            MetaProperty: (expr, precedence, flags) => {
                const result = [];
                result.push(typeof expr.meta === "string" ? expr.meta : this.generateIdentifier(expr.meta));
                result.push('.');
                result.push(typeof expr.property === "string" ? expr.property : this.generateIdentifier(expr.property));
                return tools_1.parenthesize(result, const_1.Precedence.Member, precedence);
            },
            UnaryExpression: (expr, precedence, flags) => {
                let result, rightCharCode, leftSource, leftCharCode;
                const fragment = this.generateExpression(expr.argument, const_1.Precedence.Unary, E_TTT);
                if (this.globalEnv.space === '') {
                    result = tools_1.join(expr.operator, fragment, this.globalEnv);
                }
                else {
                    result = [expr.operator];
                    if (expr.operator.length > 2) {
                        // delete, void, typeof
                        // get `typeof []`, not `typeof[]`
                        result = tools_1.join(result, fragment, this.globalEnv);
                    }
                    else {
                        // Prevent inserting spaces between operator and argument if it is unnecessary
                        // like, `!cond`
                        leftSource = tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString();
                        leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
                        rightCharCode = fragment.toString().charCodeAt(0);
                        if (((leftCharCode === 0x2B /* + */ || leftCharCode === 0x2D /* - */) && leftCharCode === rightCharCode) ||
                            (esutils_1.default.code.isIdentifierPartES5(leftCharCode) && esutils_1.default.code.isIdentifierPartES5(rightCharCode))) {
                            result.push(tools_1.noEmptySpace(this.globalEnv.space));
                            result.push(fragment);
                        }
                        else {
                            result.push(fragment);
                        }
                    }
                }
                return tools_1.parenthesize(result, const_1.Precedence.Unary, precedence);
            },
            YieldExpression: (expr, precedence, flags) => {
                let result;
                if (expr.delegate) {
                    result = 'yield*';
                }
                else {
                    result = 'yield';
                }
                if (expr.argument) {
                    result = tools_1.join(result, this.generateExpression(expr.argument, const_1.Precedence.Yield, E_TTT), this.globalEnv);
                }
                return tools_1.parenthesize(result, const_1.Precedence.Yield, precedence);
            },
            AwaitExpression: (expr, precedence, flags) => {
                const result = tools_1.join(expr.all ? 'await*' : 'await', this.generateExpression(expr.argument, const_1.Precedence.Await, E_TTT), this.globalEnv);
                return tools_1.parenthesize(result, const_1.Precedence.Await, precedence);
            },
            UpdateExpression: (expr, precedence, flags) => {
                if (expr.prefix) {
                    return tools_1.parenthesize([
                        expr.operator,
                        this.generateExpression(expr.argument, const_1.Precedence.Unary, E_TTT)
                    ], const_1.Precedence.Unary, precedence);
                }
                return tools_1.parenthesize([
                    this.generateExpression(expr.argument, const_1.Precedence.Postfix, E_TTT),
                    expr.operator
                ], const_1.Precedence.Postfix, precedence);
            },
            FunctionExpression: (expr, precedence, flags) => {
                const result = [
                    this.generateAsyncPrefix(expr, true),
                    'function'
                ];
                if (expr.id) {
                    result.push(this.generateStarSuffix(expr) || tools_1.noEmptySpace(this.globalEnv.space));
                    result.push(this.generateIdentifier(expr.id));
                }
                else {
                    result.push(this.generateStarSuffix(expr) || this.globalEnv.space);
                }
                result.push(this.generateFunctionBody(expr));
                return result;
            },
            ArrayPattern: (expr, precedence, flags) => {
                return this.Expression.ArrayExpression(expr, precedence, flags, true);
            },
            ArrayExpression: (expr, precedence, flags, isPattern) => {
                if (!expr.elements.length) {
                    return '[]';
                }
                const multiline = isPattern ? false : expr.elements.length > 1;
                const result = ['[', multiline ? this.globalEnv.newline : ''];
                this.withIndent((indent) => {
                    let i, iz;
                    for (i = 0, iz = expr.elements.length; i < iz; ++i) {
                        if (!expr.elements[i]) {
                            if (multiline) {
                                result.push(indent);
                            }
                            if (i + 1 === iz) {
                                result.push(',');
                            }
                        }
                        else {
                            result.push(multiline ? indent : '');
                            result.push(this.generateExpression(expr.elements[i], const_1.Precedence.Assignment, E_TTT));
                        }
                        if (i + 1 < iz) {
                            result.push(',' + (multiline ? this.globalEnv.newline : this.globalEnv.space));
                        }
                    }
                });
                if (multiline && !tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
                    result.push(this.globalEnv.newline);
                }
                result.push(multiline ? this.globalEnv.base : '');
                result.push(']');
                return result;
            },
            RestElement: (expr, precedence, flags) => {
                return '...' + this.generatePattern(expr.argument, precedence, flags);
            },
            ClassExpression: (expr, precedence, flags) => {
                let result, fragment;
                result = ['class'];
                if (expr.id) {
                    result = tools_1.join(result, this.generateExpression(expr.id, const_1.Precedence.Sequence, E_TTT), this.globalEnv);
                }
                if (expr.superClass) {
                    fragment = tools_1.join('extends', this.generateExpression(expr.superClass, const_1.Precedence.Unary, E_TTT), this.globalEnv);
                    result = tools_1.join(result, fragment, this.globalEnv);
                }
                result.push(this.globalEnv.space);
                result.push(this.generateStatement(expr.body, S_TFFT));
                return result;
            },
            MethodDefinition: (expr, precedence, flags) => {
                let result, fragment;
                if (expr['static']) {
                    result = ['static' + this.globalEnv.space];
                }
                else {
                    result = [];
                }
                if (expr.kind === 'get' || expr.kind === 'set') {
                    fragment = [
                        tools_1.join(expr.kind, this.generatePropertyKey(expr.key, expr.computed), this.globalEnv),
                        this.generateFunctionBody(expr.value)
                    ];
                }
                else {
                    fragment = [
                        this.generateMethodPrefix(expr),
                        this.generatePropertyKey(expr.key, expr.computed),
                        this.generateFunctionBody(expr.value)
                    ];
                }
                return tools_1.join(result, fragment, this.globalEnv);
            },
            Property: (expr, precedence, flags) => {
                if (expr.kind === 'get' || expr.kind === 'set') {
                    return [
                        expr.kind, tools_1.noEmptySpace(this.globalEnv.space),
                        this.generatePropertyKey(expr.key, expr.computed),
                        this.generateFunctionBody(expr.value)
                    ];
                }
                if (expr.shorthand) {
                    if (expr.value.type === "AssignmentPattern") {
                        return this.AssignmentPattern(expr.value, const_1.Precedence.Sequence, E_TTT);
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
                    this.generateExpression(expr.value, const_1.Precedence.Assignment, E_TTT)
                ];
            },
            ObjectExpression: (expr, precedence, flags) => {
                let result, fragment = null;
                if (!expr.properties.length) {
                    return '{}';
                }
                const multiline = expr.properties.length > 1;
                this.withIndent(() => {
                    fragment = this.generateExpression(expr.properties[0], const_1.Precedence.Sequence, E_TTT);
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
                    if (!tools_1.hasLineTerminator(tools_1.toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
                        return ['{', this.globalEnv.space, fragment, this.globalEnv.space, '}'];
                    }
                }
                this.withIndent((indent) => {
                    let i, iz;
                    result = ['{', this.globalEnv.newline, indent, fragment];
                    if (multiline) {
                        result.push(',' + this.globalEnv.newline);
                        for (i = 1, iz = expr.properties.length; i < iz; ++i) {
                            result.push(indent);
                            result.push(this.generateExpression(expr.properties[i], const_1.Precedence.Sequence, E_TTT));
                            if (i + 1 < iz) {
                                result.push(',' + this.globalEnv.newline);
                            }
                        }
                    }
                });
                if (!tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
                    result.push(this.globalEnv.newline);
                }
                result.push(this.globalEnv.base);
                result.push('}');
                return result;
            },
            AssignmentPattern: (expr, precedence, flags) => {
                return this.generateAssignment(expr.left, expr.right, '=', precedence, flags);
            },
            ObjectPattern: (expr, precedence, flags) => {
                let i, iz, property;
                if (!expr.properties.length) {
                    return '{}';
                }
                let multiline = false;
                if (expr.properties.length === 1) {
                    property = expr.properties[0];
                    if (property.type === this.Syntax.Property
                        && property.value.type !== this.Syntax.Identifier) {
                        multiline = true;
                    }
                }
                else {
                    for (i = 0, iz = expr.properties.length; i < iz; ++i) {
                        property = expr.properties[i];
                        if (property.type === this.Syntax.Property
                            && !property.shorthand) {
                            multiline = true;
                            break;
                        }
                    }
                }
                const result = ['{', multiline ? this.globalEnv.newline : ''];
                this.withIndent((indent) => {
                    let i, iz;
                    for (i = 0, iz = expr.properties.length; i < iz; ++i) {
                        result.push(multiline ? indent : '');
                        result.push(this.generateExpression(expr.properties[i], const_1.Precedence.Sequence, E_TTT));
                        if (i + 1 < iz) {
                            result.push(',' + (multiline ? this.globalEnv.newline : this.globalEnv.space));
                        }
                    }
                });
                if (multiline && !tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
                    result.push(this.globalEnv.newline);
                }
                result.push(multiline ? this.globalEnv.base : '');
                result.push('}');
                return result;
            },
            ThisExpression: (expr, precedence, flags) => {
                return 'this';
            },
            Super: (expr, precedence, flags) => {
                return 'super';
            },
            Identifier: (expr, precedence, flags) => {
                return this.generateIdentifier(expr);
            },
            ImportDefaultSpecifier: (expr, precedence, flags) => {
                return this.generateIdentifier(expr.id || expr.local);
            },
            ImportNamespaceSpecifier: (expr, precedence, flags) => {
                const result = ['*'];
                const id = expr.id || expr.local;
                if (id) {
                    result.push(this.globalEnv.space + 'as' + tools_1.noEmptySpace(this.globalEnv.space) + this.generateIdentifier(id));
                }
                return result;
            },
            ImportSpecifier: (expr, precedence, flags) => {
                const imported = expr.imported;
                const result = [imported.name];
                const local = expr.local;
                if (local && local.name !== imported.name) {
                    result.push(tools_1.noEmptySpace(this.globalEnv.space) + 'as' + tools_1.noEmptySpace(this.globalEnv.space) + this.generateIdentifier(local));
                }
                return result;
            },
            ExportSpecifier: (expr, precedence, flags) => {
                const local = expr.local;
                const result = [local.name];
                const exported = expr.exported;
                if (exported && exported.name !== local.name) {
                    result.push(tools_1.noEmptySpace(this.globalEnv.space) + 'as' + tools_1.noEmptySpace(this.globalEnv.space) + this.generateIdentifier(exported));
                }
                return result;
            },
            Literal: (expr, precedence, flags) => {
                let raw;
                if (Object.prototype.hasOwnProperty.call(expr, 'raw') && this.globalEnv.parse && this.extra.raw) {
                    try {
                        raw = this.globalEnv.parse(expr.raw).body[0].expression;
                        if (raw.type === this.Syntax.Literal) {
                            if (raw.value === expr.value) {
                                return expr.raw;
                            }
                        }
                    }
                    catch (e) {
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
                    return tools_1.escapeString(expr.value, this.globalEnv);
                }
                if (typeof expr.value === 'number') {
                    return this.generateNumber(expr.value);
                }
                if (typeof expr.value === 'boolean') {
                    return expr.value ? 'true' : 'false';
                }
                return this.generateRegExp(expr.value);
            },
            GeneratorExpression: (expr, precedence, flags) => {
                return this.ComprehensionExpression(expr, precedence, flags);
            },
            ComprehensionExpression: (expr, precedence, flags) => {
                // GeneratorExpression should be parenthesized with (...), ComprehensionExpression with [...]
                // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=883468 position of expr.body can differ in Spidermonkey and ES6
                let result, i, iz, fragment;
                result = (expr.type === this.Syntax.GeneratorExpression) ? ['('] : ['['];
                if (this.extra.moz.comprehensionExpressionStartsWithAssignment) {
                    fragment = this.generateExpression(expr.body, const_1.Precedence.Assignment, E_TTT);
                    result.push(fragment);
                }
                if (expr.blocks) {
                    this.withIndent(() => {
                        for (i = 0, iz = expr.blocks.length; i < iz; ++i) {
                            fragment = this.generateExpression(expr.blocks[i], const_1.Precedence.Sequence, E_TTT);
                            if (i > 0 || this.extra.moz.comprehensionExpressionStartsWithAssignment) {
                                result = tools_1.join(result, fragment, this.globalEnv);
                            }
                            else {
                                result.push(fragment);
                            }
                        }
                    });
                }
                if (expr.filter) {
                    result = tools_1.join(result, 'if' + this.globalEnv.space, this.globalEnv);
                    fragment = this.generateExpression(expr.filter, const_1.Precedence.Sequence, E_TTT);
                    result = tools_1.join(result, ['(', fragment, ')'], this.globalEnv);
                }
                if (!this.extra.moz.comprehensionExpressionStartsWithAssignment) {
                    fragment = this.generateExpression(expr.body, const_1.Precedence.Assignment, E_TTT);
                    result = tools_1.join(result, fragment, this.globalEnv);
                }
                result.push((expr.type === this.Syntax.GeneratorExpression) ? ')' : ']');
                return result;
            },
            ComprehensionBlock: (expr, precedence, flags) => {
                let fragment;
                if (expr.left.type === this.Syntax.VariableDeclaration) {
                    fragment = [
                        expr.left.kind, tools_1.noEmptySpace(this.globalEnv.space),
                        this.generateStatement(expr.left.declarations[0], S_FFFF)
                    ];
                }
                else {
                    fragment = this.generateExpression(expr.left, const_1.Precedence.Call, E_TTT);
                }
                fragment = tools_1.join(fragment, expr.of ? 'of' : 'in', this.globalEnv);
                fragment = tools_1.join(fragment, this.generateExpression(expr.right, const_1.Precedence.Sequence, E_TTT), this.globalEnv);
                return ['for' + this.globalEnv.space + '(', fragment, ')'];
            },
            SpreadElement: (expr, precedence, flags) => {
                return [
                    '...',
                    this.generateExpression(expr.argument, const_1.Precedence.Assignment, E_TTT)
                ];
            },
            TaggedTemplateExpression: (expr, precedence, flags) => {
                let itemFlags = E_TTF;
                if (!(flags & F_ALLOW_CALL)) {
                    itemFlags = E_TFF;
                }
                const result = [
                    this.generateExpression(expr.tag, const_1.Precedence.Call, itemFlags),
                    this.generateExpression(expr.quasi, const_1.Precedence.Primary, E_FFT)
                ];
                return tools_1.parenthesize(result, const_1.Precedence.TaggedTemplate, precedence);
            },
            TemplateElement: (expr, precedence, flags) => {
                // Don't use "cooked". Since tagged template can use raw template
                // representation. So if we do so, it breaks the script semantics.
                return expr.value.raw;
            },
            TemplateLiteral: (expr, precedence, flags) => {
                let i, iz;
                const result = ['`'];
                for (i = 0, iz = expr.quasis.length; i < iz; ++i) {
                    result.push(this.generateExpression(expr.quasis[i], const_1.Precedence.Primary, E_TTT));
                    if (i + 1 < iz) {
                        result.push('${' + this.globalEnv.space);
                        result.push(this.generateExpression(expr.expressions[i], const_1.Precedence.Sequence, E_TTT));
                        result.push(this.globalEnv.space + '}');
                    }
                }
                result.push('`');
                return result;
            },
            ModuleSpecifier: (expr, precedence, flags) => {
                return this.Literal(expr, precedence, flags);
            },
            ImportExpression: (expr, precedence) => {
                return tools_1.parenthesize([
                    'import(',
                    this.generateExpression(expr.source, const_1.Precedence.Assignment, E_TTT),
                    ')'
                ], const_1.Precedence.Call, precedence);
            },
        };
        this.Statement = {
            BlockStatement: (stmt, flags) => {
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
                        }
                        else {
                            fragment = tools_1.addIndent(this.generateStatement(stmt.body[i], bodyFlags), this.globalEnv);
                        }
                        result.push(fragment);
                        if (!tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
                            if (this.globalEnv.preserveBlankLines && i < iz - 1) {
                                // don't add a new line if there are leading coments
                                // in the next statement
                                if (!stmt.body[i + 1].leadingComments) {
                                    result.push(this.globalEnv.newline);
                                }
                            }
                            else {
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
                result.push(tools_1.addIndent('}', this.globalEnv)); // 
                return result;
            },
            BreakStatement: (stmt, flags) => {
                if (stmt.label) {
                    return 'break ' + stmt.label.name + this.semicolon(flags);
                }
                return 'break' + this.semicolon(flags);
            },
            ContinueStatement: (stmt, flags) => {
                if (stmt.label) {
                    return 'continue ' + stmt.label.name + this.semicolon(flags);
                }
                return 'continue' + this.semicolon(flags);
            },
            ClassBody: (stmt, flags) => {
                const result = ['{', this.globalEnv.newline];
                this.withIndent((indent) => {
                    let i, iz;
                    for (i = 0, iz = stmt.body.length; i < iz; ++i) {
                        result.push(indent);
                        result.push(this.generateExpression(stmt.body[i], const_1.Precedence.Sequence, E_TTT));
                        if (i + 1 < iz) {
                            result.push(this.globalEnv.newline);
                        }
                    }
                });
                if (!tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
                    result.push(this.globalEnv.newline);
                }
                result.push(this.globalEnv.base);
                result.push('}');
                return result;
            },
            ClassDeclaration: (stmt, flags) => {
                let result, fragment;
                result = ['class'];
                if (stmt.id) {
                    result = tools_1.join(result, this.generateExpression(stmt.id, const_1.Precedence.Sequence, E_TTT), this.globalEnv);
                }
                if (stmt.superClass) {
                    fragment = tools_1.join('extends', this.generateExpression(stmt.superClass, const_1.Precedence.Unary, E_TTT), this.globalEnv);
                    result = tools_1.join(result, fragment, this.globalEnv);
                }
                result.push(this.globalEnv.space);
                result.push(this.generateStatement(stmt.body, S_TFFT));
                return result;
            },
            DirectiveStatement: (stmt, flags) => {
                if (this.extra.raw && stmt.raw) {
                    return stmt.raw + this.semicolon(flags);
                }
                return this.escapeDirective(stmt.directive) + this.semicolon(flags);
            },
            DoWhileStatement: (stmt, flags) => {
                // Because `do 42 while (cond)` is this.Syntax Error. We need semicolon.
                let result = tools_1.join('do', this.maybeBlock(stmt.body, S_TFFF), this.globalEnv);
                result = this.maybeBlockSuffix(stmt.body, result);
                return tools_1.join(result, [
                    'while' + this.globalEnv.space + '(',
                    this.generateExpression(stmt.test, const_1.Precedence.Sequence, E_TTT),
                    ')' + this.semicolon(flags)
                ], this.globalEnv);
            },
            CatchClause: (stmt, flags) => {
                let result = [];
                this.withIndent(() => {
                    let guard;
                    if (stmt.param) {
                        result = [
                            'catch' + this.globalEnv.space + '(',
                            this.generateExpression(stmt.param, const_1.Precedence.Sequence, E_TTT),
                            ')'
                        ];
                        if (stmt.guard) {
                            guard = this.generateExpression(stmt.guard, const_1.Precedence.Sequence, E_TTT);
                            result.splice(2, 0, ' if ', guard);
                        }
                    }
                    else {
                        result = ['catch'];
                    }
                });
                result.push(this.maybeBlock(stmt.body, S_TFFF));
                return result;
            },
            DebuggerStatement: (stmt, flags) => {
                return 'debugger' + this.semicolon(flags);
            },
            EmptyStatement: (stmt, flags) => {
                return ';';
            },
            ExportDefaultDeclaration: (stmt, flags) => {
                let result = ['export'];
                const bodyFlags = (flags & F_SEMICOLON_OPT) ? S_TFFT : S_TFFF;
                // export default HoistableDeclaration[Default]
                // export default AssignmentExpression[In] ;
                result = tools_1.join(result, 'default', this.globalEnv);
                if (this.isStatement(stmt.declaration)) {
                    result = tools_1.join(result, this.generateStatement(stmt.declaration, bodyFlags), this.globalEnv);
                }
                else {
                    result = tools_1.join(result, this.generateExpression(stmt.declaration, const_1.Precedence.Assignment, E_TTT) + this.semicolon(flags), this.globalEnv);
                }
                return result;
            },
            ExportNamedDeclaration: (stmt, flags) => {
                let result = ['export'];
                const bodyFlags = (flags & F_SEMICOLON_OPT) ? S_TFFT : S_TFFF;
                // export VariableStatement
                // export Declaration[Default]
                if (stmt.declaration) {
                    return tools_1.join(result, this.generateStatement(stmt.declaration, bodyFlags), this.globalEnv);
                }
                // export ExportClause[NoReference] FromClause ;
                // export ExportClause ;
                if (stmt.specifiers) {
                    if (stmt.specifiers.length === 0) {
                        result = tools_1.join(result, '{' + this.globalEnv.space + '}', this.globalEnv);
                    }
                    else if (stmt.specifiers[0].type === this.Syntax.ExportBatchSpecifier) {
                        result = tools_1.join(result, this.generateExpression(stmt.specifiers[0], const_1.Precedence.Sequence, E_TTT), this.globalEnv);
                    }
                    else {
                        result = tools_1.join(result, '{', this.globalEnv);
                        this.withIndent((indent) => {
                            let i, iz;
                            result.push(this.globalEnv.newline);
                            for (i = 0, iz = stmt.specifiers.length; i < iz; ++i) {
                                result.push(indent);
                                result.push(this.generateExpression(stmt.specifiers[i], const_1.Precedence.Sequence, E_TTT));
                                if (i + 1 < iz) {
                                    result.push(',' + this.globalEnv.newline);
                                }
                            }
                        });
                        if (!tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
                            result.push(this.globalEnv.newline);
                        }
                        result.push(this.globalEnv.base + '}');
                    }
                    if (stmt.source) {
                        result = tools_1.join(result, [
                            'from' + this.globalEnv.space,
                            // ModuleSpecifier
                            this.generateExpression(stmt.source, const_1.Precedence.Sequence, E_TTT),
                            this.semicolon(flags)
                        ], this.globalEnv);
                    }
                    else {
                        result.push(this.semicolon(flags));
                    }
                }
                return result;
            },
            ExportAllDeclaration: (stmt, flags) => {
                // export * FromClause ;
                return [
                    'export' + this.globalEnv.space,
                    '*' + this.globalEnv.space,
                    'from' + this.globalEnv.space,
                    // ModuleSpecifier
                    this.generateExpression(stmt.source, const_1.Precedence.Sequence, E_TTT),
                    this.semicolon(flags)
                ];
            },
            ExpressionStatement: (stmt, flags) => {
                let result;
                function isClassPrefixed(fragment) {
                    if (fragment.slice(0, 5) !== 'class') {
                        return false;
                    }
                    const code = fragment.charCodeAt(5);
                    return code === 0x7B /* '{' */ || esutils_1.default.code.isWhiteSpace(code) || esutils_1.default.code.isLineTerminator(code);
                }
                function isFunctionPrefixed(fragment) {
                    if (fragment.slice(0, 8) !== 'function') {
                        return false;
                    }
                    const code = fragment.charCodeAt(8);
                    return code === 0x28 /* '(' */ || esutils_1.default.code.isWhiteSpace(code) || code === 0x2A /* '*' */ || esutils_1.default.code.isLineTerminator(code);
                }
                function isAsyncPrefixed(fragment) {
                    let i, iz;
                    if (fragment.slice(0, 5) !== 'async') {
                        return false;
                    }
                    if (!esutils_1.default.code.isWhiteSpace(fragment.charCodeAt(5))) {
                        return false;
                    }
                    for (i = 6, iz = fragment.length; i < iz; ++i) {
                        if (!esutils_1.default.code.isWhiteSpace(fragment.charCodeAt(i))) {
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
                    return code === 0x28 /* '(' */ || esutils_1.default.code.isWhiteSpace(code) || code === 0x2A /* '*' */ || esutils_1.default.code.isLineTerminator(code);
                }
                result = [this.generateExpression(stmt.expression, const_1.Precedence.Sequence, E_TTT)];
                // 12.4 '{', 'function', 'class' is not allowed in this position.
                // wrap expression with parentheses
                const fragment = tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString();
                if (fragment.charCodeAt(0) === 0x7B /* '{' */ || // ObjectExpression
                    isClassPrefixed(fragment) ||
                    isFunctionPrefixed(fragment) ||
                    isAsyncPrefixed(fragment) ||
                    (this.globalEnv.directive && (flags & F_DIRECTIVE_CTX) && stmt.expression.type === this.Syntax.Literal && typeof stmt.expression.value === 'string')) {
                    result = ['(', result, ')' + this.semicolon(flags)];
                }
                else {
                    result.push(this.semicolon(flags));
                }
                return result;
            },
            ImportDeclaration: (stmt, flags) => {
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
                        this.generateExpression(stmt.source, const_1.Precedence.Sequence, E_TTT),
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
                    result = tools_1.join(result, [
                        this.generateExpression(stmt.specifiers[cursor], const_1.Precedence.Sequence, E_TTT)
                    ], this.globalEnv);
                    ++cursor;
                }
                if (stmt.specifiers[cursor]) {
                    if (cursor !== 0) {
                        result.push(',');
                    }
                    if (stmt.specifiers[cursor].type === this.Syntax.ImportNamespaceSpecifier) {
                        // NameSpaceImport
                        result = tools_1.join(result, [
                            this.globalEnv.space,
                            this.generateExpression(stmt.specifiers[cursor], const_1.Precedence.Sequence, E_TTT)
                        ], this.globalEnv);
                    }
                    else {
                        // NamedImports
                        result.push(this.globalEnv.space + '{');
                        if ((stmt.specifiers.length - cursor) === 1) {
                            // import { ... } from "...";
                            result.push(this.globalEnv.space);
                            result.push(this.generateExpression(stmt.specifiers[cursor], const_1.Precedence.Sequence, E_TTT));
                            result.push(this.globalEnv.space + '}' + this.globalEnv.space);
                        }
                        else {
                            // import {
                            //    ...,
                            //    ...,
                            // } from "...";
                            this.withIndent((indent) => {
                                let i, iz;
                                result.push(this.globalEnv.newline);
                                for (i = cursor, iz = stmt.specifiers.length; i < iz; ++i) {
                                    result.push(indent);
                                    result.push(this.generateExpression(stmt.specifiers[i], const_1.Precedence.Sequence, E_TTT));
                                    if (i + 1 < iz) {
                                        result.push(',' + this.globalEnv.newline);
                                    }
                                }
                            });
                            if (!tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
                                result.push(this.globalEnv.newline);
                            }
                            result.push(this.globalEnv.base + '}' + this.globalEnv.space);
                        }
                    }
                }
                result = tools_1.join(result, [
                    'from' + this.globalEnv.space,
                    // ModuleSpecifier
                    this.generateExpression(stmt.source, const_1.Precedence.Sequence, E_TTT),
                    this.semicolon(flags)
                ], this.globalEnv);
                return result;
            },
            VariableDeclarator: (stmt, flags) => {
                const itemFlags = (flags & F_ALLOW_IN) ? E_TTT : E_FTT;
                if (stmt.init) {
                    return [
                        this.generateExpression(stmt.id, const_1.Precedence.Assignment, itemFlags),
                        this.globalEnv.space,
                        '=',
                        this.globalEnv.space,
                        this.generateExpression(stmt.init, const_1.Precedence.Assignment, itemFlags)
                    ];
                }
                return this.generatePattern(stmt.id, const_1.Precedence.Assignment, itemFlags);
            },
            VariableDeclaration: (stmt, flags) => {
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
                        result.push(tools_1.addIndent(this.generateStatement(node, bodyFlags), this.globalEnv));
                    }
                    else {
                        result.push(tools_1.noEmptySpace(this.globalEnv.space));
                        result.push(this.generateStatement(node, bodyFlags));
                    }
                    for (i = 1, iz = stmt.declarations.length; i < iz; ++i) {
                        node = stmt.declarations[i];
                        if (this.extra.comment && node.leadingComments) {
                            result.push(',' + this.globalEnv.newline);
                            result.push(tools_1.addIndent(this.generateStatement(node, bodyFlags), this.globalEnv));
                        }
                        else {
                            result.push(',' + this.globalEnv.space);
                            result.push(this.generateStatement(node, bodyFlags));
                        }
                    }
                };
                if (stmt.declarations.length > 1) {
                    this.withIndent(block);
                }
                else {
                    block();
                }
                result.push(this.semicolon(flags));
                return result;
            },
            ThrowStatement: (stmt, flags) => {
                return [tools_1.join('throw', this.generateExpression(stmt.argument, const_1.Precedence.Sequence, E_TTT), this.globalEnv), this.semicolon(flags)];
            },
            TryStatement: (stmt, flags) => {
                let result, i, iz, guardedHandlers;
                result = ['try', this.maybeBlock(stmt.block, S_TFFF)];
                result = this.maybeBlockSuffix(stmt.block, result);
                if (stmt.handlers) {
                    // old interface
                    for (i = 0, iz = stmt.handlers.length; i < iz; ++i) {
                        result = tools_1.join(result, this.generateStatement(stmt.handlers[i], S_TFFF), this.globalEnv);
                        if (stmt.finalizer || i + 1 !== iz) {
                            result = this.maybeBlockSuffix(stmt.handlers[i].body, result);
                        }
                    }
                }
                else {
                    guardedHandlers = stmt.guardedHandlers || [];
                    for (i = 0, iz = guardedHandlers.length; i < iz; ++i) {
                        result = tools_1.join(result, this.generateStatement(guardedHandlers[i], S_TFFF), this.globalEnv);
                        if (stmt.finalizer || i + 1 !== iz) {
                            result = this.maybeBlockSuffix(guardedHandlers[i].body, result);
                        }
                    }
                    // new interface
                    if (stmt.handler) {
                        if (Array.isArray(stmt.handler)) {
                            for (i = 0, iz = stmt.handler.length; i < iz; ++i) {
                                result = tools_1.join(result, this.generateStatement(stmt.handler[i], S_TFFF), this.globalEnv);
                                if (stmt.finalizer || i + 1 !== iz) {
                                    result = this.maybeBlockSuffix(stmt.handler[i].body, result);
                                }
                            }
                        }
                        else {
                            result = tools_1.join(result, this.generateStatement(stmt.handler, S_TFFF), this.globalEnv);
                            if (stmt.finalizer) {
                                result = this.maybeBlockSuffix(stmt.handler.body, result);
                            }
                        }
                    }
                }
                if (stmt.finalizer) {
                    result = tools_1.join(result, ['finally', this.maybeBlock(stmt.finalizer, S_TFFF)], this.globalEnv);
                }
                return result;
            },
            SwitchStatement: (stmt, flags) => {
                let result = [], fragment, i, iz;
                this.withIndent(() => {
                    result = [
                        'switch' + this.globalEnv.space + '(',
                        this.generateExpression(stmt.discriminant, const_1.Precedence.Sequence, E_TTT),
                        ')' + this.globalEnv.space + '{' + this.globalEnv.newline
                    ];
                });
                if (stmt.cases) {
                    let bodyFlags = S_TFFF;
                    for (i = 0, iz = stmt.cases.length; i < iz; ++i) {
                        if (i === iz - 1) {
                            bodyFlags |= F_SEMICOLON_OPT;
                        }
                        fragment = tools_1.addIndent(this.generateStatement(stmt.cases[i], bodyFlags), this.globalEnv);
                        result.push(fragment);
                        if (!tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
                            result.push(this.globalEnv.newline);
                        }
                    }
                }
                result.push(tools_1.addIndent('}', this.globalEnv));
                return result;
            },
            SwitchCase: (stmt, flags) => {
                let result = [], fragment, i, iz;
                this.withIndent(() => {
                    if (stmt.test) {
                        result = [
                            tools_1.join('case', this.generateExpression(stmt.test, const_1.Precedence.Sequence, E_TTT), this.globalEnv),
                            ':'
                        ];
                    }
                    else {
                        result = ['default:'];
                    }
                    i = 0;
                    iz = stmt.consequent.length;
                    if (iz && stmt.consequent[0].type === this.Syntax.BlockStatement) {
                        fragment = this.maybeBlock(stmt.consequent[0], S_TFFF);
                        result.push(fragment);
                        i = 1;
                    }
                    if (i !== iz && !tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(result, undefined, this.globalEnv).toString())) {
                        result.push(this.globalEnv.newline);
                    }
                    let bodyFlags = S_TFFF;
                    for (; i < iz; ++i) {
                        if (i === iz - 1 && flags & F_SEMICOLON_OPT) {
                            bodyFlags |= F_SEMICOLON_OPT;
                        }
                        fragment = tools_1.addIndent(this.generateStatement(stmt.consequent[i], bodyFlags), this.globalEnv);
                        result.push(fragment);
                        if (i + 1 !== iz && !tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
                            result.push(this.globalEnv.newline);
                        }
                    }
                });
                return result;
            },
            IfStatement: (stmt, flags) => {
                let result = [];
                this.withIndent(() => {
                    result = [
                        'if' + this.globalEnv.space + '(',
                        this.generateExpression(stmt.test, const_1.Precedence.Sequence, E_TTT),
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
                        result = tools_1.join(result, ['else ', this.generateStatement(stmt.alternate, bodyFlags)], this.globalEnv);
                    }
                    else {
                        result = tools_1.join(result, tools_1.join('else', this.maybeBlock(stmt.alternate, bodyFlags), this.globalEnv), this.globalEnv);
                    }
                }
                else {
                    result.push(this.maybeBlock(stmt.consequent, bodyFlags));
                }
                return result;
            },
            ForStatement: (stmt, flags) => {
                let result = [];
                this.withIndent(() => {
                    result = ['for' + this.globalEnv.space + '('];
                    if (stmt.init) {
                        if (stmt.init.type === this.Syntax.VariableDeclaration) {
                            result.push(this.generateStatement(stmt.init, S_FFFF));
                        }
                        else {
                            // F_ALLOW_IN becomes false.
                            result.push(this.generateExpression(stmt.init, const_1.Precedence.Sequence, E_FTT));
                            result.push(';');
                        }
                    }
                    else {
                        result.push(';');
                    }
                    if (stmt.test) {
                        result.push(this.globalEnv.space);
                        result.push(this.generateExpression(stmt.test, const_1.Precedence.Sequence, E_TTT));
                        result.push(';');
                    }
                    else {
                        result.push(';');
                    }
                    if (stmt.update) {
                        result.push(this.globalEnv.space);
                        result.push(this.generateExpression(stmt.update, const_1.Precedence.Sequence, E_TTT));
                        result.push(')');
                    }
                    else {
                        result.push(')');
                    }
                });
                result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
                return result;
            },
            ForInStatement: (stmt, flags) => {
                return this.generateIterationForStatement('in', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
            },
            ForOfStatement: (stmt, flags) => {
                return this.generateIterationForStatement('of', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
            },
            LabeledStatement: (stmt, flags) => {
                return [stmt.label.name + ':', this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF)];
            },
            Program: (stmt, flags) => {
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
                    const fragment = tools_1.addIndent(this.generateStatement(stmt.body[i], bodyFlags), this.globalEnv);
                    result.push(fragment);
                    if (i + 1 < iz && !tools_1.endsWithLineTerminator(tools_1.toSourceNodeWhenNeeded(fragment, undefined, this.globalEnv).toString())) {
                        if (this.globalEnv.preserveBlankLines) {
                            if (!stmt.body[i + 1].leadingComments) {
                                result.push(this.globalEnv.newline);
                            }
                        }
                        else {
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
            FunctionDeclaration: (stmt, flags) => {
                return [
                    this.generateAsyncPrefix(stmt, true),
                    'function',
                    this.generateStarSuffix(stmt) || tools_1.noEmptySpace(this.globalEnv.space),
                    stmt.id ? this.generateIdentifier(stmt.id) : '',
                    this.generateFunctionBody(stmt)
                ];
            },
            ReturnStatement: (stmt, flags) => {
                if (stmt.argument) {
                    return [tools_1.join('return', this.generateExpression(stmt.argument, const_1.Precedence.Sequence, E_TTT), this.globalEnv), this.semicolon(flags)];
                }
                return ['return' + this.semicolon(flags)];
            },
            WhileStatement: (stmt, flags) => {
                let result = [];
                this.withIndent(() => {
                    result = [
                        'while' + this.globalEnv.space + '(',
                        this.generateExpression(stmt.test, const_1.Precedence.Sequence, E_TTT),
                        ')'
                    ];
                });
                result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
                return result;
            },
            WithStatement: (stmt, flags) => {
                let result = [];
                this.withIndent(() => {
                    result = [
                        'with' + this.globalEnv.space + '(',
                        this.generateExpression(stmt.object, const_1.Precedence.Sequence, E_TTT),
                        ')'
                    ];
                });
                result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
                return result;
            }
        };
        // this.a = a;
        this.node = node;
        this.globalEnv = globalEnv;
        this.extra = extra;
        this.Syntax = estraverse.Syntax;
        // 标记表达式类型
    }
}
exports.Generator = Generator;
