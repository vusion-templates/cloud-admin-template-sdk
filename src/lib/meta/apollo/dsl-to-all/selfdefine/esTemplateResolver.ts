
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
  query,
  example // 设置默认的返回参数，在服务启动起来之前需要使用测试数据
}: { path: string; query: any | string; example: any | string }) => {

  return `async (parent, args, context, info) => {
     try {
      if (process.env.NODE_ENV === 'development' || process.env.VUE_APP_DESIGNER) {
        const data =  ${example};
        return data;
      } else {
        ${path === 'PATH' ? 'const PATH = "";' : ''}
        ${query == 'QUERYPARAM' ? 'const QUERYPARAM = {};' : ''}
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
