export declare function TransforArrToBinaryExpression(arr: string[]): any;
/**
 * asdfaf{d}
 * =>  'asdfaf' + args.d
 *
 * 因为路径解析参数在 args 里面设置
 */
export declare function PathToBinaryExpressionString(str: string): any;
interface Param {
    name: string;
}
export declare function QueryToObjectExpression(obj?: Param[]): any;
export {};
