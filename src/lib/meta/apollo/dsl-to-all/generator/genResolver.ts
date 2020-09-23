import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { RootTemplete } from "../define/esTemplateResolver";
import { resolverTemplate } from "./parseArrowFun";
import { ObjectTypeExtensionNode } from "graphql";

function PathNodeUpdate(allEndpoints: any, isMutation: boolean) {
  const properties: any[] = [];
  Object.keys(allEndpoints).forEach((operationId: string) => {
    if (!!allEndpoints[operationId].mutation === !!isMutation) {
      const endpoint: any = allEndpoints[operationId];
      const operateAST: any = {
        type: "ObjectProperty",
        key: {
          type: "Identifier",
          name: operationId,
        },
        value: resolverTemplate(endpoint),
      };
      properties.push(operateAST);
    }
  });

  return properties;
}
/**
 *
 * export const resolvers = {
 *   Query: {
 *     [EntityName/SturctureName]: func
 *   }
 * }
 *
 */
export const ResolverAST = async (allEndpoints: any) => {
  // output resolver
  const ast = parser.parse(RootTemplete, {
    sourceType: "module",
  });

  traverse(ast, {
    ObjectProperty: {
      enter: (path) => {
        if (
          path.node.key.type === "Identifier" &&
          path.node.key.name === "Query"
        ) {
          if (path.node.value.type === "ObjectExpression") {
            const result = PathNodeUpdate(allEndpoints, false);
            // 普通赋值可能更新不成功
            result.forEach((proper) => {
              const pathObject: any = path.node.value;
              pathObject.properties.push(proper);
            });
          }
        }

        if (
          path.node.key.type === "Identifier" &&
          path.node.key.name === "Mutation"
        ) {
          if (path.node.value.type === "ObjectExpression") {
            const result = PathNodeUpdate(allEndpoints, true);
            result.forEach((proper) => {
              const pathObject: any = path.node.value;
              pathObject.properties.push(proper);
            });
          }
        }
      },
    },
  });

  return ast;
};
