import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { AtomTemplate, resolverAst } from "./parseArrowFun";
import { ResolverType } from "../dsl-to-gql/interfaceStructure";
import { getSuccessResponse } from "../dsl-to-gql/config";
import _get = require("lodash.get");

type ExpressionAST = {
  name: string;
  resolverName: string;
  type: string;
  resolvers: any[];
};

function getResovlerUUId(object: any) {
  const resolvers = object.resolvers || [];
  const resolver =
    resolvers.find((o: any) => {
      return o.name === object.resolverName;
    }) || {};
  const resolverUUID = resolver.uuid;
  return resolverUUID;
}

function findResolver(object: any) {
  const resolvers = object.resolvers || [];
  const resolver =
    resolvers.find((o: any) => {
      return o.name === object.resolverName;
    }) || {};
  return resolver;
}

const assignTemplate = [
  `function arrayTemplate(args, fn) {
    return Object.values(args.uuidData).map(fn)
  }`,
  `function objectTemplate(args, fn){
    return fn(args.uuidData);
  }`,
];

function ArrayAssign(uuidData: string, conbineStr: string) {
  return `arrayTemplate({
    uuidData: ${uuidData}
  }, (o = {}, index) => {
    return ${conbineStr}
  })
  `;
}

function ObjectAssign(uuidData: string, combineStr: string) {
  return `objectTemplate({
    uuidData: ${uuidData}
  }, (o = {}) => {
    return ${combineStr}
  })
  `;
}

const callArrayTemplate = (
  leftUUID: string,
  params: any[],
  rightUUID: string
) => {
  const result = `function arrayCall${leftUUID}() {
    const data = [];
    Object.values(args.${rightUUID}_Data).forEach((o) => {
      const tempData = resolvers.Query.${leftUUID}(null, ${
    params.length > 0 ? params.join(",") : "{}"
  });
       // 多个参数的返回结果
      data.push(tempData);
    })
    return data;
  }
  args.${leftUUID}_Data = arrayCall${leftUUID}() || {};
  `;
  return result;
};

/**
 *  通过 code 解析出真实返回结构里面的对象类型
 */
function CheckResolverReturnType(resolver: any) {
  if (resolver.type === ResolverType.INTERFACE) {
    // 解析了 $ref 之后的结构是包含 schema 的类型信息的
    const converSchema: any =
      getSuccessResponse(resolver.interface.responses) || {};
    return _get(
      {
        data: converSchema,
      },
      `${resolver.code.split(".").join(".properties.")}.type`
    );
  } else {
    return resolver.expression.type;
  }
}

export function GenFullResolver(allEndpoints: any) {
  const allResolvers: {
    [fullResolverName: string]: string;
  } = {};

  Object.keys(allEndpoints).forEach((operationId: string) => {
    // 利用全量信息获得 resolver
    const endpoint: any = allEndpoints[operationId];
    const resolver = endpoint.resolver;

    function genSingleResolver(resolver: any) {
      const uuid = resolver.uuid;
      // 用于标记在单个 resolver 表达式中，某个接口是否已经发请求，并且求值
      const map: {
        [key: string]: any;
      } = {};

      // 分析返回表达式的类型
      function analysisExmpressForReturnData(expression: any) {
        const resultCode: any[] = [...assignTemplate];
        const parentType = expression.type;
        /**
         * 分析结构是数组还是对象，分别进行处理
         * 如果在解析的过程中发展复杂对象，进入对当前对象的进一步处理
         */
        function anlysisProperties(expression: any, parentType: any) {
          // 进入第二层分析的时候
          const { ast, properties, items, type } = expression;

          function anlysisPropertiesTo(
            properties: any = [],
            parentType: string
          ) {
            const tempCode = ["{"];
            Object.keys(properties || []).forEach((properKey) => {
              const proper = properties[properKey];
              // 如果是个复杂的 proper
              if (proper.properties) {
                // 结构继续进入复杂 proper 的分析
                tempCode.push(
                  `${properKey}: ${anlysisProperties(proper, parentType)},`
                );
              } else {
                tempCode.push(`${properKey}: o.${proper.ast.property.name},`);
              }
            });
            tempCode.push("}");
            return tempCode.join("\n").toString();
          }

          const result = [];

          if (parentType === "array" && type === "object") {
            // 表达式匹配解析出来的是对象，但是父亲级别的是一个数组，其 `args.${getResovlerUUId(ast)}_Data` 的值其实是个数组，这个时候需要取匹配的值填充
            result.push(
              ObjectAssign(
                `args.${getResovlerUUId(ast)}_Data[index]`,
                anlysisPropertiesTo(properties, parentType)
              )
            );
          }

          if (parentType === "object" && type === "object") {
            // 如果是对象进入对象的赋值，并且赋值关系是从 properties 开始，通常当前原始的 ast 都标记了属于的来源
            result.push(
              ObjectAssign(
                `args.${getResovlerUUId(ast)}_Data`,
                anlysisPropertiesTo(properties, parentType)
              )
            );
          }

          if (type === "array") {
            // 如果数数组，进入数组的函数，并且复制关系是从 items 开始的
            result.push(
              ArrayAssign(
                `args.${getResovlerUUId(ast)}_Data`,
                anlysisPropertiesTo(items.properties, parentType)
              )
            );
          }

          return result.join("\n").toString();
        }

        // 第一层表达 experssion 和当前对象的结构是一致的
        resultCode.push(`return ${anlysisProperties(expression, parentType)}`);

        return resultCode;
      }

      /**
       * 需要一个 source 队列维护解析顺序
       * 如果依赖请求都结构体已经存在，那么直接访问，否则进入访问队列，下次再访问
       */
      function VisitResource(resolver: any = {}) {
        const codeResult: any[] = [];
        let params: any[] = [];
        let rightResolverUUID = "";
        const sourceQueue = Object.values(resolver.source) || [];
        // expression 用来解析真实的返回结构
        while (sourceQueue.length) {
          const sourceItem: any = sourceQueue.shift();
          const { assignments } = sourceItem;
          let isVisitable = true;
          let arrayExpression = false;
          const uuid = getResovlerUUId(sourceItem);

          // if (!allResolvers.uuid) {
          //   如果指向的是结构，那么在入口进来的地方，这个结构也同样会被定义， 所以同样可以直接使用
          // }
          /**
           * 无论当前 source 结构是已经被定义，访问还是正常执行，但是依赖的参数如果没有已经被访问
           * 那么需要进入访问队列
           *
           */
          if (Object.values(assignments || []).length > 0) {
            params = [];
            // 如果当前的数据源有参数
            assignments.some((assigntemp: any) => {
              const { right, left, ast, code } = assigntemp;
              if (right.includes("$params")) {
                /**
                 * 右侧参数需要通过 $params 替换求值
                 * stayRecord.id 先转化成下面的结构
                 */
                const leftName = ast.left.object.name;
                const resolverUUID = getResovlerUUId(ast.left.object);

                // 这里对 leftKey 的解析严格依赖当前的结构 uuid，因为下次也是会被当前的结构按照同样的方式去使用的
                const leftKey = left
                  .split(".")
                  .join("_")
                  .replace(new RegExp(`^${leftName}`), `args.${resolverUUID}`);
                codeResult.push(
                  `${leftKey} = ${right.replace("$params", "args")}`
                );

                // args 参数被用了
                map[leftKey] = true;
                params.push(leftKey);
              } else {
                // 标记某一个参数是数组类型的和左侧的赋值不一样，就需要遍历处理
                // 在右边的参数，多个 resolver 里面找到当前要用的 resolver
                const resolverUUID = getResovlerUUId(ast.right.object);
                // 如果已经被求过值了，那么参数直接用，
                if (map[`${resolverUUID}_Data`]) {
                  // Notice 这里是针对对象的聚合方式，如果是数组的话，需要单独处理
                  // 因为这里的 right name 在表达式里面使用，所以其实是用表达式的唯一标记方式
                  const rightName = ast.right.object.name;
                  // 检查这个右边的 resolver 的返回是否是数组
                  const rightResolverType = CheckResolverReturnType(
                    findResolver(ast.right.object)
                  );
                  const leftResolverType = CheckResolverReturnType(
                    findResolver(ast.left.object)
                  );

                  let paramName = "";
                  // 需要判断被赋值的参数, 目前测试，如果右侧返回的是 array，那么走遍历表达式的情况
                  if (rightResolverType === "array") {
                    // 因为参数如果是数组，要赋予值给左侧  string ，确实是需要循环处理的， 并且在循环处理的过程中还会用到这个结果数组
                    arrayExpression = true;
                    rightResolverUUID = resolverUUID;
                    paramName = right.replace(new RegExp(`^${rightName}`), `o`);
                  } else {
                    paramName = right.replace(
                      new RegExp(`^${rightName}`),
                      `args.${resolverUUID}_Data`
                    );
                  }
                  /**
                   * 因为 `${resolverUUID}_Data` 左侧的数据已经被求值过，所以直接根据右侧表达式取值
                   * right 表达式替换第一个标记实体，即 ast.right 里面定义指向的对象
                   */
                  params.push(paramName);
                } else {
                  // 如果一个 source 里面没有用到任何被求过值的参数，那么这个 source 被标记为当前不能访问，再次进入队列等待以后被求值
                  isVisitable = false;
                }
              }
            });
          }
          // 如果当前参数都已经被求过了，那么当前都就正常访问
          if (isVisitable) {
            map[`${uuid}_Data`] = true;

            if (arrayExpression) {
              // 如果是走数组表达式， 当前的标记对象也会被转化数组类型的结果
              codeResult.push(
                callArrayTemplate(uuid, params, rightResolverUUID)
              );
            } else {
              codeResult.push(
                `args.${uuid}_Data = resolvers.Query.${uuid}(null, ${
                  params.length > 0 ? params.join(",") : "{}"
                }) || {};`
              );
            }
          } else {
            /**
             * 当前算法时间复杂度依赖初始顺序
             */
            sourceQueue.push(sourceItem);
          }
        }
        return codeResult;
      }

      if (resolver.type === ResolverType.INTERFACE) {
        allResolvers[uuid] = AtomTemplate(resolver);
      } else {
        // 访问完全部的 source 以后，添加上表达式
        // 解析当前 resolve
        const codeResult = VisitResource(resolver);
        const returnStr = analysisExmpressForReturnData(resolver.expression)
          .join("\n")
          .toString();
        codeResult.push(returnStr);
        const wrapperStr = `async (parent, args = {}, context, info) => { ${codeResult
          .join("\n")
          .toString()} }`;

        console.info("wrapperSter", wrapperStr);

        allResolvers[uuid] = wrapperStr;
      }
    }

    genSingleResolver(resolver);
  });
  return allResolvers;
}

//  genResolver in the end
function PathNodeUpdate(
  allEndpoints: any,
  isMutation: boolean,
  fullResolverTemplateGroup: any
) {
  const properties: any[] = [];
  Object.keys(allEndpoints).forEach((operationId: string) => {
    if (!!allEndpoints[operationId].mutation === !!isMutation) {
      const operateAST: any = {
        type: "ObjectProperty",
        key: {
          type: "Identifier",
          name: operationId,
        },
        value: resolverAst(fullResolverTemplateGroup[operationId]),
      };

      properties.push(operateAST);
    }
  });

  return properties;
}

const RootTemplete = `
import requester from './requester';

export const resolvers = {
  Query: {},
  Mutation: {},
}
`;

/**
 *
 * export const resolvers = {
 *   Query: {
 *     [EntityName/SturctureName]: func
 *   }
 * }
 *
 */
export const ResolverAST = async (
  allEndpoints: any,
  fullResolverTemplateGroup: any
) => {
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
            const result = PathNodeUpdate(
              allEndpoints,
              false,
              fullResolverTemplateGroup
            );
            // 普通赋值可能更新不成功
            result.forEach((proper) => {
              const pathNodeValue: any = path.node.value;
              pathNodeValue.properties.push(proper);
            });
          }
        }

        if (
          path.node.key.type === "Identifier" &&
          path.node.key.name === "Mutation"
        ) {
          if (path.node.value.type === "ObjectExpression") {
            const result = PathNodeUpdate(
              allEndpoints,
              true,
              fullResolverTemplateGroup
            );
            result.forEach((proper) => {
              const pathNodeValue: any = path.node.value;
              pathNodeValue.properties.push(proper);
            });
          }
        }
      },
    },
  });

  return ast;
};
