

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
  query
}: {  path: string; setFlag?: boolean; query: object}) => {
  return `async (parent, args, context, info) => {
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
    return data && data.Data;
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