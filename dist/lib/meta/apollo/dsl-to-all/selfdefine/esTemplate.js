"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtherWebResolverTemplate = exports.StructureResolverTemplate = exports.EntityfunTemplate = exports.RootTemplete = void 0;
exports.RootTemplete = `
import requester from './requester';

export const resolvers = {
	Query: {
	},
};`;
/**
 * path = '/xxx/xx/' + args.id
 *
 * query {
 *   start: args.id,
 *   limit: args.id
 * }
 */
exports.EntityfunTemplate = ({ path, setFlag = true, query }) => {
    return `async (parent, args, context, info) => {
		${path === 'PATH' ? 'const PATH = "";' : ''}
		const { data } = await requester({
			url: {
				path: ${path},
				method: "get",
				query: ${query}
			},
			config: {
				baseURL:'/',
			}
		});
		return ${setFlag ? 'data && data.Data && data.Data.content' : 'data && data.Data'};
	}
`;
};
/**
 * 查询结构体内部需要补充和完善
 */
exports.StructureResolverTemplate = `
	async () => {
	}
`;
exports.OtherWebResolverTemplate = `
	async () => {
	}
`;
