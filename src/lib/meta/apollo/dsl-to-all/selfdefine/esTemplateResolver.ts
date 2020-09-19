import { ESASTNode } from "../ast-to-resolver";


export const RootTemplete = `
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
export const EntityfunTemplate = ({
  path,
  setFlag = true,
  query,
  example
}: { path: string; setFlag?: boolean; query: ESASTNode | string; example: ESASTNode | string }) => {

  return `async (parent, args, context, info) => {
     try {
      if (process.env.NODE_ENV === 'development' || process.env.VUE_APP_DESIGNER) {
        const data =  ${example};
        return data;
      } else {
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
        return data;
      }
    } catch (err) {
      console.error(err);
    }
  }
`;
}

/**
 * 查询结构体内部需要补充和完善
 */
export const StructureResolverTemplate = `
  async () => {
  }
`;


export const OtherWebResolverTemplate = `
  async () => {
  }
` ;