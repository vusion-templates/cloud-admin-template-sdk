export declare const UpdateAST: (ast: any, dslSchema: any) => Promise<any>;
export interface Expr {
    operator: string;
    expressions: string;
    optional: boolean;
    arguments: string;
    callee: any;
    prefix: string;
    source: string;
}
export interface ESASTNode {
    type: string;
    name: string;
    async: boolean;
    generator: boolean;
    params: any[];
    defaults: any[];
    [verbatim: string]: any;
    loc?: any;
}
export interface GlobalEnv {
    json: boolean;
    renumber: boolean;
    hexadecimal: boolean;
    quotes: string;
    escapeless: boolean;
    newline: string;
    space: string;
    parentheses: boolean;
    semicolons: boolean;
    safeConcatenation: boolean;
    directive: boolean;
    parse: any;
    sourceMap: {};
    sourceCode: string;
    preserveBlankLines: boolean;
    base: any;
    indent: any;
    SourceNode: any;
}
export interface Indent {
    style: string;
    base: number;
    adjustMultilineComment: boolean;
}
export interface ExtraOptions {
    format: {
        json: boolean;
        renumber: boolean;
        space: string;
        hexadecimal: boolean;
        semicolons: boolean;
        parentheses: boolean;
        safeConcatenation: boolean;
        quotes: string;
        newline: string;
        escapeless: boolean;
        compact: boolean;
        preserveBlankLines: boolean;
        indent: Indent;
    };
    raw: boolean;
    moz: {
        starlessGenerator: any;
        comprehensionExpressionStartsWithAssignment: boolean;
    };
    sourceMapRoot: any;
    sourceMapWithCode: boolean;
    directive: boolean;
    parse: any;
    indent: any;
    base: any;
    comment: any;
    sourceMap: any;
    sourceCode: any;
    sourceContent?: string;
    file: any;
    verbatim: any;
}
export declare function getDefaultOptions(): {
    indent: any;
    base: any;
    parse: any;
    comment: boolean;
    format: {
        indent: {
            style: string;
            base: number;
            adjustMultilineComment: boolean;
        };
        newline: string;
        space: string;
        json: boolean;
        renumber: boolean;
        hexadecimal: boolean;
        quotes: string;
        escapeless: boolean;
        compact: boolean;
        parentheses: boolean;
        semicolons: boolean;
        safeConcatenation: boolean;
        preserveBlankLines: boolean;
    };
    moz: {
        comprehensionExpressionStartsWithAssignment: boolean;
        starlessGenerator: boolean;
    };
    sourceMap: any;
    sourceMapRoot: any;
    sourceMapWithCode: boolean;
    directive: boolean;
    raw: boolean;
    verbatim: any;
    sourceCode: any;
    file: boolean;
};
export declare function generate(node: ESASTNode, options?: ExtraOptions): any;
