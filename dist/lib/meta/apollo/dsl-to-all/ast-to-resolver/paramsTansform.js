"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryToObjectExpression = exports.PathToBinaryExpressionString = exports.TransforArrToBinaryExpression = void 0;
const _1 = require(".");
/**
 * /dd/dd/{id}
 *
 * args 是 resolver 函数的参数
 *
 * ‘/dd/dd/’ + args.id
 */
function Literal(str) {
    let temp = [];
    const arr = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '{') {
            const cloneTemp = [...temp];
            arr.push({ type: 'Literal', value: cloneTemp.join('') });
            temp = [];
        }
        else if (str[i] === '}') {
            const cloneTemp = [...temp];
            arr.push({
                type: 'MemberExpression',
                object: {
                    type: 'Identifier',
                    name: 'args'
                },
                property: {
                    type: 'Identifier', name: cloneTemp.join('')
                }
            });
            temp = [];
        }
        else {
            temp.push(str[i]);
            if (i == str.length - 1) {
                const cloneTemp = [...temp];
                arr.push({ type: 'Literal', value: cloneTemp.join('') });
            }
        }
    }
    return arr;
}
function TransforArrToBinaryExpression(arr) {
    let root = {};
    if (arr.length >= 2) {
        while (arr.length) {
            if (root.type) {
                root.right = root;
                root.left = arr.pop();
                root.operator = '+';
                root.type = 'BinaryExpression';
            }
            else {
                const right = arr.pop();
                const left = arr.pop();
                root = {
                    operator: '+',
                    left,
                    right,
                    type: 'BinaryExpression',
                };
            }
        }
    }
    else {
        // if only one
        root = arr[0];
    }
    return root;
}
exports.TransforArrToBinaryExpression = TransforArrToBinaryExpression;
/**
 * asdfaf{d}
 * =>  'asdfaf' + args.d
 *
 * 因为路径解析参数在 args 里面设置
 */
function PathToBinaryExpressionString(str) {
    if (str.length >= 1) {
        const arr = Literal(str);
        return _1.generate(TransforArrToBinaryExpression(arr));
    }
    return str;
}
exports.PathToBinaryExpressionString = PathToBinaryExpressionString;
function QueryToObjectExpression(obj = []) {
    const root = {
        type: 'ObjectExpression',
        properties: [],
    };
    obj.forEach((param) => {
        const { name } = param;
        // check if in query
        root.properties.push({
            type: 'Property',
            key: {
                type: 'Identifier',
                name,
            },
            value: {
                type: 'MemberExpression',
                object: {
                    type: 'Identifier',
                    name: 'args',
                },
                property: {
                    type: 'Identifier',
                    name
                }
            }
        });
    });
    return _1.generate(root);
}
exports.QueryToObjectExpression = QueryToObjectExpression;
