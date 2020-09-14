


import { Generator } from './gernerator';
import { stringRepeat, updateDeeply } from './tools';
import { UpdateASTFn } from './gencodeast';

export const UpdateAST = UpdateASTFn;

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
	SourceNode: any; // TODO 
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

export function getDefaultOptions() {
	const newLocal: any = null;
	// default options
	return {
		indent: newLocal,
		base: newLocal,
		parse: newLocal,
		comment: false,
		format: {
			indent: {
				style: '  ', // use to define space size
				base: 0,
				adjustMultilineComment: false
			},
			newline: '\n',
			space: ' ',
			json: false,
			renumber: false,
			hexadecimal: false,
			quotes: 'single',
			escapeless: false,
			compact: false,
			parentheses: true,
			semicolons: true,
			safeConcatenation: false,
			preserveBlankLines: false
		},
		moz: {
			comprehensionExpressionStartsWithAssignment: false,
			starlessGenerator: false
		},
		sourceMap: newLocal,
		sourceMapRoot: newLocal,
		sourceMapWithCode: false,
		directive: false,
		raw: true,
		verbatim: newLocal,
		sourceCode: newLocal,
		file: false,
	};
}

export function generate(node: ESASTNode, options?: ExtraOptions) {
	const defaultOptions: ExtraOptions = getDefaultOptions();
	let indent, base;

	if (options != null) {
		// Obsolete options
		//
		//   `options.indent`
		//   `options.base`
		//
		// Instead of them, we can use `option.format.indent`.
		if (typeof options.indent === 'string') {
			defaultOptions.format.indent.style = options.indent;
		}
		if (typeof options.base === 'number') {
			defaultOptions.format.indent.base = options.base;
		}
		options = updateDeeply(defaultOptions, options);
		indent = options.format.indent.style;
		if (typeof options.base === 'string') {
			base = options.base;
		} else {
			base = stringRepeat(indent, options.format.indent.base);
		}
	} else {
		options = defaultOptions;
		indent = options.format.indent.style;
		base = stringRepeat(indent, options.format.indent.base);
	}

	/**
	 * 当作全局变量用的参数，放入 gloOptions 中使用
	 */
	const json = options.format.json;
	const renumber = options.format.renumber;
	const hexadecimal = json ? false : options.format.hexadecimal;
	const quotes = json ? 'double' : options.format.quotes;
	const escapeless = options.format.escapeless;
	let newline = options.format.newline;
	let space = options.format.space;
	if (options.format.compact) {
		newline = space = indent = base = '';
	}
	const parentheses = options.format.parentheses;
	const semicolons = options.format.semicolons;
	const safeConcatenation = options.format.safeConcatenation;
	const directive = options.directive;
	const parse = json ? null : options.parse;
	const sourceMap = options.sourceMap;
	const sourceCode = options.sourceCode;
	const preserveBlankLines = options.format.preserveBlankLines && sourceCode !== null;

	/**
	 * 计算之后的配置参数
	 */

	/**
	 * 计算前的默认配置
	 */
	const extra = options;

	let SourceNode: any;
	const newLocal: any = null;

	if (sourceMap) {
		if (!exports.browser) {
			// We assume environment is node.js
			// And prevent from including source-map by browserify
			SourceNode = require('source-map').SourceNode;
		} else {
			// 浏览器环境
			const browserGlobal: any = global;
			SourceNode = browserGlobal.sourceMap.SourceNode;
		}
	}
	
	const globalEnv: GlobalEnv = {
		json,
		renumber,
		hexadecimal,
		quotes,
		escapeless,
		newline,
		space,
		parentheses,
		semicolons,
		safeConcatenation,
		directive,
		parse,
		sourceMap,
		sourceCode,
		preserveBlankLines,
		base,
		indent,
		SourceNode,
	}

	const result = new Generator(node, globalEnv, extra).generateInternal();

	if (!sourceMap) {
		const pair = { code: result.toString(), map: newLocal };
		return options.sourceMapWithCode ? pair : pair.code;
	}



	const pair = result.toStringWithSourceMap({
		file: options.file,
		sourceRoot: options.sourceMapRoot
	});

	if (options.sourceContent) {
		pair.map.setSourceContent(options.sourceMap, options.sourceContent);
	}

	if (options.sourceMapWithCode) {
		return pair;
	}

	return pair.map.toString();
}


	// exports.version = require('./package.json').version;
	// exports.generate = generate;
	// exports.attachComments = estraverse.attachComments;
	// exports.Precedence = updateDeeply({}, Precedence);
	// exports.browser = false;
	// exports.FORMAT_MINIFY = FORMAT_MINIFY;
	// exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;
/* vim: set sw=4 ts=4 et tw=80 : */