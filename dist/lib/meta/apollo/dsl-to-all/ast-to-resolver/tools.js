"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parenthesize = exports.calculateSpaces = exports.addIndent = exports.join = exports.noEmptySpace = exports.toSourceNodeWhenNeeded = exports.flattenToString = exports.escapeString = exports.escapeDirective = exports.escapeRegExpCharacter = exports.updateDeeply = exports.merge = exports.endsWithLineTerminator = exports.hasLineTerminator = exports.stringRepeat = void 0;
const esutils_1 = __importDefault(require("esutils"));
function stringRepeat(str, num) {
    let result = '';
    for (num |= 0; num > 0; num >>>= 1, str += str) {
        if (num & 1) {
            result += str;
        }
    }
    return result;
}
exports.stringRepeat = stringRepeat;
function hasLineTerminator(str) {
    return (/[\r\n]/g).test(str);
}
exports.hasLineTerminator = hasLineTerminator;
function endsWithLineTerminator(str) {
    const len = str.length;
    return len && esutils_1.default.code.isLineTerminator(str.charCodeAt(len - 1));
}
exports.endsWithLineTerminator = endsWithLineTerminator;
function merge(target, override) {
    let key;
    for (key in override) {
        if (Object.prototype.hasOwnProperty.call(override, key)) {
            target[key] = override[key];
        }
    }
    return target;
}
exports.merge = merge;
function updateDeeply(target, override) {
    let key, val;
    function isHashObject(target) {
        return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
    }
    for (key in override) {
        if (Object.prototype.hasOwnProperty.call(override, key)) {
            val = override[key];
            if (isHashObject(val)) {
                if (isHashObject(target[key])) {
                    updateDeeply(target[key], val);
                }
                else {
                    target[key] = updateDeeply({}, val);
                }
            }
            else {
                target[key] = val;
            }
        }
    }
    return target;
}
exports.updateDeeply = updateDeeply;
// Generate valid RegExp expression.
// This function is based on https://github.com/Constellation/iv Engine
function escapeRegExpCharacter(ch, previousIsBackslash) {
    // not handling '\' and handling \u2028 or \u2029 to unicode escape sequence
    if ((ch & ~1) === 0x2028) {
        return (previousIsBackslash ? 'u' : '\\u') + ((ch === 0x2028) ? '2028' : '2029');
    }
    else if (ch === 10 || ch === 13) { // \n, \r
        return (previousIsBackslash ? '' : '\\') + ((ch === 10) ? 'n' : 'r');
    }
    return String.fromCharCode(ch);
}
exports.escapeRegExpCharacter = escapeRegExpCharacter;
function escapeAllowedCharacter(code, next, globalEnv) {
    if (code === 0x08 /* \b */) {
        return '\\b';
    }
    if (code === 0x0C /* \f */) {
        return '\\f';
    }
    if (code === 0x09 /* \t */) {
        return '\\t';
    }
    const hex = code.toString(16).toUpperCase();
    if (globalEnv.json || code > 0xFF) {
        return '\\u' + '0000'.slice(hex.length) + hex;
    }
    else if (code === 0x0000 && !esutils_1.default.code.isDecimalDigit(next)) {
        return '\\0';
    }
    else if (code === 0x000B /* \v */) { // '\v'
        return '\\x0B';
    }
    else {
        return '\\x' + '00'.slice(hex.length) + hex;
    }
}
function escapeDisallowedCharacter(code) {
    if (code === 0x5C /* \ */) {
        return '\\\\';
    }
    if (code === 0x0A /* \n */) {
        return '\\n';
    }
    if (code === 0x0D /* \r */) {
        return '\\r';
    }
    if (code === 0x2028) {
        return '\\u2028';
    }
    if (code === 0x2029) {
        return '\\u2029';
    }
    throw new Error('Incorrectly classified character');
}
function escapeDirective(str, globalEnv) {
    let i, iz, code, quote;
    quote = globalEnv.quotes === 'double' ? '"' : '\'';
    for (i = 0, iz = str.length; i < iz; ++i) {
        code = str.charCodeAt(i);
        if (code === 0x27 /* ' */) {
            quote = '"';
            break;
        }
        else if (code === 0x22 /* " */) {
            quote = '\'';
            break;
        }
        else if (code === 0x5C /* \ */) {
            ++i;
        }
    }
    return quote + str + quote;
}
exports.escapeDirective = escapeDirective;
function escapeString(str, globalEnv) {
    let result = '', i, len, code, singleQuotes = 0, doubleQuotes = 0;
    for (i = 0, len = str.length; i < len; ++i) {
        code = str.charCodeAt(i);
        if (code === 0x27 /* ' */) {
            ++singleQuotes;
        }
        else if (code === 0x22 /* " */) {
            ++doubleQuotes;
        }
        else if (code === 0x2F /* / */ && globalEnv.json) {
            result += '\\';
        }
        else if (esutils_1.default.code.isLineTerminator(code) || code === 0x5C /* \ */) {
            result += escapeDisallowedCharacter(code);
            continue;
        }
        else if (!esutils_1.default.code.isIdentifierPartES5(code) && (globalEnv.json && code < 0x20 /* SP */ || !globalEnv.json && !globalEnv.escapeless && (code < 0x20 /* SP */ || code > 0x7E /* ~ */))) {
            result += escapeAllowedCharacter(code, str.charCodeAt(i + 1), globalEnv);
            continue;
        }
        result += String.fromCharCode(code);
    }
    const single = !(globalEnv.quotes === 'double' || (globalEnv.quotes === 'auto' && doubleQuotes < singleQuotes));
    const quote = single ? '\'' : '"';
    if (!(single ? singleQuotes : doubleQuotes)) {
        return quote + result + quote;
    }
    str = result;
    result = quote;
    for (i = 0, len = str.length; i < len; ++i) {
        code = str.charCodeAt(i);
        if ((code === 0x27 /* ' */ && single) || (code === 0x22 /* " */ && !single)) {
            result += '\\';
        }
        result += String.fromCharCode(code);
    }
    return result + quote;
}
exports.escapeString = escapeString;
/**
* flatten an array to a string, where the array can contain
* either strings or nested arrays
*/
function flattenToString(arr) {
    let i, iz, elem, result = '';
    for (i = 0, iz = arr.length; i < iz; ++i) {
        elem = arr[i];
        result += Array.isArray(elem) ? flattenToString(elem) : elem;
    }
    return result;
}
exports.flattenToString = flattenToString;
/**
* convert generated to a SourceNode when source maps are enabled.
*/
function toSourceNodeWhenNeeded(generated, node, globalEnv) {
    if (!globalEnv.sourceMap) {
        // with no source maps, generated is either an
        // array or a string.  if an array, flatten it.
        // if a string, just return it
        if (Array.isArray(generated)) {
            return flattenToString(generated);
        }
        else {
            return generated;
        }
    }
    if (node == null) {
        if (generated instanceof globalEnv.SourceNode) {
            return generated;
        }
        else {
            node = {};
        }
    }
    if (node.loc == null) {
        return new globalEnv.SourceNode(null, null, globalEnv.sourceMap, generated, node.name || null);
    }
    return new globalEnv.SourceNode(node.loc.start.line, node.loc.start.column, (globalEnv.sourceMap === true ? node.loc.source || null : globalEnv.sourceMap), generated, node.name || null);
}
exports.toSourceNodeWhenNeeded = toSourceNodeWhenNeeded;
function noEmptySpace(space) {
    return (space) ? space : ' ';
}
exports.noEmptySpace = noEmptySpace;
/**
 *
 */
function join(left, right, globalEnv) {
    const leftSource = toSourceNodeWhenNeeded(left, {}, globalEnv).toString();
    if (leftSource.length === 0) {
        return [right];
    }
    const rightSource = toSourceNodeWhenNeeded(right, {}, globalEnv).toString();
    if (rightSource.length === 0) {
        return [left];
    }
    const leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
    const rightCharCode = rightSource.charCodeAt(0);
    if ((leftCharCode === 0x2B /* + */ || leftCharCode === 0x2D /* - */) && leftCharCode === rightCharCode ||
        esutils_1.default.code.isIdentifierPartES5(leftCharCode) && esutils_1.default.code.isIdentifierPartES5(rightCharCode) ||
        leftCharCode === 0x2F /* / */ && rightCharCode === 0x69 /* i */) { // infix word operators all start with `i`
        return [left, noEmptySpace(globalEnv.space), right];
    }
    else if (esutils_1.default.code.isWhiteSpace(leftCharCode) || esutils_1.default.code.isLineTerminator(leftCharCode) ||
        esutils_1.default.code.isWhiteSpace(rightCharCode) || esutils_1.default.code.isLineTerminator(rightCharCode)) {
        return [left, right];
    }
    return [left, globalEnv.space, right];
}
exports.join = join;
function addIndent(stmt, globalEnv) {
    return [globalEnv.base, stmt];
}
exports.addIndent = addIndent;
// export function withIndent(fn: any, globalEnv: GlobalEnv) {
// 	var previousBase;
// 	previousBase = globalEnv.base;
// 	globalEnv.base += globalEnv.indent;
// 	fn(globalEnv.base);
// 	globalEnv.base = previousBase;
// }
function calculateSpaces(str) {
    let i;
    for (i = str.length - 1; i >= 0; --i) {
        if (esutils_1.default.code.isLineTerminator(str.charCodeAt(i))) {
            break;
        }
    }
    return (str.length - 1) - i;
}
exports.calculateSpaces = calculateSpaces;
function parenthesize(text, current, should) {
    if (current < should) {
        return ['(', text, ')'];
    }
    return text;
}
exports.parenthesize = parenthesize;
