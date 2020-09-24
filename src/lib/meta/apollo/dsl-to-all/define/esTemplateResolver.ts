import {
  PathToBinaryExpressionString,
  QueryToObjectExpression,
} from "../generator/paramsTansform";
import { ResolverType } from "../dsl-to-gql/interfaceStructure";

export const RootTemplete = `
import requester from './requester';

export const resolvers = {
  Query: {}
};`;

interface EntityResolver extends Resolver {
  type: ResolverType.INTERFACE;
  interface: {
    path: string;
    method: string;
  };
  name: string;
  params: any[];
  ast: any;
}

interface StructureResolver extends Resolver {
  join: [];
  expressions: [];
  source: [];
}

interface Resolver {
  type: string;
  params: any[];
}

type Endpoint = {
  type: string;
  parameters: any;
  query: any[];
  examples: any;
  mutation: boolean;
  resolver: EntityResolver;
};

function EntityMutationTemplate(params: any, beAssign: string) {
  return `${params.path === "PATH" ? 'const PATH = "";' : ""}
  ${params.query == "QUERYPARAM" ? "const QUERYPARAM = {};" : ""}
  const { ${beAssign} } = await requester({
    url: {
      path: ${params.path},
      method: ${params.method},
      body: args.body
    },
    config: {
      baseURL:'/',
    }
  });
  return ${beAssign};`;
}

function EntityQueryTemplate(params: any, beAssign: string, mutation: boolean) {
  return `${params.path === "PATH" ? 'const PATH = "";' : ""}
  ${params.query == "QUERYPARAM" ? "const QUERYPARAM = {};" : ""}

  const body = args.body;
  delete args.body;
  const { ${beAssign} } = await requester({
    url: {
      path: ${params.path},
      method: "${params.method}",
      body: args.body,
      query: args
    },
    config: {
      baseURL:'/',
    }
  });`;
}


// contain generator in all params
export function FullTemplate({
  resolver,
  parameters,
  examples, // 设置默认的返回参数，在服务启动起来之前需要使用测试数据
  meL,
  beAssign,
  mutation,
}: {
  resolver: EntityResolver;
  parameters: any | string;
  examples: any | string;
  meL: string;
  beAssign: string;
  mutation: boolean;
}) {
  const path = resolver.interface.path;
  mutation = ["POST", "PUT", "PATCH", "DELETE"].includes(resolver.interface.method);

  if (mutation) {
    const params = {
      path: path ? PathToBinaryExpressionString(path, meL) : "PATH",
      query: QueryToObjectExpression(parameters, meL),
      // body: BodyToObjectExpression(parameters),
      examples: JSON.stringify(examples),
      method: resolver.interface.method,
    };
    return `${EntityQueryTemplate(params, beAssign, mutation)}`;
  } else {
    // 参数转化为 ast 结构
    const params = {
      path: path ? PathToBinaryExpressionString(path, meL) : "PATH",
      query: QueryToObjectExpression(parameters, meL),
      examples: JSON.stringify(examples),
      method: resolver.interface.method,
    };


    // return `
    // ${EntityQueryTemplate(params, beAssign)}
    // return data;
    // `;

    return `if (process.env.NODE_ENV === 'development' || process.env.VUE_APP_DESIGNER) {
      const ${beAssign} = ${params.examples};
      return ${beAssign};
    } else {
      ${EntityQueryTemplate(params, beAssign, mutation)}  
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
 */
export const FunTemplate = (endpoint: Endpoint) => {
  if (endpoint.type === ResolverType.INTERFACE) {
    const examples = endpoint.examples;

    return `async (parent, args, context, info) => {
       try {
        ${FullTemplate({
          resolver: endpoint.resolver,
          parameters: endpoint.parameters,
          examples,
          mutation: endpoint.mutation,
          meL: "args",
          beAssign: "data",
        })}
      } catch (err) {
        console.error(err);
      }
    }
  `;
  }

  // JSON + JSON
};

/**
 * 查询结构体
 */
export const StructureResolverTemplate = () => {
  return `
    async (parent, args, context, info) => {
      // TODO 
    }
  }
`;
};

export const OtherWebResolverTemplate = `
  async () => {

  }
`;
