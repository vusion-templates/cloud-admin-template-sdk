import { ESASTNode } from ".";
// visit old tree
// import esrecurse from 'esrecurse';
import * as acorn from 'acorn';
import { getAllInterfaces, ResolverOptions } from "../dsl-to-gql/interfaceStructure";
import esrecurse from 'esrecurse';
import { dereference } from 'json-schema-ref-parser';
import { DSLSchema } from "../dsl-to-gql/confg";
import { funTemplate } from './esTemplate';

interface ASTNodeConfig {
	body: any[];
	value: string;
}

/**
 * 要求模版里面只有一个结果值才能找到目标更新
 * 替换请求地址，也可以根据表现层传递过来的参数去配置请求地址
 */
export function resolverTemplate(config: ResolverOptions) {
	// 获取基础模版节点
	const funTemplateAst: any = acorn.parse(funTemplate);
	esrecurse.visit(funTemplateAst, {
		Literal: (node: ASTNodeConfig) => {
			node.value = `${config.baseUrl}${config.path}`;
		},
	});

	return funTemplateAst.body[0].expression;
}

export const UpdateASTFn = async (ast: any, dslSchema: any) => {
	const schemaWithoutReferences = (await dereference(
		dslSchema,
	)) as DSLSchema;

	esrecurse.visit(ast, {
		ObjectExpression: async (node: ESASTNode) => {
			const endpoints: {
				[key: string]: {
					resolverOptions: ResolverOptions;
				};
			} = getAllInterfaces(schemaWithoutReferences);
			Object.keys(endpoints).forEach((operateId: string) => {
				const operateObject: ResolverOptions = endpoints[operateId].resolverOptions;

				const operateAST = {
					type: 'Property',
					key: {
						type: 'Identifier',
						name: operateId,
					},
					value: resolverTemplate(operateObject)
				}
				node.properties[0].value.properties.push(operateAST);
			})
		}
	});

	return ast;
}
/**
 *  parse await function, append to page
 * const ast = acorn.parse(`const resolvers = {
		Query: {
		},
	};`);

	acorn.parse 自动生成通用模版，更新局部参数

	用户配置信息加上常用模版共同组合成 resolver 函数和之后的的在页面上使用的查询函数

	1. 参加 gencode 的部分代码
	2. 参数自动编辑逻辑的数据结构组装方法
	3.
 */