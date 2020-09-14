import { ExtraOptions, GlobalEnv, ESASTNode } from ".";
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
export declare class Generator {
    node: ESASTNode;
    globalEnv: GlobalEnv;
    extra: ExtraOptions;
    Syntax: any;
    [key: string]: any;
    constructor(node: ESASTNode, globalEnv: GlobalEnv, extra: ExtraOptions);
    isExpression: (node: ESASTNode) => any;
    isStatement: (node: ESASTNode) => any;
    generateInternal: () => any;
    generateIdentifier: (node: ESASTNode) => any;
    generateAsyncPrefix: (node: ESASTNode, spaceRequired: boolean) => string;
    generateStarSuffix: (node: ESASTNode) => string;
    generateMethodPrefix: (prop: any) => string;
    generatePattern: (node: any, precedence: number, flags: number) => any;
    generateNumber: (value: any) => string;
    generateRegExp: (reg: RegExp) => string;
    generateFunctionParams: (node: ESASTNode) => any[];
    generateFunctionBody: (node: ESASTNode) => any[];
    generateIterationForStatement: (operator: any, stmt: any, flags: number) => any[];
    generatePropertyKey: (expr: ESASTNode, computed: boolean) => any[];
    generateAssignment: (left: any, right: any, operator: string, precedence: number, flags: number) => string | (string | string[])[];
    semicolon: (flags: number) => "" | ";";
    generateVerbatimString: (string: any) => any;
    generateVerbatim: (expr: ESASTNode, precedence: number) => any;
    generateBlankLines: (start: number, end: number, result: string[]) => void;
    generateExpression: (expr: ESASTNode, precedence: number, flags: number) => any;
    generateComment: (comment: Comment, specialBase?: string) => string;
    addComments: (stmt: ESASTNode, result: any[]) => any[];
    adjustMultilineComment: (value: string, specialBase?: any) => string;
    generateStatement: (stmt: ESASTNode, flags: number) => any;
    maybeBlock: (stmt: ESASTNode, flags: number) => any[] | ";";
    maybeBlockSuffix: (stmt: ESASTNode, result: any) => any[];
    withIndent: (fn: any) => void;
    Expression: {
        [key: string]: any;
    };
    Statement: {
        [key: string]: any;
    };
}
