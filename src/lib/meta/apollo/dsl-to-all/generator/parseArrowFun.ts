
import * as parser from '@babel/parser';
import { ArrowFunctionExpression } from "@babel/types"
import { FunTemplate } from '../define/esTemplateResolver';

/**
 * 传入的参数需要是 ast 结构
 *
 *  ArrowFunctionExpression
 */
export function resolverTemplate(endpoint: any): ArrowFunctionExpression {
  const template = FunTemplate(endpoint);
  const funTemplateAst: any = parser.parse(template);
  return funTemplateAst.program.body[0].expression;
}
