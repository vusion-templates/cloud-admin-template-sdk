import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import { AtomTemplate, resolverAst } from './parseArrowFun';
import { ResolverType } from "../dsl-to-gql/interfaceStructure";


/**
 *  #/zxrbk/entities/Employee
 *  
 * zxrbk_entities_getEmployee
 */
function getUUID(sourceKey: string, resolverName: string) {
  const arr = sourceKey.split('/');
  return `${arr[1]}_${arr[2]}_${resolverName}`;
}


type ExpressionAST = {
  name: string;
  resolverName: string;
  type: string;
  resolvers: any[];
}

function getResovlerUUId(object: any) {
  const resolvers = object.resolvers;
  const resolver = resolvers.find((o: any) => { return o.name === object.resolverName }) || {};
  const resolverUUID = resolver.uuid;
  return resolverUUID;
}

function findResolver(object: any) {
  const resolvers = object.resolvers || [];
  const resolver = resolvers.find((o: any) => { return o.name === object.resolverName }) || {};
  return resolver;
}

const assignTemplate = [
  `function arrayTemplate(args, fn) {
    return Object.values(args.uuidData).map(fn)
  }`,
  `function objectTemplate(args, fn){
    return fn(args.uuidData);
  }`
];

function ArrayAssign(uuidData: string, conbineStr: string) {
  return `arrayTemplate({
    uuidData: ${uuidData}
  }, (o) => {
    return ${conbineStr}
  })
  `;
}

function ObjectAssign(uuidData: string, combineStr: string) {
  return `objectTemplate({
    uuidData: ${uuidData}
  }, (o) => {
    return ${combineStr}
  })
  `;
}

/**
 * 右侧参数是数组, 需要按照数组方式取值，并且得到的结果按照请求参数的标记 key 存储
 * 右侧参数是对象，那么按照对象方式取值
 */
const callTemplate = [
  `function arrayCall(rightParams, fn) {
     const data = {};
     Object.values(rightParams).forEach(fn)
     return data;
  }`,
  `function objectCall(rightParams, fn) {
    return fn(rightParams)
  }`
]
/**
 * 如果 right 参数是数组，组合调用的模版
 */
function ArrayCall(rightUUID: string, leftUUID: string, combineStr: string) {
  return `arrayCall(args.${rightUUID}, (o) => {
      data.${leftUUID} = ${combineStr};
  })`
}

/**
 * 
 * @param rightUUID 定义传入的参数对象，还包括 ast 解析结构
 * @param leftUUID  定义返回结果被存储的地方
 * @param combineStr 定义请求函数
 */
function ObjectCall(rightUUID: string, leftUUID: string, combineStr: string) {
  return `args.${leftUUID}_Data = objectCall(args.${rightUUID}, (o) => {
    return ${combineStr};
  })`
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
        
        /**
         * 分析结构是数组还是对象，分别进行处理
         * 如果在解析的过程中发展复杂对象，进入对当前对象的进一步处理
         */
        function anlysisProperties(expression: any) {
          function anlysisPropertiesTo(properties: any = []) {
            const tempCode = ['{'];
            Object.keys(properties || []).forEach((properKey) => {
              const proper = properties[properKey];
              // 如果是个复杂的 proper
              if (proper.properties) {
                // 结构继续进入复杂 proper 的分析
                tempCode.push(`${properKey}: ${anlysisProperties(proper)},`);
              } else {
                tempCode.push(`${properKey}: o.${proper.ast.property.name},`);
              }

            })
            tempCode.push('}');
            return tempCode.join('\n').toString();
          }
          const { ast, properties, items, type } = expression;
          const result = [];
          if (type === 'object') {
            // 如果是对象进入对象的赋值，并且赋值关系是从 properties 开始，通常当前原始的 ast 都标记了属于的来源
            result.push(ObjectAssign(`args.${getResovlerUUId(ast)}_Data`, anlysisPropertiesTo(properties)));
          }
          if (type === 'array') {
            // 如果数数组，进入数组的函数，并且复制关系是从 items 开始的
            result.push(ArrayAssign(`args.${getResovlerUUId(ast)}_Data`, anlysisPropertiesTo(items.properties)));
          }
          return result.join('\n').toString()
        }

        resultCode.push(`return ${anlysisProperties(expression)}`);

        return resultCode;
      }

      /**
       * 需要一个 source 队列维护解析顺序 
       * 如果依赖请求都结构体已经存在，那么直接访问，否则进入访问队列，下次再访问
       */
      function VisitResource(resolver: any = {}) {
        const codeResult: any[] = [];
        let params: any[] = [];
        const sourceQueue = Object.values(resolver.source) || [];
        // expression 用来解析真实的返回结构
        while (sourceQueue.length) {
          const sourceItem: any = sourceQueue.shift();
          const { assignments } = sourceItem;
          let isVisitable = true;
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
              if (right.includes('$params')) {
                /**
                 * 右侧参数需要通过 $params 替换求值
                 * stayRecord.id 先转化成下面的结构
                 */
                const leftName = ast.left.object.name;
                const resolverUUID = getResovlerUUId(ast.left.object);

                // 这里对 leftKey 的解析严格依赖当前的结构 uuid，因为下次也是会被当前的结构按照同样的方式去使用的
                const leftKey = left.split('.').join('_').replace(new RegExp(`^${leftName}`), `args.${resolverUUID}`);
                codeResult.push(`${leftKey} = ${right.replace('$params', 'args')}`);

                // args 参数被用了
                map[leftKey] = true;
                params.push(leftKey);

              } else {
                // 在右边的参数，多个 resolver 里面找到当前要用的 resolver
                const resolverUUID = getResovlerUUId(ast.right.object);
                // 如果已经被求过值了，那么参数直接用，
                if (map[`${resolverUUID}_Data`]) {
                  // Notice 这里是针对对象的聚合方式，如果是数组的话，需要单独处理
                  // 因为这里的 right name 在表达式里面使用，所以其实是用表达式的唯一标记方式
                  const rightName = ast.right.object.name;
                  const paramName = right.replace(new RegExp(`^${rightName}`), `args.${resolverUUID}_Data`);

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
            })
          }
          // 如果当前参数都已经被求过了，那么当前都就正常访问
          if (isVisitable) {
            map[`${uuid}_Data`] = true;
            /**
             * 如果传入的参数结构是数组，那么这里需要循环遍历参数标记的结果，同步设置多个异步，结果返回的时候，也是需要使用数组赋值的方式的
             * 
             * 所以有结构的表达式，同样需要依赖传入的参数 key，获取数组的结果
             */
            codeResult.push(`args.${uuid}_Data = this.Query.${uuid}(null, ${params.length > 0 && params.join(',')});`);
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
        allResolvers[uuid] = AtomTemplate(resolver)
      } else {
        // 访问完全部的 source 以后，添加上表达式
        // 解析当前 resolve 
        const codeResult = VisitResource(resolver);
        const returnStr = analysisExmpressForReturnData(resolver.expression).join('\n').toString();
        codeResult.push(returnStr);

        const warpperStr = `async (parent, args, context, info) => { ${codeResult.join('\n').toString()} }`;
        allResolvers[uuid] = warpperStr;
      }
    }

    genSingleResolver(resolver);
  });
  return allResolvers;
}

//  genResolver in the end
function PathNodeUpdate(allEndpoints: any, isMutation: boolean, fullResolverTemplateGroup: any) {
  const properties: any[] = [];
  Object.keys(allEndpoints).forEach((operationId: string) => {
    if (!!allEndpoints[operationId].mutation === !!isMutation) {
      const operateAST: any = {
        type: 'ObjectProperty',
        key: {
          type: 'Identifier',
          name: operationId,
        },
        value: resolverAst(fullResolverTemplateGroup[operationId])
      };

      properties.push(operateAST);
    }
  })

  return properties;
}

const RootTemplete = `
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
export const ResolverAST = async (allEndpoints: any, fullResolverTemplateGroup: any) => {
  // output resolver
  const ast = parser.parse(RootTemplete, {
    sourceType: 'module'
  });

  traverse(ast, {
    ObjectProperty: {
      enter: (path) => {
        if (path.node.key.type === 'Identifier' && path.node.key.name === 'Query') {
          if (path.node.value.type === 'ObjectExpression') {
            const result = PathNodeUpdate(allEndpoints, false, fullResolverTemplateGroup);
            // 普通赋值可能更新不成功
            result.forEach((proper) => {
              const pathNodeValue: any = path.node.value;
              pathNodeValue.properties.push(proper);
            })
          }
        }

        if (path.node.key.type === 'Identifier' && path.node.key.name === 'Mutation') {
          if (path.node.value.type === 'ObjectExpression') {
            const result = PathNodeUpdate(allEndpoints, true, fullResolverTemplateGroup);
            result.forEach((proper) => {
              const pathNodeValue: any = path.node.value;
              pathNodeValue.properties.push(proper);
            })
          }
        }
      },
    },
  });

  return ast;
};
