import * as parser from "@babel/parser";
import { ArrowFunctionExpression } from "@babel/types";
import {
  PathToBinaryExpressionString,
  QueryToObjectExpression,
} from "../generator/paramsTansform";
import {
  EntityResolver,
  getParamDetails,
  getSuccessExample,
} from "../dsl-to-gql/interfaceStructure";
import {
  getParamDetailsFromRequestBody,
  Oa2NonBodyParam,
} from "../dsl-to-gql/config";

function EntityTemplate(params: any, beAssign: string) {
  return `${params.path === "PATH" ? 'const PATH = "";' : ""}
  ${params.query == "QUERYPARAM" ? "const QUERYPARAM = {};" : ""}
  const body = args.body;
  delete args.body;

  const { ${beAssign} } = await requester({
    url: {
      path: ${params.path},
      method: ${params.method},
      query: args,
      body: body,
    },
    config: {
      baseURL:'/',
    }
  });`;
}

// contain generator in all params
export function FullTemplate({
  resolver,
  meL,
  beAssign,
}: {
  resolver: EntityResolver;
  meL: string;
  beAssign: string;
}) {
  const interfaceObject = resolver.interface;
  // 通过 code 才能获取到返回到真实结构
  const examples = getSuccessExample(interfaceObject.responses);
  const method = interfaceObject.method;
  /**
   *  "parameters": {
        "id": {
          "name": "id",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "",
            "isLeaf": true
          }
        }
      },
      parameters in interface look like this
   */
  const bodyParams = interfaceObject.requestBody
    ? getParamDetailsFromRequestBody(interfaceObject.requestBody)
    : [];

  const parameterDetails = [
    ...(interfaceObject.parameters
      ? Object.values(
          interfaceObject.parameters
        ).map((param: Oa2NonBodyParam) => getParamDetails(param))
      : []),
    ...bodyParams,
  ];

  const mutation = ["POST", "PUT", "PATCH", "DELETE"].indexOf(method) !== -1;
  const path = resolver.interface.path;

  if (mutation) {
    const params = {
      path: path ? PathToBinaryExpressionString(path, meL) : "PATH",
      query: QueryToObjectExpression(parameterDetails, meL),
      examples: JSON.stringify(examples),
      method: JSON.stringify(resolver.interface.method),
    };
    return `${EntityTemplate(params, beAssign)}`;
  } else {
    // 参数转化为 ast 结构
    const params = {
      path: path ? PathToBinaryExpressionString(path, meL) : "PATH",
      query: QueryToObjectExpression(parameterDetails, meL),
      examples: JSON.stringify(examples),
      method: JSON.stringify(resolver.interface.method),
    };

    return `if (process.env.NODE_ENV === 'development' || process.env.VUE_APP_DESIGNER) {
      const ${beAssign} =  ${params.examples};
      return ${beAssign};
    } else {
      ${EntityTemplate(params, beAssign)}
      return ${beAssign};
    }`;
  }
}

/**
 * path = '/xxx/xx/' + args.id
 *
 * query {
 *   start: args.id,
 *   limit: args.id
 * }
 *
 * resolver
 */
export const AtomTemplate = (resolver: EntityResolver) => {
  return `async (parent, args = {}, context, info) => {
       try {
        ${FullTemplate({
          resolver,
          meL: "args",
          beAssign: "data",
        })}
      } catch (err) {
        console.error(err);
      }
    }
  `;

  // JSON + JSON
};

export function resolverAst(
  template: any = `() => {}`
): ArrowFunctionExpression {
  const funTemplateAst: any = parser.parse(template);
  return funTemplateAst.program.body[0].expression;
}
