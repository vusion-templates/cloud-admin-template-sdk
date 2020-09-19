import * as parser from '@babel/parser';
import { ResolverOptions } from "../dsl-to-gql/interfaceStructure";
import traverse from '@babel/traverse'
import { ArrowFunctionExpression } from "@babel/types"
import { EntityfunTemplate, RootTemplete } from '../selfdefine/esTemplateResolver';
import { PathToBinaryExpressionString, QueryToObjectExpression } from "./paramsTansform";
/**
 * 传入的参数需要是 ast 结构
 *
 *  ArrowFunctionExpression
 */
export function resolverTemplate(config: ResolverOptions = { 
  baseUrl: '', 
  path: '',
  extendConfig: {},
  query: [],
}): ArrowFunctionExpression {
  const template = EntityfunTemplate({
    path: config.path ? PathToBinaryExpressionString(config.path) : 'PATH',
    query: QueryToObjectExpression(config.query),
    example: JSON.stringify(config.extendConfig.example),
  });
  const funTemplateAst: any = parser.parse(template);
  return funTemplateAst.program.body[0].expression;
}

export const ResolverAST = async (allEndpoints: any) => {
  // output resolver
  const ast = parser.parse(RootTemplete,  {
    sourceType: 'module'
  });
    
  traverse(ast, {
    ObjectProperty: {
      enter: (path) => {
        if (path.node.key.type === 'Identifier' && path.node.key.name === 'Query') {
          Object.keys(allEndpoints).forEach((operateId: string) => {
            const config: any = allEndpoints[operateId].config;
            const operateAST: any = {
              type: 'ObjectProperty',
              key: {
                type: 'Identifier',
                name: operateId,
              },
              value: resolverTemplate(config)
            }

            if (path.node.value.type === 'ObjectExpression') {
              path.node.value.properties.push(operateAST);
            }
          })
        }
      }
    }
  });

  return ast;
}
