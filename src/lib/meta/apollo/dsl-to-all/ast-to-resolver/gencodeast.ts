import { ESASTNode, generate } from ".";
import * as acorn from 'acorn';
import { ResolverOptions } from "../dsl-to-gql/interfaceStructure";
import esrecurse from 'esrecurse';
import { EntityfunTemplate, RootTemplete } from '../selfdefine/esTemplateResolver';
import { PathToBinaryExpressionString, QueryToObjectExpression } from "./paramsTansform";

/**
 * 要求模版里面只有一个结果值才能找到目标更新
 * 替换请求地址，也可以根据表现层传递过来的参数去配置请求地址
 */
export function resolverTemplate(config: ResolverOptions = { 
  baseUrl: '', 
  path: '',
  extendConfig: {},
  query: [],
}) {
  const template = EntityfunTemplate({
    path: config.path ? PathToBinaryExpressionString(config.path) : 'PATH',
    setFlag: config.extendConfig.setFlag,
    query: config.query? QueryToObjectExpression(config.query) : {},
    example: JSON.stringify(config.extendConfig.example),
  });
  const funTemplateAst: any = acorn.parse(template);
  return funTemplateAst.body[0].expression;
}

export const UpdateASTFn = async (allEndpoints: any) => {
  // output resolver
  const ast = acorn.parse(RootTemplete,  {
    sourceType: 'module'
  });
    
  esrecurse.visit(ast, {
    ObjectExpression: async (node: ESASTNode) => {
      Object.keys(allEndpoints).forEach((operateId: string) => {
        const config: any = allEndpoints[operateId].config;
        const operateAST = {
          type: 'Property',
          key: {
            type: 'Identifier',
            name: operateId,
          },
          value: resolverTemplate(config)
        }
        node.properties[0].value.properties.push(operateAST);
      })
    }
  });

  return ast;
}
