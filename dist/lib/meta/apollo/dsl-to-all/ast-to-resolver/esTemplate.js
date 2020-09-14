"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.structureResolverTemplate = exports.funTemplate = void 0;
exports.funTemplate = `
	async () => {
		const data = await fetch('http://xxxx:2000/data');
		return data.json();
	}
`;
/**
 * 查询结构体可能是另一种模版
 */
exports.structureResolverTemplate = `
`;
